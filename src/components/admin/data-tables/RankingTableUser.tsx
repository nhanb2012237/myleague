import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
} from '@material-tailwind/react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { HiMiniArrowDownTray } from 'react-icons/hi2';
import Spinner from 'components/Loader/Spinner';

const TABLE_HEAD = [
  'Xếp hạng',
  'Tên đội',
  'Trận đấu',
  'Thắng/Hòa/Bại',
  'Thẻ phạt',
  'Bàn thắng',
  'Bàn thua',
  'Hiệu số',
  'Điểm số',
];

interface DevelopmentTableProps {
  tournamentId: string | string[];
  userId: string;
  tableData: any;
  // setLoading: (loading: boolean) => void;
}

const DevelopmentTable: React.FC<DevelopmentTableProps> = ({
  userId,
  tournamentId,
  // setLoading,
  tableData,
}) => {
  const [teams, setTeams] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [penalties, setPenalties] = useState({});
  const [loading, setLoading] = useState(true);

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

    const fetchPenalties = async () => {
      try {
        const response = await axios.get('/api/penalties/getPenalties', {
          params: {
            userId,
            tournamentId,
          },
        });
        const penaltiesData = response.data;

        // Tính tổng số thẻ phạt cho mỗi đội
        const penaltiesByTeam = penaltiesData.reduce((acc, penalty) => {
          const teamId = penalty.teamId;
          if (!acc[teamId]) {
            acc[teamId] = { yellowCards: 0, redCards: 0 };
          }
          if (penalty.type === 'yellow') {
            acc[teamId].yellowCards += 1;
          } else if (penalty.type === 'red') {
            acc[teamId].redCards += 1;
          }
          return acc;
        }, {});

        setPenalties(penaltiesByTeam);
      } catch (error) {
        console.error('Failed to fetch penalties:', error);
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
      Promise.all([fetchTeams(), fetchPenalties(), fetchRankings()]).then(
        () => {
          setLoading(false); // Đánh dấu dữ liệu đã được tải xong
        },
      );
    }
  }, [userId, tournamentId, setLoading]);

  useEffect(() => {
    if (teams.length > 0 && rankings.length > 0) {
      // Kết hợp dữ liệu đội và xếp hạng
      const combinedData = rankings.map((ranking) => {
        const team = teams.find((team) => team.id === ranking.teamId);
        const teamPenalties = penalties[ranking.teamId] || {
          yellowCards: 0,
          redCards: 0,
        };
        return {
          ...ranking,
          ...team,
          yellowCards: teamPenalties.yellowCards,
          redCards: teamPenalties.redCards,
        };
      });

      // Sắp xếp dữ liệu kết hợp
      combinedData.sort((a, b) => {
        if ((b.points || 0) !== (a.points || 0)) {
          return (b.points || 0) - (a.points || 0);
        } else if ((b.goalDifference || 0) !== (a.goalDifference || 0)) {
          return (b.goalDifference || 0) - (a.goalDifference || 0);
        } else if ((b.goalsFor || 0) !== (a.goalsFor || 0)) {
          return (b.goalsFor || 0) - (a.goalsFor || 0);
        } else {
          const bTotalCards = (b.redCards || 0) * 2 + (b.yellowCards || 0);
          const aTotalCards = (a.redCards || 0) * 2 + (a.yellowCards || 0);
          return aTotalCards - bTotalCards; // Đội nào nhiều thẻ phạt hơn sẽ xếp dưới
        }
      });

      // Cập nhật state với dữ liệu đã sắp xếp
      // setTableData(combinedData);
    }
  }, [teams, rankings, penalties]);

  if (loading) {
    return <Spinner />; // You can replace this with a spinner or any loading indicator
  }

  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Typography variant="h5" color="blue-gray">
              Team Rankings
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              These are the rankings of the teams in the tournament
            </Typography>
          </div>
          <div className="flex w-full shrink-0 gap-2 md:w-max">
            <div className="w-full md:w-72">
              <Input
                label="Search"
                icon={<FaMagnifyingGlass className="h-5 w-5" />}
              />
            </div>
            <Button className="flex items-center gap-3" size="sm">
              <HiMiniArrowDownTray strokeWidth={2} className="h-4 w-4" /> Export
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
                  key={head}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-900"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {tableData.map((team, index) => (
              <tr key={index}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {team.teamName}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-gray-900">
                  {team.matchesPlayed || 0}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-gray-900">
                  {`${team.wins || 0}/${team.draws || 0}/${team.losses || 0}`}
                </td>
                <td className=" whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-gray-900">
                  {`${team.yellowCards || 0}/${team.redCards || 0}`}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-gray-900">
                  {team.goalsFor || 0}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-gray-900">
                  {team.goalsAgainst || 0}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-gray-900">
                  {team.goalDifference || 0}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-gray-900">
                  {team.points || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
};

export default DevelopmentTable;
