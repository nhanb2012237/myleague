import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
  CardFooter,
  Avatar,
} from '@material-tailwind/react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { HiMiniArrowDownTray } from 'react-icons/hi2';
import { HiChevronUpDown } from 'react-icons/hi2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { MdModeEditOutline } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import Spinner from 'components/Loader/Spinner';

const TABLE_HEAD = [
  { label: 'TÊN CẦU THỦ', key: 'playerName' },
  { label: 'ĐỘI BÓNG', key: 'teamName' },
  { label: 'BÀN THẮNG', key: 'goals' },
];

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

interface PlayerTableProps {
  tournamentId: string | string[];
  userId: string;
  setLoading: (loading: boolean) => void;
}

const PlayerTable: React.FC<PlayerTableProps> = ({
  userId,
  tournamentId,
  // setLoading,
}) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [goals, setGoals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(5); // Số lượng cầu thủ trên mỗi trang
  const [sortConfig, setSortConfig] = useState({
    key: 'playerName',
    direction: 'asc',
  });
  const router = useRouter();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get('/api/players/getPlayers', {
          params: {
            userId,
            tournamentId,
            page: currentPage,
            pageSize,
          },
        });
        setPlayers(response.data.players);
        setTotalPages(response.data.totalPages || 1); // Đảm bảo totalPages không bị undefined
        console.log('totalPages:', response.data.totalPages);
        console.log('Players:', response.data.players);
      } catch (error) {
        console.error('Failed to fetch players:', error);
      }
    };

    const fetchTeams = async () => {
      try {
        const response = await axios.get('/api/teams/getTeam', {
          params: {
            userId,
            tournamentId,
          },
        });
        setTeams(response.data.teams);
        console.log('Teams:', response.data.teams);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
      }
    };

    const fetchGoals = async () => {
      try {
        const response = await axios.get('/api/goals/getGoals', {
          params: {
            userId,
            tournamentId,
          },
        });
        setGoals(response.data);
        console.log('Goals:', response.data);
      } catch (error) {
        console.error('Failed to fetch goals:', error);
      }
    };

    if (userId && tournamentId) {
      fetchPlayers();
      fetchTeams();
      fetchGoals();
      setLoading(false);
    }
  }, [userId, tournamentId, currentPage, pageSize, setLoading]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find((team) => team.id === teamId);
    return team ? team.teamName : 'Không xác định';
  };

  const getGoalsByPlayerId = (playerId: string) => {
    if (!goals) return 0;
    const playerGoals = goals.find((goal) => goal.playerId === playerId);
    return playerGoals ? playerGoals.goals : 0;
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

  const sortedPlayers = [...players].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredPlayers = sortedPlayers.filter((player) =>
    player.playerName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading && !filteredPlayers) return <Spinner />;

  return (
    <Card className="flex h-full w-full flex-col">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Typography variant="h5" color="blue-gray">
              Thống kê cầu thủ
            </Typography>
          </div>
        </div>
      </CardHeader>
      <CardBody className="flex-grow overflow-x-auto">
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
            {filteredPlayers.map((player, index) => (
              <tr key={index}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={player.avatarUrl}
                      alt={player.playerName}
                      size="sm"
                    />
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
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {getTeamName(player.teamId)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {getGoalsByPlayerId(player.playerId)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>

      <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Trang {currentPage} của {totalPages}
        </Typography>
        <div className="flex gap-2">
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

export default PlayerTable;
