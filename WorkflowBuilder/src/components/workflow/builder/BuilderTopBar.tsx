import { ArrowLeft, Play, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface Props {
  workflowName: string;
  onNameChange: (name: string) => void;
  onBack: () => void;
  onSave: () => void;
  onRun: () => void;
}

export function BuilderTopBar({ workflowName, onNameChange, onBack, onSave, onRun }: Props) {
  return (
    <div className="flex h-14 items-center gap-3 border-b border-border bg-background px-4">
      <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:text-foreground">
        <ArrowLeft size={18} />
      </Button>
      <Separator orientation="vertical" className="h-5" />
      <Input
        value={workflowName}
        onChange={(e) => onNameChange(e.target.value)}
        className="w-64 border-transparent bg-transparent text-base font-medium focus-visible:border-border focus-visible:bg-card"
      />
      <div className="flex-1" />
      <Button variant="ghost" size="sm" onClick={onRun} className="gap-2 text-green-400 hover:text-green-300 hover:bg-green-500/10">
        <Play size={15} />
        Run
      </Button>
      <Button size="sm" onClick={onSave} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
        <Save size={15} />
        Save
      </Button>
    </div>
  );
}
