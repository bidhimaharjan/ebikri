'use client';

// import EbikriLogo from '@app/ui/ebikri-logo';
import { useState } from 'react';
import SignupForm from '@/components/users/signup-form';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
 
export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        businessType: '',
        businessEmail: '',
        panNumber: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
    
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match!');
        return;
      }

      // check for empty fields
    const requiredFields = ['name', 'phoneNumber', 'email', 'password', 'businessName', 'businessType'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        toast.warn(`${field} is required!`);
        return;
      }
    }
    
      try {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
    
        if (response.ok) {
          toast.success('User registered successfully!');
          setFormData({
            name: '',
            phoneNumber: '',
            email: '',
            password: '',
            confirmPassword: '',
            businessName: '',
            businessType: '',
            businessEmail: '',
            panNumber: '',
          });
        } else {
          const data = await response.json();
          toast.error(data.error || 'Registration failed');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Something went wrong');
      }
    };

  return (
    <main className="flex min-h-screen flex-col p-6 bg-gray-50">
        {/* <div className="flex h-20 shrink-0 items-end rounded-lg bg-red-500 p-4 md:h-20">
        <EbikriLogo />
        </div> */}

        <div className="flex grow flex-col gap-4 md:flex-row">
            {/* Left Section */}
            <div className="flex flex-col justify-center gap-10 px-6 py-10 md:w-1/2 md:px-20">
                <p className={`text-xl text-gray-800 md:text-4xl md:leading-normal`}>
                    <strong>Welcome to eBikri</strong> 
                </p>
                <p>
                    <span className="text-xl">eBikri is a complete Retail Business Management Application for your small online business.</span>
                </p>

                <div className="flex items-center gap-3">
                    <p className="text-base">Already have an account?</p>
                    <Link href="/login">
                        <Button className="flex items-center gap-4 rounded-xl bg-red-500 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-red-400">
                            <span>Log in</span> <ArrowRightIcon className="w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Vertical line */}
            <div className="hidden md:block w-px bg-gray-300"></div>

            {/* Right Section */}
                <div className="flex flex-col justify-center gap-6 px-6 py-10 md:w-1/2 md:px-20">
                <SignupForm formData={formData} onChange={handleChange} onSubmit={handleSubmit} />
            </div>
        </div>
    </main>
    // <main className="flex items-center justify-center md:h-screen">
    //   <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
    //     <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
    //       <div className="w-32 text-white md:w-36">
    //         <AcmeLogo />
    //       </div>
    //     </div>
    //     <LoginForm />
    //   </div>
    // </main>
  );
}