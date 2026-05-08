import { Zap } from 'lucide-react';
import { NODE_DEFINITIONS } from '@/data/nodeDefinitions';
import { ICON_MAP } from '@/lib/iconMap';
import type { NodeCategory } from '@/types/node';

const CATEGORIES: { key: NodeCategory; label: string }[] = [
  { key: 'trigger', label: 'Triggers' },
  { key: 'action', label: 'Actions' },
  { key: 'condition', label: 'Conditions' },
];

const CATEGORY_COLORS: Record<NodeCategory, string> = {
  trigger: 'text-blue-400',
  action: 'text-purple-400',
  condition: 'text-yellow-400',
};

const CATEGORY_BG: Record<NodeCategory, string> = {
  trigger: 'bg-blue-500/10',
  action: 'bg-purple-500/10',
  condition: 'bg-yellow-500/10',
};

export function NodePalette() {
  function onDragStart(e: React.DragEvent, nodeType: string) {
    e.dataTransfer.setData('application/reactflow-nodetype', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  }

  return (
    <aside className="flex w-60 flex-col gap-5 overflow-y-auto border-r border-border bg-background p-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
        Node Palette
      </p>
      {CATEGORIES.map(({ key, label }) => {
        const defs = NODE_DEFINITIONS.filter((d) => d.category === key);
        return (
          <div key={key} className="flex flex-col gap-1.5">
            <h3 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </h3>
            {defs.map((def) => {
              const Icon = ICON_MAP[def.icon] ?? Zap;
              return (
                <div
                  key={def.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, def.type)}
                  className="flex cursor-grab items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 active:cursor-grabbing hover:bg-accent hover:border-border/60 transition-colors select-none"
                >
                  <div className={`flex h-6 w-6 items-center justify-center rounded-md ${CATEGORY_BG[key]} ${CATEGORY_COLORS[key]}`}>
                    <Icon size={13} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground">{def.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{def.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </aside>
  );
}
