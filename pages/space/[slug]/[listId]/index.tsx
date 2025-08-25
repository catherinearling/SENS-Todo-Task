import { PlusIcon } from '@heroicons/react/24/outline';
import { useCreateTodo, useCreateTask, useFindManyTodo, useFindManyTask } from '@lib/hooks';
import { List, Space } from '@prisma/client';
import { ChangeEvent, KeyboardEvent, useState } from 'react';
import BreadCrumb from 'components/BreadCrumb';
import TodoComponent from 'components/Todo';
import WithNavBar from 'components/WithNavBar';
import TaskSelector from 'components/TaskSelector';
import { getEnhancedPrisma } from 'server/enhanced-db';
import { GetServerSideProps } from 'next';

type Props = {
  space: Space;
  list: List;
};

export default function TodoList(props: Props) {
  const [taskId, setTaskId] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const { data: todos } = useFindManyTodo({
    where: { listId: props.list.id },
    include: { owner: true, task: true },
    orderBy: { createdAt: 'desc' },
  });

  const { data: tasks } = useFindManyTask({
    where: { spaceId: props.space.id },
    orderBy: { createdAt: 'desc' },
  });

  const { trigger: createTask } = useCreateTask({ optimisticUpdate: true });
  const { trigger: createTodo } = useCreateTodo({ optimisticUpdate: true });

  const handleCreateTodo = async () => {
    let tid = taskId;

    if (!tid && newTaskTitle.trim()) {
      const task = await createTask({
        data: {
          title: newTaskTitle,
          description: newTaskDescription,
          space: { connect: { id: props.space.id } },
        },
      });
      tid = task.id;

      setNewTaskTitle('');
      setNewTaskDescription('');
    }

    if (!tid) return;

    await createTodo({
      data: { task: { connect: { id: tid } }, list: { connect: { id: props.list.id } } },
    });

    setTaskId('');
  };

  return (
    <WithNavBar>
      <div className="px-8 py-4">
        <BreadCrumb space={props.space} list={props.list} />
      </div>

      <div className="container w-full flex flex-col items-center py-12 mx-auto">
        {/* Page title */}
        <h1 className="text-3xl font-serif text-text-primary mb-6 tracking-wide">
          {props.list?.title}
        </h1>

        {/* Input + task creation area */}
        <div
          className="
            flex flex-col space-y-3 mb-6 
            bg-[#FAF9F6] border border-gray-200 
            rounded-2xl shadow-md 
            px-6 py-6 w-full max-w-lg
          "
        >
          {/* Task selector only shows if there are existing tasks */}
          {tasks && tasks.length > 0 && (
            <TaskSelector spaceId={props.space.id} value={taskId} onChange={setTaskId} />
          )}

          {/* New task fields if no existing selected */}
          {!taskId && (
            <>
              <input
                type="text"
                placeholder="New task title"
                className="
                  w-full 
                  bg-white 
                  border border-gray-300 
                  rounded-xl 
                  px-4 py-2 
                  shadow-sm
                  focus:outline-none 
                  focus:ring-2 focus:ring-accent-gold
                  font-sans text-text-primary
                "
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="New task description (optional)"
                className="
                  w-full 
                  bg-white 
                  border border-gray-300 
                  rounded-xl 
                  px-4 py-2 
                  shadow-sm
                  focus:outline-none 
                  focus:ring-2 focus:ring-accent-gold
                  font-sans text-text-primary
                "
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
            </>
          )}

          {/* Add task button */}
            <button
            className="
                flex items-center justify-center space-x-2
                bg-[#C5A46D] text-[#1A1A1A]
                px-4 py-2
                rounded-xl shadow-md
                transition-all duration-300 ease-in-out
                disabled:opacity-50 disabled:cursor-not-allowed
            "
            onClick={handleCreateTodo}
            disabled={!taskId && !newTaskTitle.trim()}
            >
            <PlusIcon className="w-5 h-5" />
            <span>Add Task</span>
            </button>

        </div>

        {/* Todo list */}
        <ul className="flex flex-col space-y-4 py-8 w-11/12 md:w-auto">
          {todos?.map((todo) => (
            <TodoComponent key={todo.id} value={todo} optimistic={todo.$optimistic} />
          ))}
        </ul>
      </div>
    </WithNavBar>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res, params }) => {
  const db = await getEnhancedPrisma({ req, res });
  const space = await db.space.findUnique({ where: { slug: params!.slug as string } });
  if (!space) return { notFound: true };

  const list = await db.list.findUnique({ where: { id: params!.listId as string } });
  if (!list) return { notFound: true };

  return { props: { space, list } };
};
