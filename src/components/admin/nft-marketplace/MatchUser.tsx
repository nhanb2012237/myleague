import Card from 'components/card';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Match } from '../../../models/entities';
import { Chip } from '@material-tailwind/react';

interface TopPlayersProps {
  handleMatchSelect: (match: Match) => void;
  userId: string;
  tournamentId: string;
  setLoading: (loading: boolean) => void;
}

const MatchUser: React.FC<TopPlayersProps> = ({
  handleMatchSelect,
  userId,
  tournamentId,
  setLoading,
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  useEffect(() => {
    const fetchMatches = async () => {
      if (!userId || !tournamentId) {
        return;
      }
      try {
        const response = await axios.get(`/api/matches/getMatch`, {
          params: {
            tournamentId,
            userId,
          },
        });
        setMatches(response.data.matches);
        handleMatchSelect(response.data.matches[0]);
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };
    fetchMatches();
    setLoading(false);
  }, [userId, tournamentId, setLoading]);

  console.log('loadingmatch', setLoading);

  return (
    <>
      {/* HistoryCard Header */}
      <div className="flex items-center justify-between rounded-t-3xl p-3">
        <div className="text-lg font-bold text-navy-700 dark:text-white">
          Trận đấu
        </div>
      </div>

      <div className="border-slate-100 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 mt-5 max-h-60 overflow-y-auto border-t p-3 text-center">
        {matches.map((match) => (
          <div
            key={match.matchId}
            className="text-slate-600 mb-4 mt-2  grid max-w-lg grid-cols-7 items-center justify-center gap-5 rounded-xl border border-gray-100 bg-white p-2 font-light leading-normal transition hover:shadow-2xl hover:shadow-gray-600/10 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none md:p-4"
            onClick={() => handleMatchSelect(match)} // Gọi hàm khi nhấn vào trận đấu
          >
            <div className="col-span-3 flex flex-col items-center justify-center gap-3">
              <div className="flex flex-col items-center justify-center">
                <div className="h-[50px] w-[50px]">
                  <Image
                    width="50"
                    height="50"
                    className="h-full w-full rounded-full"
                    src={match.opponent1.teamLogo}
                    alt=""
                  />
                </div>
                <h5 className="mt-2 text-base font-bold text-navy-700 dark:text-white">
                  {match.opponent1.teamName}
                </h5>
              </div>
            </div>

            <div className="">
              <div className="flex items-center justify-center gap-2 text-3xl font-semibold text-navy-900">
                <h1>{match.score.team1Score}</h1>
                <span className="mx-2">:</span>
                <h1>{match.score.team2Score}</h1>
              </div>
              <div className="col-span-7 mt-2 flex items-center justify-center">
                <Chip
                  color={match.status === 'completed' ? 'green' : 'red'}
                  value={
                    match.status === 'completed' ? 'Kết thúc' : 'Chưa bắt đầu'
                  }
                />
              </div>
            </div>

            <div className="col-span-3 flex flex-col items-center gap-3">
              <div className="flex flex-col items-center">
                <div className="h-[50px] w-[50px]">
                  <Image
                    width="50"
                    height="50"
                    className="h-full w-full rounded-full"
                    src={match.opponent2.teamLogo}
                    alt=""
                  />
                </div>
                <h5 className="mt-2 text-base font-bold text-navy-700 dark:text-white">
                  {match.opponent2.teamName}
                </h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MatchUser;
