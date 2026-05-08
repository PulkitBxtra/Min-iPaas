import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Plus } from 'lucide-react';

type FlowEndNodeData = { isActive: boolean; onAdd: () => void };

export function FlowEndNode({ data }: NodeProps) {
  const { isActive, onAdd } = data as FlowEndNodeData;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="!h-2 !w-2 !border-0 !bg-border"
      />
      <button
        onClick={onAdd}
        title="Add a step"
        className={`
          flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all
          ${isActive
            ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30'
            : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary hover:shadow-md hover:shadow-primary/10'
          }
        `}
      >
        <Plus size={16} />
      </button>
    </>
  );
}
