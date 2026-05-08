export type WorkflowStatus = 'active' | 'failed' | 'disabled' | 'running';

export interface Workflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  trigger: string;
  lastRun: string | null;
  steps: number;
  createdAt: string;
}
