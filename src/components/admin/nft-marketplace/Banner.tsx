import Image from 'next/image';
import Button from 'components/Button/Button';
import { useState, useEffect, useCallback } from 'react';
import banner from '/public/img/dashboards/banner.png';
import { useRouter } from 'next/navigation';
import ScoreDialog from './ScoreDialog';
import { Match, TeamInfo, Player } from 'models/entities';
import CompletedMatchDialog from './CompletedMatch';
import { toast } from 'sonner';
import axios from 'axios';
import Spinner from 'components/Loader/Spinner';

interface BannerProps {
  match: Match;
  userId: string;
  tournamentId: string;
  setLoading: (loading: boolean) => void;
  onReload: () => void; // Thêm prop onReload
  reload: boolean; // Thêm prop reload
}

const Banner: React.FC<BannerProps> = ({
  match,
  userId,
  tournamentId,
  setLoading,
  onReload,
  reload,
}) => {
  const [playersTeam1, setPlayersTeam1] = useState<Player[]>([]);
  // const [loading, setLoading] = useState(true);
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
    if (match?.opponent1?.teamId && match?.opponent2?.teamId) {
      Promise.all([
        fetchPlayers(match.opponent1.teamId, setPlayersTeam1),
        fetchPlayers(match.opponent2.teamId, setPlayersTeam2),
      ]);
      setLoading(false);
    }
  }, [match, fetchPlayers, setLoading]);

  console.log('setPlayersTeam1:', playersTeam1);
  console.log('setPlayersTeam2:', playersTeam2);

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

  if (!setLoading) {
    return <Spinner />;
  }

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
                  src={match.opponent1.teamLogo}
                  alt={`${match.opponent1.teamName} Logo`}
                  className="h-full w-full rounded-full"
                  width={48}
                  height={48}
                />
              </div>
              <h2 className="mt-4 break-words text-center text-lg font-semibold text-white">
                {match.opponent1.teamName}
              </h2>
            </div>

            {/* Match Details */}
            <div className="flex  flex-1 flex-grow flex-col items-center justify-center p-5 text-center">
              <h1 className="mb-2 text-lg text-white">
                {/* {match.date} at <strong>{match.time}</strong> */}
              </h1>
              <div className="flex  items-center gap-3 text-4xl font-semibold text-white">
                <h1>{match.score.team1Score}</h1>

                <span className="mx-2">:</span>

                <h1>{match.score.team2Score}</h1>
              </div>
              {/* {isAuthenticated && ( */}
              <Button
                variant="default"
                className="mb-0 mt-12"
                onClick={handleOpenDialog}
              >
                CẬP NHẬT
              </Button>
              {/* )} */}
            </div>

            {/* Away Team */}
            <div className="flex flex-1 flex-col items-center p-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md">
                <Image
                  src={match.opponent2.teamLogo}
                  alt={`${match.opponent2.teamName} Logo`}
                  className="h-full w-full rounded-full"
                  width={48}
                  height={48}
                />
              </div>
              <h2 className="mt-4 text-center text-lg font-semibold text-white">
                {match.opponent2.teamName}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {match.status !== 'completed' ? (
        <ScoreDialog
          open={open}
          onClose={handleCloseDialog}
          team1={match.opponent1}
          team2={match.opponent2}
          userId={userId}
          match={match}
          tournamentId={tournamentId}
          logo1={match.opponent1.teamLogo}
          logo2={match.opponent2.teamLogo}
          matchId={match.matchId}
          setIsEditing={setIsEditing}
          onReload={onReload}
        />
      ) : (
        <CompletedMatchDialog
          open={open}
          onClose={handleCloseDialog}
          team1={match.opponent1}
          team2={match.opponent2}
          userId={userId}
          match={match}
          tournamentId={tournamentId}
          logo1={match.opponent1.teamLogo}
          logo2={match.opponent2.teamLogo}
          matchId={match.matchId}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onReload={onReload}
        />
      )}
    </div>
  );
};

export default Banner;
