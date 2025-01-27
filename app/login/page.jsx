import EbikriLogo from '@/app/ui/ebikri-logo';
import LoginForm from '@/app/ui/login-form';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
 
export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
      
          if (response.ok) {
            alert('Welcome to eBikri');
            setFormData({
              email: '',
              password: '',
            });
          } else {
            const data = await response.json();
            alert(data.error || 'Log in failed');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Something went wrong');
        }
      };

    return (
    <main className="flex min-h-screen flex-col bg-gray-50 p-6">
        {/* <div className="flex h-20 shrink-0 items-end rounded-lg bg-red-500 p-4 md:h-20">
        <EbikriLogo />
        </div> */}

        <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
            {/* Left Section */}
            <div className="flex flex-col justify-center gap-6 px-6 py-10 md:w-1/2 md:px-20">
            <LoginForm formData={formData} onChange={handleChange} onSubmit={handleSubmit} />
            </div>

            {/* Vertical line */}
            <div className="hidden md:block w-px bg-gray-300"></div>

            {/* Right Section */}
            <div className="flex flex-col justify-center gap-10 rounded-lg px-6 py-10 md:w-1/2 md:px-20">
                <p className={`text-xl text-gray-800 md:text-4xl md:leading-normal`}>
                    <strong>Welcome to eBikri</strong> 
                </p>
                <p>
                <span className="text-xl">eBikri is a complete Retail Business Management Application for your small online business.</span>
                </p>

                <div className="flex items-center gap-3">
                    <p className="text-base">Don't have an account?</p>
                    <Link href="/signup">
                        <Button className="flex items-center gap-4 rounded-xl bg-red-500 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-red-400">
                            <span>Register</span> <ArrowRightIcon className="w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        
        </div>
    </main>
  );
}