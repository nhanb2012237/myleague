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
} from '@material-tailwind/react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { HiMiniArrowDownTray } from 'react-icons/hi2';
import { HiChevronUpDown } from 'react-icons/hi2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import AmiriRegular from './Amiri-Regular.base64'; // Đảm bảo bạn đã chuyển đổi font sang Base64 và lưu vào file này
import { MdModeEditOutline } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import Spinner from 'components/Loader/Spinner';
import { Player } from 'models/entities';
import NoPlayerData from 'components/admin/players/NoPlayers';
import NoPlayerSearch from 'components/admin/players/NoPlayerSearch';

const TABLE_HEAD = [
  { label: 'Tên cầu thủ', key: 'playerName' },
  { label: 'Email', key: 'email' },
  { label: 'Số điện thoại', key: 'phone' },
  { label: 'Vị trí', key: 'position' },
  { label: 'Bàn thắng', key: 'goals' },
  { label: 'Đội bóng', key: 'teamName' },
  { label: 'Chỉnh sửa', key: 'edit' },
];

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

interface PlayerTableProps {
  tournamentId: string;
  userId: string;
}

const PlayerTable: React.FC<PlayerTableProps> = ({ tournamentId, userId }) => {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10); // Số lượng cầu thủ trên mỗi trang
  const [sortConfig, setSortConfig] = useState({
    key: 'playerName',
    direction: 'asc',
  });
  const router = useRouter();

  useEffect(() => {
    const fetchPlayersAndGoals = async () => {
      try {
        const playersResponse = await axios.get('/api/players/getPlayers', {
          params: {
            userId,
            tournamentId,
            page: currentPage,
            pageSize,
          },
        });
        const playersData = playersResponse.data.players;

        // Fetch goals for the current page of players
        const playerIds = playersData.map((player) => player.id);
        const goalsResponse = await axios.get('/api/goals/getGoals', {
          params: {
            userId,
            tournamentId,
            playerIds,
          },
        });
        const goalsData = goalsResponse.data;

        // Calculate goals by player
        const goalsByPlayer = goalsData.reduce((acc, goal) => {
          const playerId = goal.playerId;
          if (!acc[playerId]) {
            acc[playerId] = 0;
          }
          acc[playerId] += goal.goals || 0;
          return acc;
        }, {});

        // Update players with goals
        const updatedPlayers = playersData.map((player) => ({
          ...player,
          goals: goalsByPlayer[player.id] || 0,
        }));

        setPlayers(updatedPlayers);
        setTotalPages(playersResponse.data.totalPages || 1); // Đảm bảo totalPages không bị undefined
        console.log('totalPages:', playersResponse.data.totalPages);
        console.log('Players:', updatedPlayers);
      } catch (error) {
        console.error('Failed to fetch players and goals:', error);
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

    if (userId && tournamentId) {
      Promise.all([fetchPlayersAndGoals(), fetchTeams()]).then(() => {
        setLoading(false);
      });
    }
  }, [userId, tournamentId, currentPage, pageSize]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find((team) => team.id === teamId);
    return team ? team.teamName : 'Không xác định';
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

  const exportPDF = () => {
    const doc = new jsPDF();

    // Add the custom font
    doc.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.setFont('Amiri');

    doc.text('Danh sách cầu thủ', 16, 12);
    doc.autoTable({
      head: [TABLE_HEAD.map((head) => head.label)],
      body: filteredPlayers.map((player) => [
        player.playerName,
        player.email,
        player.phone,
        player.position,
        player.goals || 0,
        getTeamName(player.teamId),
      ]),
      styles: { font: 'Amiri' }, // Ensure the custom font is used for the table
    });
    doc.save('danh_sach_cau_thu.pdf');
  };

  if (loading) {
    return <Spinner />; // You can replace this with a spinner or any loading indicator
  }

  return (
    <div>
      {filteredPlayers.length === 0 ? (
        searchQuery ? (
          <NoPlayerData />
        ) : (
          <NoPlayerSearch />
        )
      ) : (
        <Card className="h-full w-full">
          <CardHeader floated={false} shadow={false} className="rounded-none">
            <div className=" flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div>
                <Typography variant="h5" color="blue-gray">
                  Danh sách cầu thủ
                </Typography>
                <Typography color="gray" className="mt-1 font-normal">
                  Đây là danh sách các cầu thủ trong đội
                </Typography>
              </div>
              <div className="flex w-full shrink-0 gap-2 md:w-max">
                <div className="w-full md:w-72">
                  <Input
                    label="Tìm kiếm"
                    icon={<FaMagnifyingGlass className="h-5 w-5" />}
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <Button
                  className="flex items-center gap-3"
                  size="sm"
                  onClick={exportPDF}
                >
                  <HiMiniArrowDownTray strokeWidth={2} className="h-4 w-4" />{' '}
                  Tải về PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th
                      key={head.key}
                      scope="col"
                      className="cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50"
                      onClick={() => handleSort(head.key)}
                    >
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
                      >
                        {head.label}
                        <HiChevronUpDown strokeWidth={2} className="h-4 w-4" />
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredPlayers.map((player, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {player.playerName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {player.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {player.phone}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {player.position}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {player.goals || 0}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {getTeamName(player.teamId)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      <MdModeEditOutline
                        className="cursor-pointer hover:text-red-500"
                        onClick={() => {
                          router.push(
                            `/admin/tournament/${tournamentId}/players/${player.playerId}`,
                          ); // Điều hướng đến trang chỉnh sửa với teamId
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
          <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal"
            >
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
      )}
    </div>
  );
};

export default PlayerTable;
