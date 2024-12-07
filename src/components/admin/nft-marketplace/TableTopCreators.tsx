import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Player } from 'models/entities';
import { Avatar, Card, Typography } from '@material-tailwind/react';
import Spinner from 'components/Loader/Spinner';

interface Team {
  teamId: string;
  teamName: string;
}

interface Goal {
  playerId: string;
  goals: number;
}

interface TopCreatorTableProps {
  userId: string;
  tournamentId: string;
  setLoading: (loading: boolean) => void;
  reload: boolean;
}

const TopCreatorTable: React.FC<TopCreatorTableProps> = ({
  userId,
  tournamentId,
  setLoading,
  reload,
}) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [loading, setLocalLoading] = useState<boolean>(true); // Thêm trạng thái loading riêng

  const TABLE_HEAD = [
    { label: 'Tên cầu thủ', key: 'Tên cầu' },
    { label: 'Đội', key: 'Đội' },
    { label: 'Bàn thắng', key: 'Bàn thắng' },
  ];

  // Fetch players, teams, and goals from the API
  useEffect(() => {
    async function fetchData() {
      try {
        setLocalLoading(true);
        setLoading(true);

        const [playersResponse, teamsResponse, goalsResponse] =
          await Promise.all([
            axios.get('/api/players/allPlayers', {
              params: {
                userId,
                tournamentId,
              },
            }),
            axios.get('/api/teams/getTeam', {
              params: {
                userId,
                tournamentId,
              },
            }),
            axios.get('/api/goals/getGoals', {
              params: {
                userId,
                tournamentId,
              },
            }),
          ]);

        setPlayers(playersResponse.data.players);
        console.log('players:', playersResponse.data.players);
        setTeams(teamsResponse.data.teams);
        console.log('teams:', teamsResponse.data.teams);
        setGoals(goalsResponse.data);
        console.log('goals:', goalsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLocalLoading(false);
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, tournamentId, setLoading, reload]);

  // Helper function to get team name by team ID
  const getTeamNameById = (teamId: string) => {
    const team = teams.find((team) => team.teamId === teamId);
    return team ? team.teamName : 'Unknown Team';
  };

  // Calculate total goals for each player
  useEffect(() => {
    if (
      Array.isArray(players) &&
      players.length > 0 &&
      Array.isArray(goals) &&
      goals.length > 0
    ) {
      const playerGoals = players.map((player) => {
        const totalGoals = goals
          .filter((goal) => goal.playerId === player.playerId)
          .reduce((sum, goal) => sum + goal.goals, 0);
        return { ...player, goals: totalGoals };
      });

      // Sort players by goals and take the top 3
      const sortedPlayers = playerGoals
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 3);
      setTopPlayers(sortedPlayers);
    } else {
      setTopPlayers([]); // Đặt lại topPlayers nếu không có goals
    }
  }, [players, goals]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="-mt-3 flex items-center justify-between rounded-t-3xl">
        <div className="mt-1 text-lg font-bold text-navy-700 dark:text-white">
          Cầu thủ ghi bàn
        </div>
      </div>
      <Card className="mt-5 rounded-md ">
        <div className="mt-0 overflow-x-scroll rounded-md xl:overflow-x-hidden">
          <table className="w-full min-w-max table-auto rounded-md text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head.key}
                    className=" border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="flex items-center justify-between gap-2 pr-4 font-bold leading-none opacity-70"
                    >
                      {head.label}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topPlayers.length > 0 ? (
                topPlayers.map((player, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap py-4 pl-3 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <Avatar src={player.avatarUrl} size="sm" />
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {player.playerName}({player.jerseyNumber})
                          </Typography>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap py-2 pl-3 text-center text-sm font-medium text-gray-900">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {getTeamNameById(player.teamId)}
                      </Typography>
                    </td>

                    <td className="whitespace-nowrap py-4 pl-0 text-center text-sm font-medium text-gray-900">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {player.goals}
                      </Typography>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-gray-900"
                  >
                    Không có dữ liệu bàn thắng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TopCreatorTable;
