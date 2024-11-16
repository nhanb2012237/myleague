import React, { useState, useEffect } from 'react';
import Card from 'components/card';
import axios from 'axios';
import {
  CardHeader,
  CardBody,
  Typography,
  CardFooter,
  Button,
} from '@material-tailwind/react';
import Spinner from 'components/Loader/Spinner';
import { MdBarChart } from 'react-icons/md';

const TABLE_HEAD = ['Xếp hạng', 'Tên đội', 'Trận đấu', 'Điểm số'];

interface TeamsTableProps {
  tournamentId: string | string[];
  userId: string;
  setLoading: (loading: boolean) => void;
}

const TeamsTable: React.FC<TeamsTableProps> = ({ userId, tournamentId }) => {
  const [teams, setTeams] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  // const handlePreviousPage = () => {
  //   if (currentPage > 1) {
  //     setCurrentPage(currentPage - 1);
  //   }
  // };

  // const handleNextPage = () => {
  //   if (currentPage < totalPages) {
  //     setCurrentPage(currentPage + 1);
  //   }
  // };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('/api/teams/getTeam', {
          params: {
            userId,
            tournamentId,
          },
        });
        setTeams(response.data.teams);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
      }
    };

    const fetchRankings = async () => {
      try {
        const response = await axios.get('/api/teams/getRankings', {
          params: {
            userId,
            tournamentId,
          },
        });
        setRankings(response.data);
      } catch (error) {
        console.error('Failed to fetch rankings:', error);
      }
    };

    if (userId && tournamentId) {
      Promise.all([fetchTeams(), fetchRankings()]).then(() => {
        setLoading(false); // Đánh dấu dữ liệu đã được tải xong
      });
    }
  }, [userId, tournamentId]);

  // Kết hợp dữ liệu đội và xếp hạng
  const combinedData = rankings.map((ranking) => {
    const team = teams.find((team) => team.id === ranking.teamId);
    return {
      ...ranking,
      ...team,
    };
  });

  // Sắp xếp dữ liệu kết hợp
  combinedData.sort((a, b) => (b.points || 0) - (a.points || 0));

  if (loading && !combinedData) {
    return <Spinner />; // You can replace this with a spinner or any loading indicator
  }

  return (
    <Card extra="flex flex-col bg-white w-full rounded-3xl py-6 px-1 text-center">
      <div className=" flex items-center justify-between px-6 ">
        <h2 className="text-lg font-bold text-navy-700 dark:text-white">
          Xếp hạng đội
        </h2>
        <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-brand-500 !transition !duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
          <MdBarChart className="h-6 w-6" />
        </button>
      </div>
      <CardBody className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="">
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-900"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {combinedData.map((team, index) => (
              <tr key={index}>
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-gray-900">
                  {team.teamName}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-gray-900">
                  {team.matchesPlayed || 0}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center  text-sm font-medium text-gray-900">
                  {team.points || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>

      <CardFooter className="mt-auto flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Trang {1} của {1}
        </Typography>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            size="sm"
            // onClick={handlePreviousPage}
            // disabled={currentPage === 1}
          >
            Trước
          </Button>
          <Button
            variant="outlined"
            size="sm"
            // onClick={handleNextPage}
            // disabled={currentPage === totalPages}
          >
            Sau
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TeamsTable;
