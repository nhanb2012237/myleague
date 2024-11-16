import Image from 'next/image'; // Ensure you import Image from next/image if using Next.js

export default function Spinner() {
  return (
    <div className="flex h-svh items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
    </div>
  );
}
