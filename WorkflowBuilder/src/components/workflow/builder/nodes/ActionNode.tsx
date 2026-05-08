import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Globe } from 'lucide-react';
import { ICON_MAP } from '@/lib/iconMap';
import { NodeStatusDot } from '../NodeStatusDot';
import { NODE_DEFINITIONS } from '@/data/nodeDefinitions';
import type { FlowNodeData } from '@/types/node';

export function ActionNode({ data, selected }: NodeProps) {
  const nodeData = data as FlowNodeData;
  const def = NODE_DEFINITIONS.find((d) => d.type === nodeData.definitionType);
  const Icon = def ? (ICON_MAP[def.icon] ?? Globe) : Globe;

  return (
    <div
      className={`w-56 rounded-xl border-2 border-purple-500 bg-card p-3 shadow-lg transition-all ${
        selected ? 'ring-2 ring-white/20' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-zinc-600 !border-2 !border-background hover:!bg-green-500"
      />
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{nodeData.label}</p>
          <p className="text-xs text-muted-foreground truncate">{nodeData.description}</p>
        </div>
        <NodeStatusDot status={nodeData.configStatus} />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-zinc-600 !border-2 !border-background hover:!bg-green-500"
      />
    </div>
  );
}
