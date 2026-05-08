import { X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NODE_DEFINITIONS } from '@/data/nodeDefinitions';
import { ICON_MAP } from '@/lib/iconMap';
import type { NodeDefinition } from '@/types/node';

interface Props {
  onAdd: (definitionType: string) => void;
  onClose: () => void;
}

const CATEGORIES: { key: 'action' | 'condition'; label: string }[] = [
  { key: 'action', label: 'Actions' },
  { key: 'condition', label: 'Conditions' },
];

function NodeOption({ def, onAdd }: { def: NodeDefinition; onAdd: (type: string) => void }) {
  const Icon = ICON_MAP[def.icon] ?? Globe;
  return (
    <button
      onClick={() => onAdd(def.type)}
      className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors hover:border-border hover:bg-accent"
    >
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${def.bgColor}`}>
        <Icon size={15} className={def.accentColor} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{def.label}</p>
        <p className="truncate text-xs text-muted-foreground">{def.description}</p>
      </div>
    </button>
  );
}

export function AddNodePanel({ onAdd, onClose }: Props) {
  return (
    <aside className="flex h-full w-80 flex-shrink-0 flex-col border-l border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <div>
          <p className="text-sm font-semibold text-foreground">Add a step</p>
          <p className="text-xs text-muted-foreground">Choose an action or condition</p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={onClose}>
          <X size={14} />
        </Button>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-3">
        {CATEGORIES.map(({ key, label }) => {
          const defs = NODE_DEFINITIONS.filter((d) => d.category === key);
          return (
            <div key={key} className="mb-5">
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {label}
              </p>
              <div className="flex flex-col gap-0.5">
                {defs.map((def) => (
                  <NodeOption key={def.type} def={def} onAdd={onAdd} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
