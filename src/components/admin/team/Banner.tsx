import avatar from '/public/img/avatars/avatar11.png';
import banner from '/public/img/profile/banner.png';
import Card from 'components/card';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Team } from '../../../models/entities';

interface BannerProps {
  teamId: string;
  userId: string;
  tournamentId: string;
  team: Team | null;
}

const Banner = ({ teamId, userId, tournamentId, team }: BannerProps) => {
  // const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <Card extra={'items-center w-full h-full p-[16px] bg-cover'}>
      {/* Background and profile */}
      <div
        className="relative mt-1 flex h-32 w-full justify-center rounded-xl bg-cover"
        style={{ backgroundImage: `url(${banner.src})` }}
      >
        <div className="absolute -bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white bg-pink-400 dark:!border-navy-700">
          <Image
            width="2"
            height="20"
            className="h-full w-full rounded-full"
            src={team?.teamLogo || avatar}
            alt=""
          />
        </div>
      </div>

      {/* Name and position */}
      <div className="mt-16 flex flex-col items-center">
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
          {team?.teamName || 'Team Name'}
        </h4>
        <h5 className="text-base font-normal text-gray-600">Product Manager</h5>
      </div>
    </Card>
  );
};

export default Banner;
