import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '../../lib/hooks';
import { logout } from '../../lib/features/auth/authOperations';
import Dropdown from 'components/dropdown';
import UserAvatar from './UserAvatar';
import Avatar from '../icons/Avatar';
import { toast } from 'sonner';

export default function UserLinks() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { user, refreshing } = useAppSelector((state) => state.auth);
  console.log(user);

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

  return (
    <>
      <Dropdown
        button={
          user && !refreshing ? <UserAvatar user={user} /> : <Avatar />
          // <Image
          //   width="2"
          //   height="20"
          //   className="h-10 w-10 rounded-full"
          //   src={avatar}
          //   alt="Elon Musk"
          // />
        }
        classNames={'py-2 top-8 -left-[180px] w-max'}
      >
        <div className="flex h-48 w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
          <div className="ml-4 mt-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-navy-700 dark:text-white">
                👋 Hey, Adela
              </p>{' '}
            </div>
          </div>
          <div className="mt-3 h-px w-full bg-gray-200 dark:bg-white/20 " />

          <div className="ml-4 mt-3 flex flex-col">
            <a className="text-sm text-gray-800 dark:text-white hover:dark:text-white">
              {/* <Link href={}>Sign In</Link> */}
            </a>
            <a
              href=" "
              className="mt-3 text-sm text-gray-800 dark:text-white hover:dark:text-white"
            >
              {/* <Link href={}>Sign Up</Link> */}
            </a>
            <a
              onClick={handleLogout}
              href=" "
              className="mt-3 text-sm font-medium text-red-500 hover:text-red-500"
            >
              Log Out
            </a>
          </div>
        </div>
      </Dropdown>
    </>
  );
}
