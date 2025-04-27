'use client';

import { ArrowRightIcon, ChartBarIcon, ShoppingCartIcon, UserGroupIcon, CogIcon, CurrencyDollarIcon, DevicePhoneMobileIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Page() {
  // list of feature cards with their icons, descriptions, and animation delay
  const features = [
    {
      title: "Sales Tracking",
      description: "Real-time sales monitoring with insightful analytics",
      icon: <CurrencyDollarIcon className="h-10 w-10 text-green-500" />,
      delay: 0.1
    },
    {
      title: "Inventory Management",
      description: "Automated stock tracking with low-level alerts",
      icon: <ShoppingCartIcon className="h-10 w-10 text-blue-500" />,
      delay: 0.2
    },
    {
      title: "Customer Insights",
      description: "Comprehensive customer profiles and purchase history",
      icon: <UserGroupIcon className="h-10 w-10 text-purple-500" />,
      delay: 0.3
    },
    {
      title: "Mobile Ready",
      description: "Fully responsive design works on all devices",
      icon: <DevicePhoneMobileIcon className="h-10 w-10 text-orange-500" />,
      delay: 0.4
    },
    {
      title: "Secure Platform",
      description: "Enterprise-grade security for your business data",
      icon: <ShieldCheckIcon className="h-10 w-10 text-red-500" />,
      delay: 0.5
    },
    {
      title: "Customizable",
      description: "Tailor the system to your business needs",
      icon: <CogIcon className="h-10 w-10 text-yellow-500" />,
      delay: 0.6
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    {/* Logo Header Section */}
    <header className="px-4 sm:px-6 lg:px-8 py-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            type: "spring",
            duration: 0.8,
            delay: 0.2
          }}
          className="flex items-center mt-6"
        >
          <Image
            src="/eBikri-logo-purple.svg"
            alt="eBikri Logo"
            width={120}
            height={30}
            className="h-12 w-auto cursor-pointer transition-transform hover:scale-105"
            onClick={() => window.location.href = "/"}
            priority
          />
        </motion.div>
      </div>
    </header>

      {/* Main Headline Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Grow Your Business With <span className="text-purple-600">eBikri</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                The complete retail management solution designed for small businesses to streamline operations and boost sales.
              </p>
              {/* Sign up and Log in Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button className="px-8 py-4 text-lg font-semibold rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors shadow-lg hover:shadow-xl">
                    Get Started Now
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="px-8 py-4 text-lg font-semibold rounded-xl bg-white text-purple-500 border border-purple-600 hover:bg-purple-100 transition-colors">
                    Existing User? Login
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Dashboard Preview Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <Image 
                src="/dashboard-preview.png" 
                alt="eBikri Dashboard Preview" 
                width={800} 
                height={600} 
                className="rounded-xl shadow-2xl border border-gray-200"
              />
              {/* Floating Animated Card */}
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-200"
              >
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-green-500 mr-2" />
                  <span className="font-semibold">+32% Revenue</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900"
            >
              Everything You Need to Succeed
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Powerful tools designed to help small businesses thrive in the digital marketplace.
            </motion.p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: feature.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Review Section */}
      <section className="py-20 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-12 flex flex-col items-center justify-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Trusted by Local Businesses</h2>
                <div className="space-y-8">
                  <div>
                    <p className="text-lg text-gray-600 italic mb-4">
                      "eBikri transformed how we manage our inventory and sales. Our efficiency improved by 40% in just two months!"
                    </p>
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                        <UserGroupIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="mt-4">
                        <p className="font-semibold">Binod Shrestha</p>
                        <p className="text-gray-500">Online Shoes Business Owner</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-purple-600 p-12 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Image 
                    src="/happy-customer.jpg" 
                    alt="Happy Business Owner" 
                    width={370} 
                    height={370} 
                    className="rounded-lg shadow-2xl"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Ready to Transform Your Business?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto"
          >
            Join hundreds of businesses already growing with eBikri. Start your 14-day free trial today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link href="/signup">
              <Button className="px-10 py-5 text-lg font-semibold rounded-xl bg-white text-purple-600 hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl flex items-center mx-auto">
                Get Started Now <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Footer Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-center text-gray-500 text-sm py-4">
          &copy; {new Date().getFullYear()} eBikri. All Rights Reserved
        </div>
    </main>
  );
}