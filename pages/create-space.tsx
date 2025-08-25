/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useCreateSpace } from '@lib/hooks';
import { SpaceUserRole } from '@prisma/client';
import WithNavBar from 'components/WithNavBar';
import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';

const CreateSpace: NextPage = () => {
    const { data: session } = useSession();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');

    const { trigger: createSpace } = useCreateSpace();
    const router = useRouter();

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const space = await createSpace({
                data: {
                    name,
                    slug,
                    members: {
                        create: [
                            {
                                userId: session!.user.id,
                                role: SpaceUserRole.ADMIN,
                            },
                        ],
                    },
                },
            });
            console.log('Space created:', space);
            toast.success("Space created successfully! You'll be redirected.");

            setTimeout(() => {
                if (space) {
                    void router.push(`/space/${space.slug}`);
                }
            }, 2000);
        } catch (err: any) {
            console.error(err);
            if (err.info?.prisma === true) {
                if (err.info.code === 'P2002') {
                    toast.error('Space slug already in use');
                } else {
                    toast.error(`Unexpected Prisma error: ${err.info.code}`);
                }
            } else {
                toast.error(JSON.stringify(err));
            }
        }
    };

    return (
        <WithNavBar>
            <div className="flex items-center justify-center h-full py-12 bg-[#FAF9F6]">
                <form onSubmit={(e) => void onSubmit(e)}          
                    className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                    <h1 className="font-serif text-3xl text-text-primary mb-8">Create a space</h1>
                    <div className="flex-col space-y-4">
                        <div>
                            <label htmlFor="name" className="text-lg font-serif text-text-primary mb-1">
                                Space name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                placeholder="Name of your space"
                                className="
                                w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm
                                focus:outline-none focus:ring-2 focus:ring-accent-gold
                                font-sans text-text-primary
                                "
                                autoFocus
                                onChange={(e: FormEvent<HTMLInputElement>) => setName(e.currentTarget.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="slug" className="text-lg font-serif text-text-primary mb-1">
                                Space slug
                            </label>
                            <input
                                id="slug"
                                type="text"
                                required
                                placeholder="Slug of your space"
                                className="
                                w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm
                                focus:outline-none focus:ring-2 focus:ring-accent-gold
                                font-sans text-text-primary
                                "
                                onChange={(e: FormEvent<HTMLInputElement>) => setSlug(e.currentTarget.value)}
                            />
                        </div>
                    </div>

                    <div className="flex space-x-4 mt-6">
                        <input
                            type="submit"
                            disabled={name.length < 4 || name.length > 20 || !slug.match(/^[0-9a-zA-Z]{4,16}$/)}
                            value="Create"
                            className="
                                btn flex-1 px-6 py-2 rounded-xl
                                bg-[#C5A46D] text-[#1A1A1A] font-sans shadow-md
                                transition-all duration-300 ease-in-out
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        />
                        <button
                            className="
                                btn flex-1 px-6 py-2 rounded-xl
                                border border-gray-400 text-text-primary font-sans
                                hover:border-accent-gold hover:text-accent-gold
                                transition
                            "
                            onClick={(e) => {
                                e.preventDefault();
                                void router.push('/');
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </WithNavBar>
    );
};

export default CreateSpace;
