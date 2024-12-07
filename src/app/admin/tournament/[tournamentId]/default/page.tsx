'use client';
import useSWR from 'swr';
import { useEffect, useState } from 'react';
import MiniCalendar from 'components/calendar/MiniCalendar';
import WeeklyRevenue from 'components/admin/default/WeeklyRevenue';
import TotalSpent from 'components/admin/default/TotalSpent';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Widget from 'components/widget/Widget';
import TeamStatsTable from 'components/admin/default/TeamStatsTable';
import PlayersTable from 'components/admin/default/PlayersTable';
import { HiMiniArrowDownTray } from 'react-icons/hi2';
import { GiSoccerField } from 'react-icons/gi';
import { GiSoccerBall } from 'react-icons/gi';
import { TbCards } from 'react-icons/tb';
import { RiTeamFill } from 'react-icons/ri';
import { FaUser } from 'react-icons/fa6';
import { Player, Tournament, Team, TeamRanking } from 'models/entities';
import Spinner from 'components/Loader/Spinner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import AmiriRegular from '../../../../../../public/Amiri-Regular.base64';
import { Button } from '@material-tailwind/react';
const Dashboard = () => {
  const [matches, setMatches] = useState([]);
  const { tournamentId, teamId } = useParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(100);
  const [penalties, setPenalties] = useState({});
  const [totalcard, setTotalcard] = useState([]);
  const [goals, setGoals] = useState([]);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [rankings, setRankings] = useState([]);
  const [tournament, setTournament] = useState<Tournament>();
  const [searchQuery, setSearchQuery] = useState('');
  const [tableData, setTableData] = useState([]); // lưu dữ liệu bảng xếp hạng
  const [sortConfig, setSortConfig] = useState({
    key: 'playerName',
    direction: 'asc',
  });
  const fetcher = (url: string) => axios.get(url).then((res) => res.data);

  const TABLE_HEAD = [
    { label: 'STT', key: 'stt' },
    { label: 'Tên cầu thủ', key: 'playerName' },
    { label: 'Email', key: 'email' },
    { label: 'Số điện thoại', key: 'phone' },
    { label: 'Vị trí', key: 'position' },
    { label: 'Bàn thắng', key: 'goals' },
    { label: 'Đội bóng', key: 'teamName' },
  ];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setLoading(false);
      } else {
        console.log('User not logged in');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTournament = async () => {
      console.log('tournamentId', tournamentId);
      console.log('userId', userId);
      if (!tournamentId || !userId) return;
      try {
        const response = await axios.get(`/api/tournament/getTournament`, {
          params: { tournamentId, userId },
        });
        const data = response.data.tournament;
        setTournament(data);
        console.log('tournament', data);
      } catch (error) {
        console.error('Failed to fetch tournament details:', error);
      }
    };

    const fetchTeams = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/teams/getTeam', {
          params: {
            userId,
            tournamentId,
          },
        });
        setTeams(response.data.teams);
      } catch (error) {
        console.error('Không thể lấy danh sách đội:', error);
      } finally {
        setLoading(false);
      }
    };

    // lấy rank của đội
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
      Promise.all([fetchTeams(), fetchRankings(), fetchTournament()]).then(
        () => {
          setLoading(false); // Đánh dấu dữ liệu đã được tải xong
        },
      );
    }
  }, [userId, tournamentId]);

  // lấy danh sách trận đấu
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get(`/api/matches/getMatch`, {
          params: {
            tournamentId,
            userId,
          },
        });
        setMatches(response.data.matches);
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };
    if (userId && tournamentId) fetchMatches();
  }, [userId, tournamentId]);

  // Lấy danh sách cầu thủ
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
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error('Failed to fetch players:', error);
      }
    };
    if (userId && tournamentId) fetchPlayers();
  }, [userId, tournamentId, currentPage]);

  // lấy danh sách bàn thắng
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await axios.get('/api/goals/getGoals', {
          params: {
            userId,
            tournamentId,
          },
        });
        setGoals(response.data);
      } catch (error) {
        console.error('Failed to fetch goals:', error);
      }
    };
    if (userId && tournamentId) fetchGoals();
  }, [userId, tournamentId]);

  // tính số bàn thắng của cầu thủ
  useEffect(() => {
    const fetchPlayersAndGoals = async () => {
      try {
        const playersResponse = await axios.get('/api/players/allPlayers', {
          params: {
            userId,
            tournamentId,
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

  //lấy danh sách thẻ phạt
  useEffect(() => {
    const fetchPenalties = async () => {
      try {
        const response = await axios.get('/api/penalties/getPenalties', {
          params: {
            userId,
            tournamentId,
          },
        });
        const penaltiesData = response.data;
        setTotalcard(penaltiesData);

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
    if (userId && tournamentId) fetchPenalties();
  }, [userId, tournamentId]);

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
  }, [userId, tournamentId, setLoading]);

  useEffect(() => {
    if (teams.length > 0) {
      // Kết hợp dữ liệu đội và xếp hạng
      const combinedData = teams.map((team) => {
        const ranking = rankings.find((r) => r.teamId === team.id) || {};
        const teamPenalties = penalties[team.id] || {
          yellowCards: 0,
          redCards: 0,
        };
        return {
          ...team,
          ...ranking,
          yellowCards: teamPenalties.yellowCards,
          redCards: teamPenalties.redCards,
          matchesPlayed: ranking.matchesPlayed || 0,
          wins: ranking.wins || 0,
          draws: ranking.draws || 0,
          losses: ranking.losses || 0,
          goalsFor: ranking.goalsFor || 0,
          goalsAgainst: ranking.goalsAgainst || 0,
          goalDifference: ranking.goalDifference || 0,
          points: ranking.points || 0,
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

  const startday =
    tournament instanceof Date
      ? tournament?.endDate.toString().split('T')[0]
      : new Date(tournament?.endDate.seconds * 1000).toString().split('T')[0];

  const getTeamName = (teamId: string) => {
    const team = teams.find((team) => team.id === teamId);
    return team ? team.teamName : 'Không xác định';
  };

  const exportPDF = () => {
    if (!tournament && !filteredPlayers && !tableData) return;
    const doc = new jsPDF();

    doc.setProperties({
      title: 'Báo cáo giải đấu',
    });

    const imageUrl = '/logo4.png';

    doc.addImage(imageUrl, 'JPEG', 10, 5, 40, 12);

    // Add the custom font
    doc.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.setFont('Amiri');
    doc.text('Báo cáo giải đấu', 150, 12);

    let y = 22;
    doc.setFont('Amiri');
    doc.text('## 1. Thông tin Giải đấu', 10, y);
    y += 10;
    doc.text(`- Tên giải đấu: ${tournament?.tournamentName}`, 10, y);
    y += 10;
    doc.text(`- Thời gian:  ${startday} - ${startday}`, 10, y);
    y += 10;

    doc.text(`- Địa điểm: ${tournament?.location}`, 10, y);
    y += 10;
    doc.text(`- Đội vô địch: ${tableData?.[0].teamName}`, 10, y);
    y += 10;
    doc.text(
      `- Vua phá lưới: ${topPlayers?.[0].playerName} (${topPlayers[0].goals} bàn)`,
      10,
      y,
    );
    y += 10;

    doc.text('## 2. Bảng xếp hạng', 10, y);
    y += 10;
    doc.autoTable({
      startY: y,
      head: [
        [
          '#',
          'Đội bóng',
          'Trận',
          'Thắng',
          'Hòa',
          'Bại',
          'Thẻ phạt',
          '',
          'Điểm',
        ],
      ],
      body: tableData.map((team, index) => [
        index + 1,
        team.teamName,
        team.matchesPlayed,
        team.wins,
        team.draws,
        team.losses,
        `${team.yellowCards}/${team.redCards}`,
        team.points,
      ]),
      styles: { font: 'Amiri' }, // Ensure the custom font is used for the table
    });

    // Update y to the end of the first table
    const lastAutoTable = (doc as any).lastAutoTable;
    y = lastAutoTable.finalY + 10;

    doc.text('## 3. Bảng danh sách cầu thủ', 10, y);
    y += 10;
    doc.autoTable({
      startY: y,
      head: [TABLE_HEAD.map((head) => head.label)],
      body: players.map((player, index) => [
        index + 1,
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

  // Tính toán các giá trị cần thiết cho Widget
  const totalMatches = matches.length;
  const totalGoals = matches.reduce((sum, match) => {
    const team1Goals = match.opponent1.playerScores.reduce(
      (sum, player) => sum + player.goals,
      0,
    );
    const team2Goals = match.opponent2.playerScores.reduce(
      (sum, player) => sum + player.goals,
      0,
    );
    return sum + team1Goals + team2Goals;
  }, 0);
  const totalCards = matches.reduce((sum, match) => {
    const team1Cards = match.opponent1.playerScores.reduce(
      (sum, player) => sum + (player.cards || 0),
      0,
    );
    const team2Cards = match.opponent2.playerScores.reduce(
      (sum, player) => sum + (player.cards || 0),
      0,
    );
    return sum + team1Cards + team2Cards;
  }, 0);

  // lấy số bàn thắng của cầu thủ
  const topScoringTeam = teams.reduce(
    (max, team) => {
      const teamGoals = matches.reduce((sum, match) => {
        const team1Goals =
          match.opponent1.teamId === team.id
            ? match.opponent1.playerScores.reduce(
                (sum, player) => sum + player.goals,
                0,
              )
            : 0;
        const team2Goals =
          match.opponent2.teamId === team.id
            ? match.opponent2.playerScores.reduce(
                (sum, player) => sum + player.goals,
                0,
              )
            : 0;
        return sum + team1Goals + team2Goals;
      }, 0);
      return teamGoals > max.goals
        ? { teamName: team.teamName, goals: teamGoals }
        : max;
    },
    { teamName: 'Không xác định', goals: 0 },
  );
  // lấy số thẻ phạt của đội
  const mostCardedTeam = Object.keys(penalties).reduce(
    (max, teamId) => {
      const teamPenalties = penalties[teamId];
      const totalCards = teamPenalties.yellowCards + teamPenalties.redCards * 2;
      return totalCards > max.cards
        ? {
            teamName:
              teams.find((team) => team.teamId === teamId)?.teamName ||
              'Không xác định',
            cards: totalCards,
          }
        : max;
    },
    { teamName: 'Không xác định', cards: 0 },
  );

  const topScoringPlayer = players.reduce(
    (max, player) => (player.goals > max.goals ? player : max),
    { playerName: 'Không xác định', goals: 0 },
  );
  // tính số bàn thắng của cầu thủ
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
        .slice(0, 1);
      setTopPlayers(sortedPlayers);
    }
  }, [players, goals]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="flex w-full items-end justify-end">
        <Button
          className="mt-3 flex h-full  gap-3"
          size="sm"
          onClick={exportPDF}
        >
          <HiMiniArrowDownTray strokeWidth={2} className="mb-2 mt-2 h-4 w-4" />{' '}
          <div className="mt-2">Xuất báo cáo</div>
        </Button>
      </div>

      {/* Card widget */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        <Widget
          icon={<GiSoccerField className="h-7 w-7" />}
          title={'Tổng số trận'}
          subtitle={totalMatches.toString()}
        />
        <Widget
          icon={<GiSoccerBall className="h-6 w-6" />}
          title={'Tổng số bàn thắng'}
          subtitle={totalGoals.toString()}
        />
        <Widget
          icon={<TbCards className="h-7 w-7" />}
          title={'Tổng số thẻ phạt'}
          subtitle={totalcard.length.toString()}
        />
        <Widget
          icon={<RiTeamFill className="h-6 w-6" />}
          title={'Đội bóng ghi bàn nhiều nhất'}
          subtitle={topScoringTeam.teamName}
        />
        <Widget
          icon={<TbCards className="h-7 w-7" />}
          title={'Đội bóng nhận nhiều thẻ nhất'}
          subtitle={mostCardedTeam.teamName}
        />
        <Widget
          icon={<FaUser className="h-6 w-6" />}
          title={'Cầu thủ ghi bàn nhiều nhất'}
          subtitle={`${topPlayers.map(
            (name) => name.playerName,
          )} (${topPlayers.map((name) => name.goals)} bàn)`}
        />
      </div>

      {/* Charts */}

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <TotalSpent
          userId={userId}
          tournamentId={tournamentId}
          setLoading={setLoading}
        />
        {teams.length > 0 && (
          <WeeklyRevenue
            setLoading={setLoading}
            teams={teams}
            goals={goals}
            totalcard={totalcard}
          />
        )}
      </div>

      {/* Tables & Charts */}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* team */}
        <div className="grid grid-cols-1 gap-5 rounded-[20px] xl:grid-cols-1">
          <TeamStatsTable
            players={players}
            teams={teams}
            goals={goals}
            totalcard={totalcard}
            setLoading={setLoading}
          />
        </div>
        {/* Traffic chart & Pie Chart */}

        <div className="grid grid-cols-1 gap-5 rounded-[20px] xl:grid-cols-1">
          <PlayersTable
            userId={userId}
            tournamentId={tournamentId}
            setLoading={setLoading}
          />
        </div>

        {/* Task chart & Calendar */}

        {/* <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <TaskCard />
          <div className="grid grid-cols-1 rounded-[20px]">
            <MiniCalendar />
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
