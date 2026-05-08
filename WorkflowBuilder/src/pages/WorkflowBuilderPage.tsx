import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BuilderTopBar } from '@/components/workflow/builder/BuilderTopBar';
import { TriggerSelector } from '@/components/workflow/builder/TriggerSelector';
import { FlowCanvas } from '@/components/workflow/builder/FlowCanvas';
import { AddNodePanel } from '@/components/workflow/builder/AddNodePanel';
import { NodeConfigPanel } from '@/components/workflow/builder/NodeConfigPanel';
import { getDefinition } from '@/data/nodeDefinitions';
import type { FlowStep, RightPanelState } from '@/types/node';

function makeStep(definitionType: string, isTrigger: boolean): FlowStep {
  const def = getDefinition(definitionType);
  return {
    id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    isTrigger,
    definitionType,
    label: def?.label ?? definitionType,
    description: def?.description ?? '',
    configStatus: 'unconfigured',
    config: {},
  };
}

export function WorkflowBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [workflowName, setWorkflowName] = useState(
    id ? `Workflow ${id.replace('wf-', '#')}` : 'Untitled Workflow',
  );
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [rightPanel, setRightPanel] = useState<RightPanelState>(null);

  // ── Mutations ────────────────────────────────────────────────────────────────

  function handleSelectTrigger(triggerType: string) {
    const trigger = makeStep(triggerType, true);
    setSteps([trigger]);
    setRightPanel({ type: 'config', stepId: trigger.id });
  }

  function handleAddStep(afterIndex: number, definitionType: string) {
    const newStep = makeStep(definitionType, false);
    setSteps((prev) => {
      const next = [...prev];
      next.splice(afterIndex + 1, 0, newStep);
      return next;
    });
    setRightPanel({ type: 'config', stepId: newStep.id });
  }

  function handleUpdateStep(stepId: string, patch: Partial<FlowStep>) {
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, ...patch } : s)));
  }

  const handleDeleteStep = useCallback((stepId: string) => {
    setSteps((prev) => {
      const next = prev.filter((s) => s.id !== stepId);
      // Deleting the trigger resets the whole flow
      if (prev[0]?.id === stepId) return [];
      return next;
    });
    setRightPanel((prev) =>
      prev?.type === 'config' && prev.stepId === stepId ? null : prev,
    );
  }, []);

  const handleNodeClick = useCallback((stepId: string) => {
    setRightPanel((prev) =>
      prev?.type === 'config' && prev.stepId === stepId
        ? null
        : { type: 'config', stepId },
    );
  }, []);

  const handlePlusClick = useCallback((afterIdx: number) => {
    setRightPanel((prev) =>
      prev?.type === 'add' && prev.insertAfterIndex === afterIdx
        ? null
        : { type: 'add', insertAfterIndex: afterIdx },
    );
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────────

  const selectedStepId = rightPanel?.type === 'config' ? rightPanel.stepId : null;
  const activeAddIndex = rightPanel?.type === 'add' ? rightPanel.insertAfterIndex : null;
  const selectedStep = selectedStepId ? steps.find((s) => s.id === selectedStepId) : null;

  return (
    <div className="flex h-screen flex-col bg-background">
      <BuilderTopBar
        workflowName={workflowName}
        onNameChange={setWorkflowName}
        onBack={() => navigate('/workflows')}
        onSave={() => {}}
        onRun={() => {}}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Canvas ─────────────────────────────────────────────────────── */}
        {steps.length === 0 ? (
          <div className="workflow-canvas-dots relative flex flex-1 items-center justify-center">
            <TriggerSelector onSelect={handleSelectTrigger} />
          </div>
        ) : (
          <FlowCanvas
            steps={steps}
            selectedStepId={selectedStepId}
            activeAddIndex={activeAddIndex}
            onNodeClick={handleNodeClick}
            onPlusClick={handlePlusClick}
            onDeleteStep={handleDeleteStep}
          />
        )}

        {/* ── Right panels ───────────────────────────────────────────────── */}
        {rightPanel?.type === 'add' && (
          <AddNodePanel
            onAdd={(type) => handleAddStep(rightPanel.insertAfterIndex, type)}
            onClose={() => setRightPanel(null)}
          />
        )}

        {rightPanel?.type === 'config' && selectedStep && (
          <NodeConfigPanel
            step={selectedStep}
            onUpdate={(patch) => handleUpdateStep(selectedStep.id, patch)}
            onClose={() => setRightPanel(null)}
          />
        )}
      </div>
    </div>
  );
}
