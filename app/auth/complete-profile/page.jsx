'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { lusitana } from '@/app/ui/fonts';

export default function CompleteProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (!session.user?.requiresProfileCompletion) {
      router.push('/dashboard');
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const [formData, setFormData] = useState({
    phoneNumber: '',
    businessName: '',
    businessType: '',
    businessEmail: '',
    panNumber: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await update({ requiresProfileCompletion: false });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (name) =>
    `peer block w-full rounded-xl border border-gray-200 py-[8px] pl-4 text-xs outline-2 placeholder:text-gray-500`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg px-6 py-8 w-full max-w-xl space-y-5"
      >
        <h1 className={`${lusitana.className} text-xl font-bold text-purple-500 text-center`}>
          Complete Your Profile
        </h1>

        <p className="text-sm text-gray-600 text-center">
          Please provide your personal and business details to continue.
        </p>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded text-sm text-center">
            {error}
          </div>
        )}

        {/* Phone Number */}
        <div>
          <label className="block font-medium text-sm text-gray-900 mb-2" htmlFor="phoneNumber">
            Phone Number *
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            required
            placeholder="Enter a 10-digit phone number"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={getInputClass('phoneNumber')}
          />
        </div>

        {/* Business Name */}
        <div>
          <label className="block font-medium text-sm text-gray-900 mb-2" htmlFor="businessName">
            Business Name *
          </label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            required
            placeholder="Enter your business name"
            value={formData.businessName}
            onChange={handleChange}
            className={getInputClass('businessName')}
          />
        </div>

        {/* Business Type */}
        <div>
          <label className="block font-medium text-sm text-gray-900 mb-2" htmlFor="businessType">
            Business Type *
          </label>
          <select
            id="businessType"
            name="businessType"
            required
            value={formData.businessType}
            onChange={handleChange}
            className={getInputClass('businessType')}
          >
            <option value="">Select business type</option>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Service">Service</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Business Email */}
        <div>
          <label className="block font-medium text-sm text-gray-900 mb-2" htmlFor="businessEmail">
            Business Email
          </label>
          <input
            id="businessEmail"
            name="businessEmail"
            type="email"
            placeholder="Enter business email"
            value={formData.businessEmail}
            onChange={handleChange}
            className={getInputClass('businessEmail')}
          />
        </div>

        {/* PAN Number */}
        <div>
          <label className="block font-medium text-sm text-gray-900 mb-2" htmlFor="panNumber">
            PAN Number
          </label>
          <input
            id="panNumber"
            name="panNumber"
            type="text"
            placeholder="Enter 9-digit PAN number"
            value={formData.panNumber}
            onChange={handleChange}
            className={getInputClass('panNumber')}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Complete Profile'}
        </button>
      </form>
    </div>
  );
}
