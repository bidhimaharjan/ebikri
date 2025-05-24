import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginForm({ formData, onChange, onSubmit, onBlur, getFieldError }) {
  const [showPassword, setShowPassword] = useState(false); // state for password visibility

  const getInputClass = (name) => {
    return `peer block w-full rounded-lg border ${
      getFieldError(name) ? 'border-red-500' : 'border-gray-200'
    } py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 md:rounded-xl md:py-[9px]`;
  };

  return (
    <form 
      onSubmit={onSubmit} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-4 pb-4 pt-6 md:px-6 md:pt-8">
        <h1 className={`${lusitana.className} mb-3 text-lg font-bold text-purple-500 md:text-2xl`}>
          Please log in to continue.
        </h1>

        <div className="w-full">
          {/* Email Field */}
          <div>
            <label className="mb-2 mt-3 block text-xs font-medium text-gray-900 md:text-sm md:mt-5" htmlFor="email">
              Email *
            </label>
            <div className="relative">
              <input
                className={getInputClass('email')}
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Enter your email address"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900 md:h-[18px] md:w-[18px]" />
            </div>
            {getFieldError('email') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('email')}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="mt-3 md:mt-4">
            <label className="mb-2 block text-xs font-medium text-gray-900 md:text-sm md:mt-5" htmlFor="password">
              Password *
            </label>
            <div className="relative">
              <input
                className={getInputClass('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                  <EyeIcon className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </button>
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900 md:h-[18px] md:w-[18px]" />
            </div>
            {getFieldError('password') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('password')}</p>
            )}
          </div>

          {/* Forgot Password Button */}
          <div className="mt-3 text-center md:mt-4">
            <Link href="/auth/forgot-password" className="text-purple-500 text-xs hover:underline md:text-sm">
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Login Button */}
        <div className="flex justify-center items-center h-full">
          <Button
            type="submit" // this triggers form submission
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-500 px-4 py-3 mt-6 text-sm font-medium text-white transition-colors hover:bg-purple-400 md:w-auto md:rounded-xl md:gap-4 md:text-base md:py-2 md:mt-8"
          >
            <span>Log in</span> <ArrowRightIcon className="w-3 md:w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
