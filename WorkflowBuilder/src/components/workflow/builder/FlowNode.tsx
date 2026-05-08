import { Trash2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ICON_MAP } from '@/lib/iconMap';
import { NODE_STATUS_DOT } from '@/lib/constants';
import { getDefinition } from '@/data/nodeDefinitions';
import type { FlowStep } from '@/types/node';

interface Props {
  step: FlowStep;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function FlowNode({ step, index, isSelected, onClick, onDelete }: Props) {
  const def = getDefinition(step.definitionType);
  const Icon = def ? (ICON_MAP[def.icon] ?? Globe) : Globe;

  const borderAccent = def?.borderColor ?? 'border-zinc-600';
  const iconBg = def?.bgColor ?? 'bg-zinc-500/15';
  const iconColor = def?.accentColor ?? 'text-zinc-400';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={`
        group relative flex w-full max-w-lg cursor-pointer items-center gap-4 rounded-xl border bg-card px-4 py-3.5
        transition-all duration-150 hover:bg-accent
        ${isSelected ? 'border-primary ring-2 ring-primary/30' : `border-border hover:${borderAccent}`}
      `}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${isSelected ? 'bg-primary' : (def?.borderColor?.replace('border-', 'bg-') ?? 'bg-zinc-600')}`} />

      {/* Step index badge */}
      <span className="ml-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
        {index + 1}
      </span>

      {/* Icon */}
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{step.label}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{step.description}</p>
      </div>

      {/* Status dot */}
      <span
        className={`h-2 w-2 flex-shrink-0 rounded-full ${NODE_STATUS_DOT[step.configStatus]}`}
        title={step.configStatus}
      />

      {/* Delete — visible on hover */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        tabIndex={-1}
      >
        <Trash2 size={13} />
      </Button>
    </div>
  );
}
