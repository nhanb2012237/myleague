import Image from 'next/image';
import avatar from '/public/img/avatars/avatar11.png';

export default function AvatarDisplay({
  photoURL,
}: {
  photoURL: string | null;
}) {
  return (
    <div className="relative h-full w-full">
      {photoURL ? (
        <Image
          src={photoURL}
          alt="User avatar"
          className="h-full w-full rounded-md"
          sizes="100%"
          fill
        />
      ) : (
        <Image
          src={avatar}
          alt="User avatar"
          className="h-full w-full object-cover"
          sizes="100%"
          fill
        />
      )}
      <label
        htmlFor="avatarInput"
        className="text-heading-s-variant bg-dark/0 hover:bg-dark/40 absolute left-0 top-0 z-20 mb-auto flex h-full w-full cursor-pointer items-center justify-center rounded-full text-white/0 transition duration-200 ease-in-out hover:text-white/100"
      >
        Upload
      </label>
    </div>
  );
}
