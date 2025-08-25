import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (router.query.error) {
            if (router.query.error === 'OAuthCreateAccount') {
                toast.error('Unable to signin. The user email may be already in use.');
            } else {
                toast.error(`Authentication error: ${router.query.error.toString()}`);
            }
        }
    }, [router]);

    async function onSignin(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const signInResult = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });
        if (signInResult?.ok) {
            window.location.href = '/';
        } else {
            toast.error(`Signin failed. Please check your email and password.`);
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
          Sign in to your account
        </h2>

        <form className="space-y-6" onSubmit={(e) => void onSignin(e)}>
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

          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-accent-gold"
            />
            <label htmlFor="remember" className="ml-2 text-sm font-medium text-text-secondary">
              Remember me
            </label>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 px-6 py-2 rounded-xl bg-[#C5A46D] text-[#1A1A1A] font-sans shadow-md
                         hover:bg-[#593F15] hover:text-white transition-all duration-300"
            >
              Login to your account
            </button>

            <div
              className="flex-1 px-6 py-2 rounded-xl border border-gray-400 text-text-primary font-sans
                         text-center cursor-pointer hover:border-accent-gold hover:text-accent-gold transition"
              onClick={() => void signIn('github', { callbackUrl: '/' })}
            >
              Sign in with GitHub
            </div>
          </div>

          <p className="mt-4 text-sm font-medium text-text-secondary">
            Not registered?{' '}
            <Link href="/signup" className="text-[#C5A46D] hover:text-[#593F15] font-semibold transition-colors">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
