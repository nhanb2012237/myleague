'use client';
// import tableDataDevelopment from 'variables/data-tables/tableDataDevelopment';
import tableDataCheck from 'variables/data-tables/tableDataCheck';
import CheckTable from 'components/admin/data-tables/CheckTable';
import tableDataColumns from 'variables/data-tables/tableDataColumns';
import tableDataComplex from 'variables/data-tables/tableDataComplex';
import DevelopmentTable from 'components/admin/data-tables/DevelopmentTable';
import ColumnsTable from 'components/admin/data-tables/ColumnsTable';
import ComplexTable from 'components/admin/data-tables/ComplexTable';
import { useParams, useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import Spinner from 'components/Loader/Spinner';
import axios from 'axios';

const Tables = () => {
  const { tournamentId, teamId } = useParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const [teams, setTeams] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [penalties, setPenalties] = useState({});

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);

        // console.log('User logged in1:', user.uid);
      } else {
        // Handle user not logged in
        // router.push('/auth/sign-in');
        console.log('User not logged in');
      }
      return () => unsubscribe();
    });
  }, []);
  // console.log('userId', userId);
  // console.log('tournamentId', tournamentId);

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
      fetchTeams();
      fetchPenalties();
      fetchRankings();
      setLoading(false);
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
      setTableData(combinedData);
    }
  }, [teams, rankings, penalties]);

  if (loading || !userId || !tournamentId) {
    return <Spinner />; // You can replace this with a spinner or any loading indicator
  }

  return (
    <div>
      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-1">
        <DevelopmentTable
          // tableData={tableData}
          tournamentId={tournamentId}
          userId={userId}
          // setLoading={setLoading}
        />
      </div>

      {/* <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-2">
        <ColumnsTable tableData={tableDataColumns} />

        <ComplexTable tableData={tableDataComplex} />
      </div> */}
    </div>
  );
};

export default Tables;
