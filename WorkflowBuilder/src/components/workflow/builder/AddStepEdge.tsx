import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from '@xyflow/react';
import { Plus } from 'lucide-react';

type AddStepEdgeData = {
  insertAfterIndex: number;
  isActive: boolean;
  onPlusClick: (afterIdx: number) => void;
};

export function AddStepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps) {
  const { insertAfterIndex, isActive, onPlusClick } = (data ?? {}) as AddStepEdgeData;

  const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: isActive ? 'hsl(142 71% 45%)' : '#3f3f46',
          strokeWidth: 1.5,
          transition: 'stroke 0.15s',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
          className="nodrag nopan pointer-events-auto absolute"
        >
          <button
            onClick={() => onPlusClick(insertAfterIndex)}
            title="Add a step here"
            className={`
              flex h-6 w-6 items-center justify-center rounded-full border transition-all
              ${isActive
                ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30'
                : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'
              }
            `}
          >
            <Plus size={11} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
