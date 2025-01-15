import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { poppins } from '@/app/ui/fonts';

export default function EbikriLogo() {
  return (
    <div
      className={`${poppins.className} flex flex-row items-center leading-none text-white`}
    >
      <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />
      <p className="text-[40px]">eBikri</p>
    </div>
  );
}
