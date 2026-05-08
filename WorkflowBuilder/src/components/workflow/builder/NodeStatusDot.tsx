import { NODE_STATUS_DOT } from '@/lib/constants';
import type { NodeConfigStatus } from '@/types/node';

interface Props {
  status: NodeConfigStatus;
}

export function NodeStatusDot({ status }: Props) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${NODE_STATUS_DOT[status]}`}
      title={status}
    />
  );
}
