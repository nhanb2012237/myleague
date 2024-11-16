import Image from 'next/image';

export default function Logo() {
  return (
    <div className="relative w-[100px] md:w-20 lg:w-full">
      <div className="relative left-0 top-0 z-10 -mt-3 ">
        <Image src="/logo4.png" alt="Logo" width="150" height="100" priority />
      </div>
    </div>
  );
}
