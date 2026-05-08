import { X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ICON_MAP } from '@/lib/iconMap';
import { NODE_STATUS_DOT } from '@/lib/constants';
import { getDefinition } from '@/data/nodeDefinitions';
import type { FlowStep } from '@/types/node';

interface Props {
  step: FlowStep;
  onUpdate: (patch: Partial<FlowStep>) => void;
  onClose: () => void;
}

export function NodeConfigPanel({ step, onUpdate, onClose }: Props) {
  const def = getDefinition(step.definitionType);
  if (!def) return null;

  const Icon = ICON_MAP[def.icon] ?? Globe;

  function handleFieldChange(key: string, value: string) {
    onUpdate({ config: { ...step.config, [key]: value } });
  }

  function markConfigured() {
    onUpdate({ configStatus: 'configured' });
  }

  return (
    <aside className="flex h-full w-80 flex-shrink-0 flex-col border-l border-border bg-background">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${def.bgColor}`}>
            <Icon size={16} className={def.accentColor} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{step.label}</p>
            <p className="truncate text-xs text-muted-foreground">{step.description}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 text-muted-foreground" onClick={onClose}>
          <X size={14} />
        </Button>
      </div>

      {/* Status banner */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
        <span className={`h-2 w-2 rounded-full ${NODE_STATUS_DOT[step.configStatus]}`} />
        <p className="text-xs text-muted-foreground capitalize">{step.configStatus}</p>
      </div>

      {/* Fields */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        {def.fields.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              {field.label}
              {field.required && <span className="ml-0.5 text-destructive">*</span>}
            </Label>

            {field.type === 'textarea' ? (
              <textarea
                value={step.config[field.key] ?? ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full resize-none rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            ) : field.type === 'select' ? (
              <select
                value={step.config[field.key] ?? ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select…</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <Input
                type={field.type}
                value={step.config[field.key] ?? ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="text-xs"
              />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <Separator className="mb-4" />
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          size="sm"
          onClick={markConfigured}
          disabled={step.configStatus === 'configured'}
        >
          {step.configStatus === 'configured' ? '✓ Configured' : 'Mark as Configured'}
        </Button>
      </div>
    </aside>
  );
}
