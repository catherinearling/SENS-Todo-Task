import { Todo, User } from '@prisma/client';
import { useDeleteTodo } from '@lib/hooks';
import { TrashIcon } from '@heroicons/react/24/outline';

type Props = {
  value: Todo & { owner: User; task: { title: string; description?: string } };
  optimistic?: boolean;
};

export default function TodoComponent({ value, optimistic }: Props) {
  const { trigger: deleteTodo } = useDeleteTodo({ optimisticUpdate: true });

  const handleDelete = async () => {
    await deleteTodo({ where: { id: value.id } });
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col w-full lg:w-[480px]">
      <div className="flex justify-between w-full mb-2">
        <h3
          className={`text-xl ${
            value.completedAt ? 'line-through text-gray-400' : ''
          }`}
        >
          {value.task?.title || 'No Task'}
        </h3>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 transition"
          title="Delete task"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {value.task?.description && (
        <p className="text-gray-500">{value.task.description}</p>
      )}
    </div>
  );
}
