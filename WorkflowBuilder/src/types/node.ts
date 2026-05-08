export type NodeCategory = 'trigger' | 'action' | 'condition';
export type NodeConfigStatus = 'configured' | 'error' | 'unconfigured';

export interface NodeField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'number';
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
}

export interface NodeDefinition {
  type: string;
  category: NodeCategory;
  label: string;
  description: string;
  icon: string;
  borderColor: string;
  accentColor: string;
  bgColor: string;
  fields: NodeField[];
}

export interface FlowStep {
  id: string;
  isTrigger: boolean;
  definitionType: string;
  label: string;
  description: string;
  configStatus: NodeConfigStatus;
  config: Record<string, string>;
}

export type RightPanelState =
  | { type: 'add'; insertAfterIndex: number }
  | { type: 'config'; stepId: string }
  | null;

// Keep for backwards compat with old canvas (unused now)
export interface FlowNodeData extends Record<string, unknown> {
  definitionType: string;
  label: string;
  description: string;
  configStatus: NodeConfigStatus;
  config: Record<string, string>;
}
