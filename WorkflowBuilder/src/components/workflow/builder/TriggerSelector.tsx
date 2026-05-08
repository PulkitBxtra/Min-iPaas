import { TRIGGER_DEFINITIONS } from '@/data/nodeDefinitions';
import { ICON_MAP } from '@/lib/iconMap';
import { Terminal } from 'lucide-react';

interface Props {
  onSelect: (triggerType: string) => void;
}

export function TriggerSelector({ onSelect }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 p-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">Select a trigger</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Choose how this workflow gets started
        </p>
      </div>

      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        {TRIGGER_DEFINITIONS.map((def) => {
          const Icon = ICON_MAP[def.icon] ?? Terminal;
          return (
            <button
              key={def.type}
              onClick={() => onSelect(def.type)}
              className={`flex flex-col items-start gap-3 rounded-xl border ${def.borderColor} bg-card p-4 text-left transition-all hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${def.bgColor}`}>
                <Icon size={20} className={def.accentColor} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{def.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{def.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
