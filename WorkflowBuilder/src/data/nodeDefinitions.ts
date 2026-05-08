import type { NodeDefinition } from '@/types/node';

// ─── Trigger Definitions ─────────────────────────────────────────────────────
// Shown as the initial 4-card selector when a workflow has no steps yet.

export const TRIGGER_DEFINITIONS: NodeDefinition[] = [
  {
    type: 'executable',
    category: 'trigger',
    label: 'Executable',
    description: 'Run a script or command',
    icon: 'Terminal',
    borderColor: 'border-orange-500',
    accentColor: 'text-orange-400',
    bgColor: 'bg-orange-500/15',
    fields: [
      { key: 'command', label: 'Command', type: 'text', placeholder: 'node script.js', required: true },
      { key: 'args', label: 'Arguments', type: 'text', placeholder: '--env production' },
      { key: 'working_dir', label: 'Working Directory', type: 'text', placeholder: '/app' },
      { key: 'env', label: 'Environment Variables', type: 'textarea', placeholder: 'KEY=value\nANOTHER=val' },
    ],
  },
  {
    type: 'webhook',
    category: 'trigger',
    label: 'Webhook',
    description: 'Receive HTTP requests',
    icon: 'Webhook',
    borderColor: 'border-blue-500',
    accentColor: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    fields: [
      { key: 'path', label: 'Endpoint Path', type: 'text', placeholder: '/hooks/my-event', required: true },
      {
        key: 'method', label: 'Method', type: 'select', required: true,
        options: [{ label: 'POST', value: 'POST' }, { label: 'GET', value: 'GET' }, { label: 'PUT', value: 'PUT' }],
      },
      { key: 'secret', label: 'Webhook Secret', type: 'text', placeholder: 'Optional HMAC secret' },
    ],
  },
  {
    type: 'app',
    category: 'trigger',
    label: 'App',
    description: 'Connect to an external app',
    icon: 'LayoutGrid',
    borderColor: 'border-purple-500',
    accentColor: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    fields: [
      {
        key: 'app_name', label: 'App', type: 'select', required: true,
        options: [
          { label: 'Salesforce', value: 'salesforce' },
          { label: 'HubSpot', value: 'hubspot' },
          { label: 'Gmail', value: 'gmail' },
          { label: 'Slack', value: 'slack' },
          { label: 'Stripe', value: 'stripe' },
          { label: 'GitHub', value: 'github' },
        ],
      },
      { key: 'event', label: 'Trigger Event', type: 'text', placeholder: 'e.g. record.created', required: true },
      { key: 'filter', label: 'Filter Condition', type: 'text', placeholder: 'Optional JSON filter' },
    ],
  },
  {
    type: 'schedule',
    category: 'trigger',
    label: 'Schedule',
    description: 'Run on a cron schedule',
    icon: 'Clock',
    borderColor: 'border-green-500',
    accentColor: 'text-green-400',
    bgColor: 'bg-green-500/15',
    fields: [
      { key: 'cron', label: 'Cron Expression', type: 'text', placeholder: '0 9 * * 1-5', required: true },
      { key: 'timezone', label: 'Timezone', type: 'text', placeholder: 'America/New_York' },
      {
        key: 'start_date', label: 'Start Date', type: 'text', placeholder: '2026-01-01',
      },
    ],
  },
];

// ─── Step Definitions ─────────────────────────────────────────────────────────
// Shown in the "Add a step" right panel, grouped by category.

export const NODE_DEFINITIONS: NodeDefinition[] = [
  // Actions
  {
    type: 'http_request',
    category: 'action',
    label: 'HTTP Request',
    description: 'Make an outbound API call',
    icon: 'Globe',
    borderColor: 'border-purple-500',
    accentColor: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    fields: [
      { key: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com/endpoint', required: true },
      {
        key: 'method', label: 'Method', type: 'select', required: true,
        options: [
          { label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' }, { label: 'DELETE', value: 'DELETE' },
        ],
      },
      { key: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer ..."}' },
      { key: 'body', label: 'Body (JSON)', type: 'textarea', placeholder: '{"key": "value"}' },
    ],
  },
  {
    type: 'transform',
    category: 'action',
    label: 'Transform',
    description: 'Map and reshape data',
    icon: 'Shuffle',
    borderColor: 'border-purple-500',
    accentColor: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    fields: [
      { key: 'mapping', label: 'Field Mapping (JSON)', type: 'textarea', placeholder: '{"output.name": "input.fullName"}', required: true },
    ],
  },
  {
    type: 'slack',
    category: 'action',
    label: 'Slack',
    description: 'Send a Slack message',
    icon: 'MessageSquare',
    borderColor: 'border-purple-500',
    accentColor: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    fields: [
      { key: 'channel', label: 'Channel', type: 'text', placeholder: '#general', required: true },
      { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Hello from Min iPaaS!', required: true },
    ],
  },
  {
    type: 'email_send',
    category: 'action',
    label: 'Email',
    description: 'Send an outbound email',
    icon: 'Send',
    borderColor: 'border-purple-500',
    accentColor: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    fields: [
      { key: 'to', label: 'To', type: 'text', placeholder: 'recipient@example.com', required: true },
      { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Hello', required: true },
      { key: 'body', label: 'Body', type: 'textarea', placeholder: 'Email content...', required: true },
    ],
  },

  // Conditions
  {
    type: 'filter',
    category: 'condition',
    label: 'Filter',
    description: 'Stop execution if condition fails',
    icon: 'Filter',
    borderColor: 'border-amber-500',
    accentColor: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
    fields: [
      { key: 'field', label: 'Field Path', type: 'text', placeholder: 'data.status', required: true },
      {
        key: 'operator', label: 'Operator', type: 'select', required: true,
        options: [
          { label: 'equals', value: 'eq' }, { label: 'not equals', value: 'neq' },
          { label: 'contains', value: 'contains' }, { label: 'greater than', value: 'gt' },
          { label: 'less than', value: 'lt' },
        ],
      },
      { key: 'value', label: 'Value', type: 'text', placeholder: 'active', required: true },
    ],
  },
  {
    type: 'router',
    category: 'condition',
    label: 'Router',
    description: 'Branch to multiple paths',
    icon: 'GitBranch',
    borderColor: 'border-amber-500',
    accentColor: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
    fields: [
      { key: 'conditions', label: 'Route Conditions (JSON)', type: 'textarea', placeholder: '[{"path": "data.type", "equals": "premium"}]', required: true },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getDefinition(type: string): NodeDefinition | undefined {
  return [...TRIGGER_DEFINITIONS, ...NODE_DEFINITIONS].find((d) => d.type === type);
}
