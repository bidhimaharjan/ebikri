'use client';

// import EbikriLogo from '@/app/ui/ebikri-logo';
import SignupForm from '@/app/ui/signup-form';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
 
export default function SignupPage() {
    const [formData, setFormData] = useState({
        businessName: '',
        businessType: '',
        email: '',
        phoneNumber: '',
        panNumber: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Ensure passwords match
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match!');
          return;
        }
    
        try {
          const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              businessName: formData.businessName,
              businessType: formData.businessType,
              email: formData.email,
              phoneNumber: formData.phoneNumber,
              panNumber: formData.panNumber,
              password: formData.password,
            }),
          });
    
          if (response.ok) {
            alert('User registered successfully!');
            setFormData({
              businessName: '',
              businessType: '',
              email: '',
              phoneNumber: '',
              panNumber: '',
              password: '',
              confirmPassword: '',
            });
          } else {
            const data = await response.json();
            alert(data.error || 'Failed to register user');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Something went wrong');
        }
    };

  return (
    <main className="flex min-h-screen flex-col p-6 bg-gray-50">
        {/* <div className="flex h-20 shrink-0 items-end rounded-lg bg-red-500 p-4 md:h-20">
        <EbikriLogo />
        </div> */}

        <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
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
                <SignupForm />
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