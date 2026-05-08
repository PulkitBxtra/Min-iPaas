import { Badge } from '@/components/ui/badge';
import { STATUS_BADGE_CLASSES } from '@/lib/constants';
import type { WorkflowStatus } from '@/types/workflow';

interface Props {
  status: WorkflowStatus;
}

export function WorkflowStatusBadge({ status }: Props) {
  return (
    <Badge variant="outline" className={STATUS_BADGE_CLASSES[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
