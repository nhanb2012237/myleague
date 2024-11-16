import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Player } from 'models/entities';
import { Avatar, Card, Typography } from '@material-tailwind/react';

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
}

const TopCreatorTable: React.FC<TopCreatorTableProps> = ({
  userId,
  tournamentId,
  setLoading,
}) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);

  const TABLE_HEAD = ['PlayerName', 'Team', 'Goals'];

  // Fetch players, teams, and goals from the API
  useEffect(() => {
    async function fetchData() {
      try {
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
      }
    }

    fetchData();
    setLoading(false);
  }, [userId, tournamentId, setLoading]);

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
      setLoading(false);
    }
  }, [players, goals, setLoading]);

  return (
    <div>
      <div className="-mt-3 flex items-center justify-between rounded-t-3xl">
        <div className="mt-1 text-lg font-bold text-navy-700 dark:text-white">
          Cầu thủ ghi bàn
        </div>
        {/* <button className="linear rounded-[20px] bg-lightPrimary px-4 py-2 text-base font-medium text-brand-500 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:active:bg-white/20">
          See all
        </button> */}
      </div>
      <Card className="mt-5 rounded-md ">
        <div className="mt-0 overflow-x-scroll rounded-md xl:overflow-x-hidden">
          <table className="w-full min-w-max table-auto rounded-md text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topPlayers.map(
                (
                  { avatarUrl, playerName, teamId, goals, jerseyNumber },
                  index,
                ) => {
                  const isLast = index === topPlayers.length - 1;
                  const classes = isLast
                    ? 'p-4'
                    : 'p-4 border-b border-blue-gray-50';

                  return (
                    <tr key={playerName}>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <Avatar src={avatarUrl} alt={playerName} size="sm" />
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {playerName}({jerseyNumber})
                            </Typography>
                          </div>
                        </div>
                      </td>

                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {getTeamNameById(teamId)}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {goals}
                        </Typography>
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TopCreatorTable;
