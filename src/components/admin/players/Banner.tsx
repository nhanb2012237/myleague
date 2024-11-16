import avatar from '/public/img/avatars/avatar11.png';
import banner from '/public/img/profile/banner.png';
import Card from 'components/card';
import Image from 'next/image';
import { Player } from 'models/entities';

const Banner = (props: { player: Player }) => {
  const { player } = props;
  console.log('player1', player);

  return (
    <Card extra={'items-center w-full h-full p-[16px] bg-cover'}>
      {/* Background and profile */}
      <div
        className="relative mt-1 flex h-32 w-full justify-center rounded-md bg-cover"
        style={{ backgroundImage: `url(${banner.src})` }}
      >
        <div className="absolute -bottom-20 flex h-[164px] w-[164px] items-center justify-center rounded-md border-[4px] border-white bg-pink-400 dark:!border-navy-700">
          <Image
            width="2"
            height="20"
            className="h-full w-full rounded-md"
            src={player?.avatarUrl}
            alt=""
          />
        </div>
      </div>

      {/* Name and position */}
      <div className="mt-20 flex flex-col items-center">
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
          {player?.playerName}
        </h4>
        <h5 className="text-base font-normal text-gray-600">
          {player?.position}
        </h5>
      </div>

      {/* Post followers */}
      {/* <div className="mb-3 mt-6 flex gap-4 md:!gap-14">
        <div className="flex flex-col items-center justify-center">
          <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
            17
          </h4>
          <p className="text-sm font-normal text-gray-600">Posts</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
            9.7K
          </h4>
          <p className="text-sm font-normal text-gray-600">Followers</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
            434
          </h4>
          <p className="text-sm font-normal text-gray-600">Following</p>
        </div>
      </div> */}
    </Card>
  );
};

export default Banner;
