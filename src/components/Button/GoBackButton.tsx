import ArrowIcon from '../icons/ArrowIcon';
import Link from 'next/link';

export default function GoBackButton({
  handleDiscard,
  href,
}: {
  handleDiscard?: () => void;
  href?: string;
}) {
  const content = (
    <div className="mb-6 flex items-center gap-6 md:mb-[31px]">
      <div className="rotate-90">
        <ArrowIcon />
      </div>
      <p className="text-heading-s-variant hover:text-blue-gray dark:hover:text-gray-medium h-3 transition duration-200 ease-in-out">
        Go back
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block w-fit">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="mb-6 flex items-center gap-6 md:hidden"
      onClick={handleDiscard}
    >
      {content}
    </button>
  );
}
