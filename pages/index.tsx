import { useCurrentUser } from '@lib/context';
import { Space } from '@prisma/client';
import Spaces from 'components/Spaces';
import WithNavBar from 'components/WithNavBar';
import type { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { getEnhancedPrisma } from 'server/enhanced-db';

type Props = {
    spaces: Space[];
};

const Home: NextPage<Props> = ({ spaces }) => {
    const user = useCurrentUser();

    return (
        <WithNavBar>
            {user && (
                <div className="mt-8 flex flex-col items-center w-full bg-[#FAF9F6] min-h-screen px-4">
                    <h1 className="font-serif text-3xl text-text-primary mb-6">
                        Welcome {user.name || user.email}!
                    </h1>

                    <div className="w-full max-w-4xl p-8">
                        <h2 className="font-sans text-lg md:text-xl text-text-secondary mb-8">
                            Choose a space to start, or{' '}
                            <Link href="/create-space" 
                                    className="text-[#C5A46D] hover:text-[#593F15] font-semibold transition-colors duration-300">
                                create a new one.
                            </Link>
                        </h2>
                        <Spaces spaces={spaces} />
                    </div>
                </div>
            )}
        </WithNavBar>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const db = await getEnhancedPrisma(ctx);
    const spaces = await db.space.findMany();
    return {
        props: { spaces },
    };
};

export default Home;
