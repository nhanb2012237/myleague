'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Card from 'components/card';
import Image from 'next/image';
import banner from '/public/img/profile/banner.png';
import Button from 'components/Button/Button';
import axios from 'axios';
import { Player } from 'models/entities';
import { MdModeEditOutline } from 'react-icons/md';
import Spinner from 'components/Loader/LoaderLoading'; // Import Loader component

interface TeamCardProps {
  image: string;
  title: string;
  coach: string;
  tournamentId: string;
  teamId: string;
  userId: string; // Optional: add this prop
}

const TeamCard = (props: TeamCardProps) => {
  const { title, coach, image, teamId, tournamentId, userId } = props;
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false); // State to manage loading

  const fetchPlayers = useCallback(async () => {
    try {
      if (teamId && userId && tournamentId) {
        const response = await axios.get(`/api/players/${teamId}`, {
          params: { userId, tournamentId },
        });
        console.log('Danh sách cầu thủ:', response.data.players);
        setPlayers(response.data.players);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách cầu thủ:', error);
    }
  }, [teamId, tournamentId, userId]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const router = useRouter();

  const onEdit = () => {
    setLoading(true); // Set loading to true when button is clicked
    setTimeout(() => {
      setLoading(false); // Reset loading after navigation
      router.push(`/admin/tournament/${tournamentId}/team/${teamId}`); // Điều hướng đến trang chỉnh sửa với teamId
    }, 1500); // Simulate loading time
  };

  return (
    <Card extra={'items-center w-full h-full p-[16px] bg-cover'}>
      {/* Background and profile */}
      <div
        className="relative mt-1 flex h-32 w-full justify-center rounded-xl bg-cover"
        style={{ backgroundImage: `url(${banner.src})` }}
      >
        <div className="absolute -bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white bg-pink-400 dark:!border-navy-700">
          <Image
            width={2}
            height={20}
            className="h-full w-full rounded-full"
            src={image}
            alt="Image description"
          />
        </div>
      </div>

      {/* Name and position */}
      <div className="mt-12 flex flex-col items-center">
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
          {title}
        </h4>
      </div>

      <div className="mb-3 flex items-center justify-between px-1 md:flex-col md:items-start lg:flex-row lg:justify-between xl:flex-col xl:items-start 3xl:flex-row 3xl:justify-between">
        <p className="mt-1 text-sm font-medium text-gray-600 md:mt-2">
          Coach {coach}{' '}
        </p>
      </div>
      <div className="flex gap-5">
        <div className="flex-1">
          <div className="  flex flex-row-reverse items-center md:mt-2 lg:mt-0">
            <span className="z-0 ml-px inline-flex h-8 w-8 items-center justify-center rounded-full border border-white bg-[#E0E5F2] text-xs text-navy-700 dark:!border-navy-800 dark:bg-gray-800 dark:text-white">
              +{players.length < 3 ? 0 : 5 - players.length}
            </span>
            {players.map((avt, key) => (
              <span
                key={key}
                className="-mr-3 h-8 w-8 rounded-full border border-white dark:!border-navy-800"
              >
                <Image
                  width="2"
                  height="20"
                  className="h-full w-full rounded-full object-cover"
                  src={avt.avatarUrl}
                  alt=""
                />
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className=" flex-2 mt-3 w-full">
        <Button
          className="w-full bg-navy-800 text-white hover:text-navy-800"
          onClick={onEdit}
          // disabled={loading} // Disable button when loading
        >
          {loading ? <Spinner size="small" /> : 'chỉnh sửa'}{' '}
          {/* Show loader when loading */}
        </Button>
      </div>
    </Card>
  );
};

export default TeamCard;
