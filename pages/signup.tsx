/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useCreateUser } from '@lib/hooks';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { trigger: createUser } = useCreateUser();

    async function onSignup(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            await createUser({ data: { email, password } });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            if (err.info?.prisma === true) {
                if (err.info.code === 'P2002') {
                    toast.error('User already exists');
                } else {
                    toast.error(`Unexpected Prisma error: ${err.info.code}`);
                }
            } else {
                toast.error(`Error occurred: ${JSON.stringify(err)}`);
            }
            return;
        }

        const signInResult = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });
        if (signInResult?.ok) {
            window.location.href = '/';
        } else {
            console.error('Signin failed:', signInResult?.error);
        }
    }
return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF9F6] px-4">
      <Link href="/">
        <div className="flex space-x-4 items-center mb-8">
          <Image src="/logo.png" width={42} height={42} alt="logo" />
          <h1 className="font-serif text-4xl text-[#1A1A1A]">Welcome to Todo</h1>
        </div>
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 lg:p-12">
        <h2 className="font-serif text-2xl lg:text-3xl text-text-primary font-bold mb-8">
          Create a Free Account
        </h2>

        <form className="space-y-6" onSubmit={(e) => void onSignup(e)}>
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium text-text-primary mb-2">
              Your email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-text-primary
                         focus:outline-none focus:ring-2 focus:ring-accent-gold"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-sm font-medium text-text-primary mb-2">
              Your password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-text-primary
                         focus:outline-none focus:ring-2 focus:ring-accent-gold"
            />
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-accent-gold"
              required
            />
            <label htmlFor="terms" className="ml-2 text-sm font-medium text-text-secondary">
              I accept the{' '}
              <a href="#" className="text-[#C5A46D] hover:text-[#8B0000] font-semibold transition-colors">
                Terms and Conditions
              </a>
            </label>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-2 rounded-xl bg-[#C5A46D] text-[#1A1A1A] font-sans shadow-md
                       hover:bg-[#8B0000] hover:text-white transition-all duration-300"
          >
            Create account
          </button>

          <p className="mt-4 text-sm font-medium text-text-secondary">
            Already have an account?{' '}
            <Link
              href="/signin"
              className="text-[#C5A46D] hover:text-[#8B0000] font-semibold transition-colors"
            >
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}