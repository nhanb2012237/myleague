import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  CardFooter,
} from '@material-tailwind/react';
import Image from 'next/image';
import { set } from 'date-fns';
import Spinner from 'components/Loader/Spinner';

const TABLE_HEAD = [
  { label: 'ĐỘI BÓNG', key: 'teamName' },
  { label: 'BÀN THẮNG', key: 'goals' },
  { label: 'THẺ PHẠT', key: 'cards' },
  { label: 'CẦU THỦ GHI BÀN', key: 'topScorer' },
];

interface TeamStatsTableProps {
  players: any[];
  teams: any[];
  goals: any[];
  totalcard: any[];
  setLoading: (loading: boolean) => void;
}

const TeamStatsTable: React.FC<TeamStatsTableProps> = ({
  players,
  teams,
  goals,
  totalcard,
  // setLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(5); // Số lượng đội bóng trên mỗi trang
  const [sortConfig, setSortConfig] = useState({
    key: 'teamName',
    direction: 'asc',
  });
  const [teamStats, setTeamStats] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      const stats = teams.map((team) => {
        const teamPlayers = players.filter(
          (player) => player.teamId === team.id,
        );

        const totalGoals = goals
          .filter((goal) => goal.teamId === team.id)
          .reduce((sum, goal) => sum + goal.goals, 0);

        const teamPenalties = totalcard.filter(
          (penalty) => penalty.teamId === team.id,
        );

        const totalYellowCards = teamPenalties.reduce(
          (sum, penalty) => sum + (penalty.type === 'yellow' ? 1 : 0),
          0,
        );

        const totalRedCards = teamPenalties.reduce(
          (sum, penalty) => sum + (penalty.type === 'red' ? 1 : 0),
          0,
        );

        const totalCards = `${totalYellowCards}/${totalRedCards}`;

        const playerGoals = teamPlayers.map((player) => {
          const totalPlayerGoals = goals
            .filter((goal) => goal.playerId === player.id)
            .reduce((sum, goal) => sum + goal.goals, 0);
          return { ...player, goals: totalPlayerGoals };
        });

        const topScorer = playerGoals.reduce(
          (max, player) => (player.goals > max.goals ? player : max),
          playerGoals[0],
        );

        return {
          teamName: team.teamName,
          avatar: team.teamLogo,
          goals: totalGoals,
          cards: totalCards,
          topScorer: topScorer
            ? `${topScorer.playerName} (${topScorer.goals} bàn)`
            : 'Không xác định',
        };
      });
      setTeamStats(stats);
      setTotalPages(Math.ceil(stats.length / pageSize));
    };

    fetchData();
    setLoading(false);
  }, [players, teams, goals, totalcard, pageSize, setLoading]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTeams = [...teamStats].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredTeams = sortedTeams.filter((team) =>
    team.teamName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading && !filteredTeams) {
    return <Spinner />;
  }

  return (
    <Card className="flex h-full w-full flex-col">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Typography variant="h5" color="blue-gray">
              Thống kê đội bóng
            </Typography>
          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head.key}
                  scope="col"
                  className="p-4 transition-colors hover:bg-blue-gray-50"
                  onClick={() => handleSort(head.key)}
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center justify-between gap-2 text-sm font-bold leading-none text-gray-900 opacity-80 dark:text-white"
                  >
                    {head.label}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredTeams.map((team, index) => (
              <tr key={index}>
                <td className="flex items-center gap-2 whitespace-nowrap px-2 py-4 text-sm font-bold text-gray-900">
                  <Image
                    src={team.avatar}
                    alt={team.teamName}
                    width={20}
                    height={20}
                    className="h-10 w-10 rounded-full"
                  />
                  {team.teamName}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {team.goals}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {team.cards}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {team.topScorer}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
      <CardFooter className="mt-auto flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Typography variant="small" color="blue-gray" className=" font-normal">
          Trang {currentPage} của {totalPages}
        </Typography>
        <div className=" flex gap-2">
          <Button
            variant="outlined"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Trước
          </Button>
          <Button
            variant="outlined"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Sau
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TeamStatsTable;
