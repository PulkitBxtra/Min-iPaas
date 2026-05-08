import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';

export const STEP_NODE_W = 480;
export const STEP_NODE_H = 76;
const END_NODE_W = 36;
const END_NODE_H = 36;

export function getLayoutedElements(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', ranksep: 72, nodesep: 40, marginx: 24, marginy: 24 });

  nodes.forEach((n) => {
    const isEnd = n.type === 'flowEnd';
    g.setNode(n.id, { width: isEnd ? END_NODE_W : STEP_NODE_W, height: isEnd ? END_NODE_H : STEP_NODE_H });
  });
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    const isEnd = n.type === 'flowEnd';
    const w = isEnd ? END_NODE_W : STEP_NODE_W;
    const h = isEnd ? END_NODE_H : STEP_NODE_H;
    return { ...n, position: { x: pos.x - w / 2, y: pos.y - h / 2 } };
  });
}
