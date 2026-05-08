import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Command, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WorkflowStatusBadge } from '@/components/workflow/WorkflowStatusBadge';
import { useWorkflows } from '@/hooks/useWorkflows';
import { logout } from '@/lib/auth';

export function WorkflowsPage() {
  const navigate = useNavigate();
  const { workflows, createWorkflow, deleteWorkflow } = useWorkflows();

  function handleNewWorkflow() {
    const wf = createWorkflow('Untitled Workflow');
    navigate(`/workflows/${wf.id}/builder`);
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
            <Command size={16} className="text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Workflows</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleNewWorkflow}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            size="sm"
          >
            <Plus size={15} />
            New Workflow
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
            title="Sign out"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </header>

      {/* Table */}
      <main className="flex-1 overflow-auto px-8 py-6">
        {workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Command size={40} className="opacity-30" />
            <p className="text-sm">No workflows yet. Create your first one.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Name</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Trigger</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Last Run</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-right">Steps</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-right w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((wf) => (
                  <TableRow
                    key={wf.id}
                    className="border-border cursor-pointer hover:bg-card transition-colors"
                    onClick={() => navigate(`/workflows/${wf.id}/builder`)}
                  >
                    <TableCell className="font-medium text-foreground">{wf.name}</TableCell>
                    <TableCell>
                      <WorkflowStatusBadge status={wf.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{wf.trigger}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(wf.lastRun)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{wf.steps}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => navigate(`/workflows/${wf.id}/builder`)}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-red-400"
                          onClick={() => deleteWorkflow(wf.id)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
