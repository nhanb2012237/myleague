import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../lib/hooks';
import ArrowIcon from '../icons/ArrowIcon';
import Link from 'next/link';
import { logout } from '../../lib/features/auth/authOperations';
import { toast } from 'sonner';

export default function LogoutButton({
  handleDiscard,
  href,
}: {
  handleDiscard?: () => void;
  href?: string;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      localStorage.removeItem('token');
      toast.success('Logged out successfully');
      router.replace('/auth/sign-in'); // Sử dụng router.replace để thay thế lịch sử
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const content = (
    <div className="mb-6 flex items-center gap-6 md:mb-[31px]">
      <div className="rotate-90">
        <ArrowIcon />
      </div>
     
    </div>
  );

    return (
      <button
        type="button"
        className="mb-6 flex items-center gap-6 md:hidden"
        onClick={handleLogout}
      >
        {content}
      </button>
    );
  }


}
