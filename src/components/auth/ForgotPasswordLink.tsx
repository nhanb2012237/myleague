import Link from 'next/link';

export default function ForgotPasswordLink() {
  return (
    <Link
      href={'/forgot-password'}
      className="mb-6 mt-2 flex w-full justify-start"
    >
      <button
        type="button"
        className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
      >
        Quên mật khẩu?
      </button>
    </Link>
  );
}
