import { useFindManyTask } from '@lib/hooks';
import { ChangeEvent } from 'react';

type Props = {
  spaceId: string;
  value: string;
  onChange: (val: string) => void;
};

export default function TaskSelector({ spaceId, value, onChange }: Props) {
  // Fetch all tasks for this space
  const { data: tasks } = useFindManyTask(
    {
      where: { spaceId },
      orderBy: { createdAt: 'desc' },
    },
    { keepPreviousData: true } // keeps old data while new data loads
  );

  return (
    <select
      value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.currentTarget.value)}
      className="select select-bordered w-48"
    >
      <option value="">Select a Task</option>
      {tasks?.map((task) => (
        <option key={task.id} value={task.id}>
          {task.title}
        </option>
      ))}
    </select>
  );
}
