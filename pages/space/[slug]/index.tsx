import { SpaceContext } from '@lib/context';
import { useCreateList, useFindManyList } from '@lib/hooks';
import { List, Space, User } from '@prisma/client';
import BreadCrumb from 'components/BreadCrumb';
import SpaceMembers from 'components/SpaceMembers';
import TodoList from 'components/TodoList';
import WithNavBar from 'components/WithNavBar';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { ChangeEvent, FormEvent, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { getEnhancedPrisma } from 'server/enhanced-db';

function CreateDialog() {
    const space = useContext(SpaceContext);

    const [modalOpen, setModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [_private, setPrivate] = useState(false);

    const { trigger: createList } = useCreateList({
        onSuccess: () => {
            toast.success('List created successfully!');

            // reset states
            setTitle('');
            setPrivate(false);

            // close modal
            setModalOpen(false);
        },
    });

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (modalOpen) {
            inputRef.current?.focus();
        }
    }, [modalOpen]);

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();

        void createList({
            data: {
                title,
                private: _private,
                space: { connect: { id: space!.id } },
            },
        });
    };

    return (
        <>
            <input
                type="checkbox"
                id="create-list-modal"
                className="modal-toggle"
                checked={modalOpen}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setModalOpen(e.currentTarget.checked);
                }}
            />
            <div className="modal">
                <div className="modal-box bg-[#FAF9F6] border border-gray-200 rounded-2xl shadow-md p-6">
                    <h3 className="font-serif text-2xl text-text-primary mb-6">Create a Todo list</h3>
                    <form onSubmit={onSubmit}>
                        <div className="flex flex-col space-y-4">
                            <div className="flex items-center">
                                <label htmlFor="title" className="text-lg w-24 font-serif text-text-primary">
                                    Name
                                </label>
                                <input
                                    id="Name"
                                    type="text"
                                    required
                                    placeholder="Name of your list"
                                    ref={inputRef}
                                    className="
                                        input-bordered w-full max-w-xs
                                        rounded-xl border border-gray-300
                                        px-4 py-2 shadow-sm
                                        focus:outline-none focus:ring-2 focus:ring-accent-gold
                                        font-sans text-text-primary
                                    "
                                    value={title}
                                    onChange={(e: FormEvent<HTMLInputElement>) => setTitle(e.currentTarget.value)}
                                />
                            </div>
                            <div className="flex items-center">
                                <label htmlFor="private" className="text-lg w-24 font-serif text-text-primary">
                                    Private
                                </label>
                                <input
                                    id="private"
                                    type="checkbox"
                                    cclassName="checkbox accent-accent-gold"
                                    onChange={(e: FormEvent<HTMLInputElement>) => setPrivate(e.currentTarget.checked)}
                                />
                            </div>
                        </div>
                        <div className="modal-action mt-4 space-x-3">
                            <input 
                                    className="
                                        btn flex items-center justify-center px-4 py-2
                                        bg-[#C5A46D] text-[#1A1A1A] font-sans
                                        rounded-xl shadow-md
                                        transition-all duration-300 ease-in-out
                                        " 
                                    type="submit" 
                                    value="Create" />
                            <label htmlFor="create-list-modal" 
                                    className="
                                    btn btn-outline rounded-xl font-sans
                                    border-gray-400 text-text-primary
                                    hover:border-accent-gold hover:text-accent-gold
                                    transition
                                    "
                                    >
                                Cancel
                            </label>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

type Props = {
    space: Space;
    lists: (List & { owner: User })[];
};

export default function SpaceHome(props: Props) {
    const router = useRouter();

    const { data: lists } = useFindManyList(
        {
            where: {
                space: {
                    slug: router.query.slug as string,
                },
            },
            include: {
                owner: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        },
        {
            disabled: !router.query.slug,
            fallbackData: props.lists,
        }
    );

    return (
        <WithNavBar>
            <div className="px-8 py-2">
                <BreadCrumb space={props.space} />
            </div>
            <div className="p-8">
                <div className="w-full flex flex-col md:flex-row mb-8 space-y-4 md:space-y-0 md:space-x-4">
                    <label htmlFor="create-list-modal" 
                            className="
                                    btn px-6 py-2 rounded-xl bg-[#C5A46D] text-[#1A1A1A] font-sans shadow-md
                                    cursor-pointer
                                    ">
                        Create a list
                    </label>
                    <SpaceMembers />
                </div>

                <ul className="flex flex-wrap gap-6">
                    {lists?.map((list) => (
                        <li key={list.id}>
                            <TodoList value={list} />
                        </li>
                    ))}
                </ul>

                <CreateDialog />
            </div>
        </WithNavBar>
    );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res, params }) => {
    const db = await getEnhancedPrisma({ req, res });

    const space = await db.space.findUnique({
        where: { slug: params!.slug as string },
    });
    if (!space) {
        return {
            notFound: true,
        };
    }

    const lists = await db.list.findMany({
        where: {
            space: { slug: params?.slug as string },
        },
        include: {
            owner: true,
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });

    return {
        props: { space, lists },
    };
};
