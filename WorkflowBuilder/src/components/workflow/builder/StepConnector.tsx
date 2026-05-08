import { Plus } from 'lucide-react';

interface Props {
  isActive: boolean;
  onClick: () => void;
}

export function StepConnector({ isActive, onClick }: Props) {
  return (
    <div className="flex flex-col items-center">
      {/* Line above */}
      <div className="h-4 w-px bg-border" />

      {/* Plus button */}
      <button
        onClick={onClick}
        title="Add a step"
        className={`
          flex h-6 w-6 items-center justify-center rounded-full border transition-all
          ${isActive
            ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
            : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'
          }
        `}
      >
        <Plus size={12} />
      </button>

      {/* Line below */}
      <div className="h-4 w-px bg-border" />
    </div>
  );
}
