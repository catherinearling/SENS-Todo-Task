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
    { keepPreviousData: true }
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-serif text-gray-700">Choose a Task</label>

      <select
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          onChange(e.currentTarget.value)
        }
        className="
          w-56
          bg-[#FAF9F6]
          border border-gray-300
          rounded-xl
          shadow-sm
          px-4 py-2
          text-text-primary
          font-sans
          focus:outline-none 
          focus:ring-2 
          focus:ring-accent-gold
          transition
        "
      >
        <option value="" className="text-gray-400 font-serif italic">
          Select a Task
        </option>
        {tasks?.map((task) => (
          <option
            key={task.id}
            value={task.id}
            className="font-sans text-gray-800"
          >
            {task.title}
          </option>
        ))}
      </select>
    </div>
  );
}
