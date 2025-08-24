import { PlusIcon } from '@heroicons/react/24/outline';
import { useCreateTodo, useCreateTask, useFindManyTodo, useFindManyTask } from '@lib/hooks';
import { List, Space } from '@prisma/client';
import { ChangeEvent, KeyboardEvent, useState } from 'react';
import BreadCrumb from 'components/BreadCrumb';
import TodoComponent from 'components/Todo';
import WithNavBar from 'components/WithNavBar';
import TaskSelector from 'components/TaskSelector';
import { getEnhancedPrisma } from 'server/enhanced-db';

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

        // If user typed a new Task title, create it first
        if (!tid && newTaskTitle.trim()) {
            const task = await createTask({
                data: {
                    title: newTaskTitle,
                    description: newTaskDescription,
                    space: { connect: { id: props.space.id } },
                },
            });
            tid = task.id;

            // reset new task fields
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
            <div className="px-8 py-2">
                <BreadCrumb space={props.space} list={props.list} />
            </div>
            <div className="container w-full flex flex-col items-center py-12 mx-auto">
                <h1 className="text-2xl font-semibold mb-4">{props.list?.title}</h1>

                <div className="flex flex-col space-y-2 mb-4">
                    {/* Task selector only shows if there are existing tasks */}
                    {tasks && tasks.length > 0 && (
                        <TaskSelector spaceId={props.space.id} value={taskId} onChange={setTaskId} />
                    )}

                    {/* Only show "new task" fields if no existing task is selected */}
                    {!taskId && (
                        <>
                            <input
                                type="text"
                                placeholder="New task title"
                                className="input input-bordered w-72"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="New task description (optional)"
                                className="input input-bordered w-72"
                                value={newTaskDescription}
                                onChange={(e) => setNewTaskDescription(e.target.value)}
                            />
                        </>
                    )}

                    <button
                        className="btn btn-primary flex items-center space-x-1"
                        onClick={handleCreateTodo}
                        disabled={!taskId && !newTaskTitle.trim()} // disable if no task selected or new title entered
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Add Task</span>
                    </button>
                </div>



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
