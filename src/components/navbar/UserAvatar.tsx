import { User } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';
import Avatar from '../../components/icons/Avatar';

export default function UserAvatar({ user }: { user: User }) {
  return (
    <>
      {/* <Link
        href={`/profile/${user?.uid}`}
        className="relative w-8 h-8 lg:w-10 lg:h-10"
      > */}
      {user?.photoURL ? (
        <Image
          width="2"
          height="20"
          className="h-10 w-10 rounded-full"
          src={user.photoURL}
          alt="User avatar"
        />
      ) : (
        <Avatar />
      )}
      {/* </Link> */}
    </>
  );
}
