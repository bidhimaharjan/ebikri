import { lusitana } from '@/app/ui/fonts';
import { ArrowRightIcon, EyeIcon, EyeSlashIcon, } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useState } from 'react';

export default function SignupForm({ formData, onChange, onSubmit }) {
  // state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4">
        <h1 className={`${lusitana.className} mb-3 text-2xl font-bold text-red-500`}>Register Your Business</h1>
        
        {/* Step 1: User Details */}
        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Step 1: User Details</h3>
        <div className="w-full flex gap-4">
          {/* Name Field */}
          <div className="flex-1">
            <label className="mb-3 block text-base font-medium text-gray-900" htmlFor="name">Name *</label>
            <input
              className="peer block w-full rounded-xl border border-gray-200 py-[8px] pl-4 text-sm outline-2 placeholder:text-gray-500"
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Enter your name"
              required
            />
          </div>
          {/* Phone Number Field */}
          <div className="flex-1">
            <label className="mb-3 block text-base font-medium text-gray-900" htmlFor="phoneNumber">Phone Number *</label>
            <input
              className="peer block w-full rounded-xl border border-gray-200 py-[8px] pl-4 text-sm outline-2 placeholder:text-gray-500"
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={onChange}
              placeholder="Enter your phone number"
              required
            />
          </div>
        </div>
        
        {/* Email Field */}
        <label className="mb-3 mt-5 block text-base font-medium text-gray-900" htmlFor="email">Email *</label>
        <input
          className="peer block w-full rounded-xl border border-gray-200 py-[8px] pl-4 text-sm outline-2 placeholder:text-gray-500"
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          placeholder="Enter your email address"
          required
        />

        {/* Password Fields */}
        <div className="w-full flex gap-4">
          <div className="flex-1">
            <label className="mb-3 mt-5 block text-base font-medium text-gray-900" htmlFor="password">Password *</label>
            <div className="relative">
              <input
                className="peer block w-full rounded-xl border border-gray-200 py-[8px] pl-4 pr-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={onChange}
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex-1">
            <label className="mb-3 mt-5 block text-base font-medium text-gray-900" htmlFor="confirmPassword">Confirm Password *</label>
            <div className="relative">
              <input
                className="peer block w-full rounded-xl border border-gray-200 py-[8px] pl-4 pr-10 text-sm outline-2 placeholder:text-gray-500"
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={onChange}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Step 2: Business Details */}
        <h3 className="mt-10 text-lg font-semibold text-gray-900 mb-4">Step 2: Business Details</h3>
        <div className="w-full flex gap-4">
          {/* Business Name Field */}
          <div className="flex-1">
            <label className="mb-3 block text-base font-medium text-gray-900" htmlFor="businessName">Business Name *</label>
            <input
              className="peer block w-full rounded-xl border border-gray-200 py-[8px] pl-4 text-sm outline-2 placeholder:text-gray-500"
              id="businessName"
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={onChange}
              placeholder="Enter your business name"
              required
            />
          </div>
          {/* Business Type Field */}
          <div className="flex-1">
            <label className="mb-3 block text-base font-medium text-gray-900" htmlFor="businessType">Business Type *</label>
            <input
              className="peer block w-full rounded-xl border border-gray-200 py-[8px] pl-4 text-sm outline-2 placeholder:text-gray-500"
              id="businessType"
              type="text"
              name="businessType"
              value={formData.businessType}
              onChange={onChange}
              placeholder="Enter your business type"
              required
            />
          </div>
        </div>

        {/* Business Email and PAN Number */}
        <div className="w-full flex gap-4">
          <div className="flex-1">
            <label className="mt-5 mb-3 block text-base font-medium text-gray-900" htmlFor="businessEmail">Business Email</label>
            <input
              className="peer block w-full rounded-xl border border-gray-200 py-[8px] pl-4 text-sm outline-2 placeholder:text-gray-500"
              id="businessEmail"
              type="email"
              name="businessEmail"
              value={formData.businessEmail}
              onChange={onChange}
              placeholder="Enter your business email"
              required
            />
          </div>
          <div className="flex-1">
            <label className="mt-5 mb-3 block text-base font-medium text-gray-900" htmlFor="panNumber">PAN Number</label>
            <input
              className="peer block w-full rounded-xl border border-gray-200 py-[8px] pl-4 text-sm outline-2 placeholder:text-gray-500"
              id="panNumber"
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={onChange}
              placeholder="Enter your PAN number"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center items-center h-full">
          <Button type="submit" className="flex items-center gap-4 rounded-xl bg-red-500 px-4 py-2 mt-8 text-base font-medium text-white transition-colors hover:bg-red-400">
            <span>Sign up</span> <ArrowRightIcon className="w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
