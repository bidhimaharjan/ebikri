'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react'; // import signIn from NextAuth
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/users/login-form';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { validateLoginForm } from '@/app/validation/login';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const router = useRouter(); // initialize the router

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    const errors = validateLoginForm({ [name]: formData[name] });
    setFieldErrors(prev => ({ ...prev, [name]: errors[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate form before submission
    const errors = validateLoginForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error(Object.values(errors)[0]);
      return;
    }

    const response = await signIn('credentials', {
      redirect: false, // handle the redirect manually
      email: formData.email,
      password: formData.password,
    });

    if (response?.error) {
      toast.error(response.error || 'Login failed!');
    } else {
      toast.success('Welcome to eBikri');
      setFormData({
        email: '',
        password: '',
      });

      // redirect to the dashboard page after successful login
      router.push('/dashboard');
    }
  };

  const getFieldError = (name) => {
    return touchedFields[name] ? fieldErrors[name] : '';
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 p-6">
      <div className="mt-4 flex items-center justify-center grow flex-col gap-4 md:flex-row">
        {/* Left Section */}
        <div className="flex flex-col justify-center gap-2 px-4 py-6 w-full lg:w-1/2 lg:px-8 xl:px-20">
          {/* Register Button - Mobile and Medium */}
          <div className="flex items-center justify-center gap-3 mb-4 lg:hidden">
            <p className="text-sm">Don't have an account?</p>
            <Link href="/signup">
              <Button className="flex items-center gap-2 rounded-xl bg-purple-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-400">
                <span>Register</span> <ArrowRightIcon className="w-3" />
              </Button>
            </Link>
          </div>
          
          <LoginForm 
            formData={formData} 
            onChange={handleChange} 
            onSubmit={handleSubmit}
            onBlur={handleBlur}
            fieldErrors={fieldErrors}
            getFieldError={getFieldError}
          />

          {/* Google Sign in Button */}
          <div className="relative flex items-center px-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          <div className="relative flex items-center px-4">
            <GoogleSignInButton />
          </div>    
        </div>

        {/* Vertical line */}
        <div className="hidden lg:block w-px bg-gray-300"></div>

        {/* Right Section */}
        <div className="hidden lg:flex flex-col justify-center gap-6 rounded-lg px-6 py-10 lg:w-1/2 xl:px-20">
          <p className="text-3xl text-gray-800 xl:text-4xl">
            <strong>Welcome to eBikri</strong>
          </p>
          <p className="text-lg xl:text-xl">
            eBikri is a complete Retail Business Management Application for your small online business.
          </p>
          <div className="flex items-center gap-3">
            <p className="text-base">Don't have an account?</p>
            <Link href="/signup">
              <Button className="flex items-center gap-4 rounded-xl bg-purple-500 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-purple-400">
                <span>Register</span> <ArrowRightIcon className="w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}