import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Trash2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ICON_MAP } from '@/lib/iconMap';
import { NODE_STATUS_DOT } from '@/lib/constants';
import { getDefinition } from '@/data/nodeDefinitions';
import { STEP_NODE_W } from '@/lib/dagre';
import type { FlowStep } from '@/types/node';

type FlowStepNodeData = FlowStep & {
  stepNumber: number;
  onDelete: () => void;
};

export function FlowStepNode({ data, selected }: NodeProps) {
  const step = data as FlowStepNodeData;
  const def = getDefinition(step.definitionType);
  const Icon = def ? (ICON_MAP[def.icon] ?? Globe) : Globe;

  const accentBg = def?.bgColor ?? 'bg-zinc-500/15';
  const accentText = def?.accentColor ?? 'text-zinc-400';
  const accentBorder = def?.borderColor ?? 'border-zinc-500';
  // Derive the matching bg- class from the border- class (e.g. border-blue-500 → bg-blue-500)
  const leftBarBg = accentBorder.replace('border-', 'bg-');

  return (
    <div
      style={{ width: STEP_NODE_W }}
      className={`
        group relative flex cursor-pointer items-center gap-4 rounded-xl border bg-card px-4 py-3.5 shadow-lg
        transition-all duration-150
        ${selected
          ? 'border-primary ring-2 ring-primary/25 shadow-primary/10'
          : 'border-border hover:border-border/80 hover:bg-accent'
        }
      `}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${leftBarBg}`} />

      {/* Step number */}
      <span className="ml-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
        {step.stepNumber}
      </span>

      {/* Icon */}
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${accentBg}`}>
        <Icon size={18} className={accentText} />
      </div>

      {/* Label + description */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{step.label}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{step.description}</p>
      </div>

      {/* Status dot */}
      <span
        className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ring-2 ring-background ${NODE_STATUS_DOT[step.configStatus]}`}
        title={step.configStatus}
      />

      {/* Delete (visible on hover) */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
        onClick={(e) => { e.stopPropagation(); step.onDelete(); }}
        tabIndex={-1}
      >
        <Trash2 size={13} />
      </Button>

      {/* Handles */}
      {!step.isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={false}
          className="!h-2 !w-2 !border-0 !bg-border"
        />
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className="!h-2 !w-2 !border-0 !bg-border"
      />
    </div>
  );
}
