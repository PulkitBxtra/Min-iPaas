import { useState } from 'react';
import { MOCK_WORKFLOWS } from '@/data/mockWorkflows';
import type { Workflow } from '@/types/workflow';

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>(() => [...MOCK_WORKFLOWS]);

  function getWorkflow(id: string): Workflow | undefined {
    return workflows.find((w) => w.id === id);
  }

  function updateWorkflow(id: string, patch: Partial<Workflow>) {
    setWorkflows((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }

  function deleteWorkflow(id: string) {
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  }

  function createWorkflow(name: string): Workflow {
    const newWf: Workflow = {
      id: `wf-${Date.now()}`,
      name,
      status: 'disabled',
      trigger: 'Webhook',
      lastRun: null,
      steps: 0,
      createdAt: new Date().toISOString(),
    };
    setWorkflows((prev) => [newWf, ...prev]);
    return newWf;
  }

  return { workflows, getWorkflow, updateWorkflow, deleteWorkflow, createWorkflow };
}
