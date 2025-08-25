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
    <div
      className="
        bg-[#FAF9F6] 
        border border-gray-200 
        rounded-2xl 
        shadow-md 
        hover:shadow-xl 
        transition 
        p-6 
        flex flex-col 
        w-full lg:w-[480px]
      "
    >
      <div className="flex justify-between items-start w-full mb-3">
        <h3
          className={`
            text-2xl font-serif tracking-wide
            ${value.completedAt ? 'line-through text-gray-400 italic' : 'text-gray-800'}
          `}
        >
          {value.task?.title || 'No Task'}
        </h3>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="
            text-gray-400 
            hover:text-[#8B0000] 
            transition-colors 
            duration-200
          "
          title="Delete task"
        >
          <TrashIcon className="w-6 h-6" />
        </button>
      </div>

      {value.task?.description && (
        <p className="text-gray-600 font-light leading-relaxed">
          {value.task.description}
        </p>
      )}
    </div>
  );
}
