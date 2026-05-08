import { useEffect, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { FlowStepNode } from './nodes/FlowStepNode';
import { FlowEndNode } from './nodes/FlowEndNode';
import { AddStepEdge } from './AddStepEdge';
import { getLayoutedElements } from '@/lib/dagre';
import type { FlowStep } from '@/types/node';

// ── Node / edge type maps — defined at module scope (React Flow requirement) ──
const nodeTypes = {
  flowStep: FlowStepNode,
  flowEnd: FlowEndNode,
};

const edgeTypes = {
  addStepEdge: AddStepEdge,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildRawElements(
  steps: FlowStep[],
  selectedStepId: string | null,
  activeAddIndex: number | null,
  onDelete: (id: string) => void,
  onPlusClick: (idx: number) => void,
) {
  const nodes: Node[] = steps.map((step, idx) => ({
    id: step.id,
    type: 'flowStep',
    position: { x: 0, y: 0 },
    selected: step.id === selectedStepId,
    data: {
      ...step,
      stepNumber: idx + 1,
      onDelete: () => onDelete(step.id),
    },
  }));

  // Terminal "+" node always at the end
  nodes.push({
    id: '__end__',
    type: 'flowEnd',
    position: { x: 0, y: 0 },
    data: {
      isActive: activeAddIndex === steps.length - 1 && activeAddIndex !== null,
      onAdd: () => onPlusClick(steps.length - 1),
    },
  });

  const edges: Edge[] = steps.map((step, idx) => ({
    id: `e-${idx}`,
    source: step.id,
    target: idx < steps.length - 1 ? steps[idx + 1].id : '__end__',
    type: 'addStepEdge',
    data: {
      insertAfterIndex: idx,
      isActive: activeAddIndex === idx,
      onPlusClick,
    },
  }));

  return { nodes, edges };
}

// ── Inner component (needs ReactFlowProvider context) ─────────────────────────

interface Props {
  steps: FlowStep[];
  selectedStepId: string | null;
  activeAddIndex: number | null;
  onNodeClick: (id: string) => void;
  onPlusClick: (afterIdx: number) => void;
  onDeleteStep: (id: string) => void;
}

function FlowCanvasInner({
  steps,
  selectedStepId,
  activeAddIndex,
  onNodeClick,
  onPlusClick,
  onDeleteStep,
}: Props) {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  // Rebuild layout whenever source data changes
  useEffect(() => {
    const { nodes, edges } = buildRawElements(
      steps,
      selectedStepId,
      activeAddIndex,
      onDeleteStep,
      onPlusClick,
    );
    const layouted = getLayoutedElements(nodes, edges);
    setRfNodes(layouted);
    setRfEdges(edges);

    // Smooth re-fit after layout is applied
    const t = setTimeout(() => fitView({ padding: 0.35, duration: 300 }), 30);
    return () => clearTimeout(t);
  }, [steps, selectedStepId, activeAddIndex, onDeleteStep, onPlusClick, fitView]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'flowStep') onNodeClick(node.id);
    },
    [onNodeClick],
  );

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={true}
      panOnDrag={true}
      zoomOnScroll={true}
      minZoom={0.3}
      maxZoom={2}
      style={{ background: 'transparent' }}
    >
      <Controls className="!border-border [&>button]:!bg-card [&>button]:!border-border [&>button]:!fill-muted-foreground [&>button:hover]:!bg-accent" />
      <MiniMap
        nodeColor={(n) => {
          if (n.type === 'flowEnd') return '#3f3f46';
          const step = n.data as FlowStep;
          if (step?.isTrigger) return '#3b82f6';
          return '#a855f7';
        }}
        className="!border-border !bg-card"
        maskColor="rgba(0,0,0,0.4)"
      />
    </ReactFlow>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export function FlowCanvas(props: Props) {
  return (
    <div className="workflow-canvas-dots relative flex-1">
      <ReactFlowProvider>
        <FlowCanvasInner {...props} />
      </ReactFlowProvider>
    </div>
  );
}
