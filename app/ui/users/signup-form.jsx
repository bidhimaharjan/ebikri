import { lusitana } from '@/app/ui/fonts';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '../button';

export default function SignupForm({ formData, onChange, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl font-bold text-red-500`}>
          Register Your Business
        </h1>

        {/* Flex container for Business Name and Business Type */}
        <div className="w-full flex gap-4">
          {/* Business Name Field */}
          <div className="flex-1">
            <label
              className="mb-3 mt-5 block text-base font-medium text-gray-900"
              htmlFor="businessName"
            >
              Business Name *
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-xl border border-gray-200 py-[9px] pl-4 text-sm outline-2 placeholder:text-gray-500"
                id="businessName"
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={onChange}
                placeholder="Enter your business name"
                required
              />
            </div>
          </div>

          {/* Business Type Field */}
          <div className="flex-1">
            <label
              className="mb-3 mt-5 block text-base font-medium text-gray-900"
              htmlFor="businessType"
            >
              Business Type *
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-xl border border-gray-200 py-[9px] pl-4 text-sm outline-2 placeholder:text-gray-500"
                id="businessType"
                type="text"
                name="businessType"
                value={formData.businessType}
                onChange={onChange}
                placeholder="Choose your business type"
                required
              />
            </div>
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label
            className="mb-3 mt-5 block text-base font-medium text-gray-900"
            htmlFor="email"
          >
            Email *
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-xl border border-gray-200 py-[9px] pl-4 text-sm outline-2 placeholder:text-gray-500"
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>

        {/* Flex container for Phone Number and PAN Number */}
        <div className="w-full flex gap-4">
          {/* Phone Number Field */}
          <div className="flex-1">
            <label
              className="mb-3 mt-5 block text-base font-medium text-gray-900"
              htmlFor="phoneNumber"
            >
              Phone Number *
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-xl border border-gray-200 py-[9px] pl-4 text-sm outline-2 placeholder:text-gray-500"
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

          {/* PAN Number Field */}
          <div className="flex-1">
            <label
              className="mb-3 mt-5 block text-base font-medium text-gray-900"
              htmlFor="panNumber"
            >
              PAN Number
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-xl border border-gray-200 py-[9px] pl-4 text-sm outline-2 placeholder:text-gray-500"
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
        </div>

        {/* Flex container for Password and Confirm Password */}
        <div className="w-full flex gap-4">
          {/* Password Field */}
          <div className="flex-1">
            <label
              className="mb-3 mt-5 block text-base font-medium text-gray-900"
              htmlFor="password"
            >
              Password *
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-xl border border-gray-200 py-[9px] pl-4 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="flex-1">
            <label
              className="mb-3 mt-5 block text-base font-medium text-gray-900"
              htmlFor="confirmPassword"
            >
              Confirm Password *
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-xl border border-gray-200 py-[9px] pl-4 text-sm outline-2 placeholder:text-gray-500"
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={onChange}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center items-center h-full">
          <Button
            type="submit" // this triggers form submission
            className="flex items-center gap-4 rounded-xl bg-red-500 px-4 py-2 mt-8 text-base font-medium text-white transition-colors hover:bg-red-400"
          >
            <span>Sign up</span> <ArrowRightIcon className="w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
