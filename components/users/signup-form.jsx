import { lusitana } from '@/app/ui/fonts';
import {
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useState } from 'react';
import { validateSignupForm, getPasswordStrength } from '@/app/validation/signup';

export default function SignupForm({ formData, onChange, onSubmit }) {
  // state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // state for error handling
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // handle input change
  const handleBlur = (e) => {
    const { name } = e.target;
    // mark the field as touched to show error messages
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    // for confirm password, validate both fields together
    if (name === 'confirmPassword' || name === 'password') {
      const errors = validateSignupForm(formData);
      setFieldErrors(prev => ({
        ...prev,
        password: errors.password,
        confirmPassword: errors.confirmPassword
      }));
    } else {
      // for other fields, validate individually
      const errors = validateSignupForm({ [name]: formData[name] });
      setFieldErrors(prev => ({ ...prev, [name]: errors[name] }));
    }
  };

  // validate password strength
  const passwordStrength = getPasswordStrength(formData.password);

  // validate all fields on submit
  const getFieldError = (name) => {
    return touchedFields[name] ? fieldErrors[name] : '';
  };

  // function to get input class based on error state
  const getInputClass = (name) => {
    return `peer block w-full rounded-xl border ${
      getFieldError(name) ? 'border-red-500' : 'border-gray-200'
    } py-[8px] pl-4 text-xs outline-2 placeholder:text-gray-500`;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4">
        <h1
          className={`${lusitana.className} mb-3 text-2xl font-bold text-purple-500`}
        >
          Register Your Business
        </h1>

        {/* Step 1: User Details */}
        <h3 className="text-lg font-semibold text-purple-500 mt-6 mb-4">
          Step 1: User Details
        </h3>
        <div className="w-full flex gap-4">
          {/* Name Field */}
          <div className="flex-1">
            <label className="mb-3 block font-medium text-gray-900" htmlFor="name">
              Name *
            </label>
            <input
              className={getInputClass('name')}
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              onBlur={handleBlur}
              placeholder="Enter your full name"
            />
            {getFieldError('name') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('name')}</p>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="flex-1">
            <label className="mb-3 block font-medium text-gray-900" htmlFor="phoneNumber">
              Phone Number *
            </label>
            <input
              className={getInputClass('phoneNumber')}
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={onChange}
              onBlur={handleBlur}
              placeholder="Enter 10-digit phone number"
            />
            {getFieldError('phoneNumber') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('phoneNumber')}</p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="mb-3 mt-5 block font-medium text-gray-900" htmlFor="email">
            Email *
          </label>
          <input
            className={getInputClass('email')}
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => {
              formData.email = e.target.value.trim();
              onChange(e);
            }}
            onBlur={handleBlur}
            placeholder="Enter your email address"
          />
          {getFieldError('email') && (
            <p className="mt-1 text-xs text-red-500">{getFieldError('email')}</p>
          )}
        </div>

        {/* Password Fields */}
        <div className="w-full flex gap-4">
          <div className="flex-1">
            <label className="mb-3 mt-5 block font-medium text-gray-900" htmlFor="password">
              Password *
            </label>
            <div className="relative">
              <input
                className={getInputClass('password')}
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={onChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
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
            {getFieldError('password') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('password')}</p>
            )}
            {/* Password Strength */}
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i}
                    className={`h-1 flex-1 rounded-sm ${
                      passwordStrength >= i 
                        ? passwordStrength >= 4 
                          ? 'bg-green-500' 
                          : passwordStrength >= 3 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500' 
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {!formData.password ? 'Password strength' :
                  passwordStrength >= 4 ? 'Strong' :
                  passwordStrength >= 3 ? 'Medium' : 'Weak'}
              </p>
            </div>
          </div>
          
          {/* Confirm Password Field */}
          <div className="flex-1">
            <label className="mb-3 mt-5 block font-medium text-gray-900" htmlFor="confirmPassword">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                className={getInputClass('confirmPassword')}
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={onChange}
                onBlur={handleBlur}
                placeholder="Confirm your password"
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
            {getFieldError('confirmPassword') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('confirmPassword')}</p>
            )}
          </div>
        </div>

        {/* Step 2: Business Details */}
        <h3 className="mt-10 text-lg font-semibold text-purple-500 mb-4">
          Step 2: Business Details
        </h3>
        <div className="w-full flex gap-4">
          {/* Business Name Field */}
          <div className="flex-1">
            <label className="mb-3 block font-medium text-gray-900" htmlFor="businessName">
              Business Name *
            </label>
            <input
              className={getInputClass('businessName')}
              id="businessName"
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={onChange}
              onBlur={handleBlur}
              placeholder="Enter your business name"
            />
            {getFieldError('businessName') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('businessName')}</p>
            )}
          </div>

          {/* Business Type Field */}
          <div className="flex-1">
            <label className="mb-3 block font-medium text-gray-900" htmlFor="businessType">
              Business Type *
            </label>
            <select
              className={getInputClass('businessType')}
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={onChange}
              onBlur={handleBlur}
            >
              <option value="">Select business type</option>
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Service">Service</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Other">Other</option>
            </select>
            {getFieldError('businessType') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('businessType')}</p>
            )}
          </div>
        </div>

        {/* Business Email Field */}
        <div className="w-full flex gap-4">
          <div className="flex-1">
            <label className="mt-5 mb-3 block font-medium text-gray-900" htmlFor="businessEmail">
              Business Email
            </label>
            <input
              className={getInputClass('businessEmail')}
              id="businessEmail"
              type="email"
              name="businessEmail"
              value={formData.businessEmail}
              onChange={(e) => {
                formData.businessEmail = e.target.value.trim();
                onChange(e);
              }}
              onBlur={handleBlur}
              placeholder="Enter your business email"
            />
            {getFieldError('businessEmail') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('businessEmail')}</p>
            )}
          </div>

          {/* PAN Number Field */}
          <div className="flex-1">
            <label className="mt-5 mb-3 block font-medium text-gray-900" htmlFor="panNumber">
              PAN Number
            </label>
            <input
              className={getInputClass('panNumber')}
              id="panNumber"
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={onChange}
              onBlur={handleBlur}
              placeholder="Enter 9-digit PAN number"
            />
            {getFieldError('panNumber') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('panNumber')}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center items-center h-full">
          <Button
            type="submit"
            className="flex items-center gap-4 rounded-xl bg-purple-500 px-4 py-2 mt-8 text-base font-medium text-white transition-colors hover:bg-purple-400"
            disabled={Object.keys(fieldErrors).some(key => fieldErrors[key])}
          >
            <span>Sign up</span> <ArrowRightIcon className="w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
