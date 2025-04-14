import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  // ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useState } from 'react';

export default function LoginForm({ formData, onChange, onSubmit, onBlur, getFieldError }) {
  const [showPassword, setShowPassword] = useState(false); // state for password visibility

  const getInputClass = (name) => {
    return `peer block w-full rounded-xl border ${
      getFieldError(name) ? 'border-red-500' : 'border-gray-200'
    } py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500`;
  };

  return (
    <form 
      onSubmit={onSubmit} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl font-bold text-purple-500`}>
          Please log in to continue.
        </h1>

        <div className="w-full">
          {/* Email Field */}
          <div>
            <label className="mb-3 mt-5 block font-medium text-gray-900" htmlFor="email">
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
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            {getFieldError('email') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('email')}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="mt-4">
            <label className="mb-3 mt-5 block font-medium text-gray-900" htmlFor="password">
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
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            {getFieldError('password') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('password')}</p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="mt-4 flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              className="h-4 w-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 text-sm font-medium text-gray-900"
            >
              Remember me
            </label>
          </div>
        </div>

        {/* Login Button */}
        <div className="flex justify-center items-center h-full">
          <Button
            type="submit" // this triggers form submission
            className="flex items-center gap-4 rounded-xl bg-purple-500 px-4 py-2 mt-8 font-medium text-white transition-colors hover:bg-purple-400"
          >
            <span>Log in</span> <ArrowRightIcon className="w-4" />
          </Button>
        </div>

        <div className="flex h-8 items-end space-x-1">
          {/* Add form errors here */}
        </div>
      </div>
    </form>
  );
}
