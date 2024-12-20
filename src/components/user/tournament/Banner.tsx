import Image from 'next/image';
import Button from 'components/Button/Button';
import { useState, useEffect, useCallback } from 'react';
import banner from '/public/img/dashboards/banner.png';
import { useRouter } from 'next/navigation';
import { Match, TeamInfo, Player } from 'models/entities';
import { toast } from 'sonner';
import axios from 'axios';

interface BannerProps {
  match: Match;
  userId: string;
  tournamentId: string;
  setLoading: (loading: boolean) => void;
}

const Banner: React.FC<BannerProps> = ({
  match,
  userId,
  tournamentId,
  setLoading,
}) => {
  const [playersTeam1, setPlayersTeam1] = useState<Player[]>([]);
  const [playersTeam2, setPlayersTeam2] = useState<Player[]>([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const router = useRouter();

  const fetchPlayers = useCallback(
    async (
      teamId: string,
      setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
    ) => {
      if (!userId || !tournamentId || !teamId) {
        console.error('Missing parameters for fetching players');
        return;
      }
      try {
        const response = await axios.get(`/api/players/${teamId}`, {
          params: { userId, tournamentId },
        });
        setPlayers(response.data.players);
        console.log('players', response.data.players);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách cầu thủ:', error);
      }
    },
    [userId, tournamentId],
  );

  useEffect(() => {
    if (match?.opponent1.teamId && match?.opponent2?.teamId) {
      Promise.all([
        fetchPlayers(match.opponent1.teamId, setPlayersTeam1),
        fetchPlayers(match.opponent2.teamId, setPlayersTeam2),
      ]);
      setLoading(false);
    }
  }, [match, fetchPlayers, setLoading]);

  const handleOpenDialog = () => {
    if (playersTeam1.length < 5 || playersTeam2.length < 5) {
      toast.error('Vui lòng thêm đủ số lượng cầu thủ cho mỗi đội');
      router.push(`/admin/tournament/${tournamentId}/team`);
      return;
    }
    setOpen(true); // Mở dialog
  };

  const handleCloseDialog = () => {
    setOpen(false); // Đóng dialog
  };

  // useEffect(() => {
  //   setLoading(false); // Đặt loading thành false sau khi render xong
  // }, [setLoading]);
  console.log('loadingbanner', setLoading);
  return (
    <div
      className="flex w-full flex-col rounded-[20px] bg-cover px-[10px] py-[10px] md:px-[55px] md:py-[55px]"
      style={{ backgroundImage: `url(${banner.src})` }}
    >
      <div className="w-full">
        <div className="">
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex flex-1 flex-col items-center p-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md">
                <Image
                  src={match?.opponent1.teamLogo}
                  alt={`${match?.opponent1.teamName} Logo`}
                  className="h-full w-full rounded-full"
                  width={48}
                  height={48}
                />
              </div>
              <h2 className="mt-4 break-words text-center text-lg font-semibold text-white">
                {match?.opponent1.teamName}
              </h2>
            </div>

            {/* Match Details */}
            <div className="flex  flex-1 flex-grow flex-col items-center justify-center p-5 text-center">
              <h1 className="mb-2 text-lg text-white">
                {/* {match.date} at <strong>{match.time}</strong> */}
              </h1>
              <div className="flex  items-center gap-3 text-4xl font-semibold text-white">
                <h1>{match?.score.team1Score}</h1>

                <span className="mx-2">:</span>

                <h1>{match?.score.team2Score}</h1>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-1 flex-col items-center p-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md">
                <Image
                  src={match?.opponent2.teamLogo}
                  alt={`${match?.opponent2.teamName} Logo`}
                  className="h-full w-full rounded-full"
                  width={48}
                  height={48}
                />
              </div>
              <h2 className="mt-4 text-center text-lg font-semibold text-white">
                {match?.opponent2.teamName}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
