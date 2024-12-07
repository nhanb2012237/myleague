'use client';
import tableDataTopCreators from 'variables/nfts/marketplace/tableDataTopCreators';
import MatchUser from 'components/admin/nft-marketplace/MatchUser';
import TopCreatorTable from 'components/admin/nft-marketplace/TableTopCreators';
import NftCard from 'components/card/NftCard';
import { useEffect, useState, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useParams, useRouter } from 'next/navigation';
import Spinner from 'components/Loader/Spinner';
import axios from 'axios';
import { Match } from 'models/entities';
import { Team, Player } from 'models/entities';
import Default from 'components/auth/variants/UserPlayerLayout/index';
import RankingTableUser from 'components/user/tournament/RankingTableUser';
import Banner from 'components/user/tournament/Banner';
import Button from 'components/Button/Button';
import Link from 'next/link';
import ArrowIcon from 'components/icons/ArrowIcon';

const TournamentPage = () => {
  const router = useRouter();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const { tournamentId, userId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [teams, setTeams] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [penalties, setPenalties] = useState({});
  const [reload, setReload] = useState<boolean>(false); // Thêm state reload

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

  const handleMatchSelect = useCallback((match: Match) => {
    setSelectedMatch(match);
  }, []);

  return (
    <Default
      maincard={
        <div className="mt-10 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
            <div className="mb-5">
              <Button>
                <Link href={'/auth/sign-in'}>
                  <div className="flex items-center gap-6 md:mb-2">
                    <div className="rotate-90">
                      <ArrowIcon />
                    </div>
                    <p className="text-heading-s-variant hover:text-blue-gray dark:hover:text-gray-medium h-3 transition duration-200 ease-in-out">
                      Go back
                    </p>
                  </div>
                </Link>
              </Button>
            </div>
            <Banner
              match={selectedMatch}
              userId={userId as string}
              tournamentId={tournamentId as string}
              setLoading={setLoading}
            />
            <div className="mt-5">
              <RankingTableUser
                tableData={tableData}
                tournamentId={tournamentId}
                userId={userId as string}
              />
            </div>
          </div>

          <div className="col-span-1 mt-10 h-full w-full rounded-xl 2xl:col-span-1">
            <TopCreatorTable
              userId={userId as string}
              tournamentId={tournamentId as string}
              setLoading={setLoading}
              reload={reload}
            />
            <div className="mb-5" />
            <MatchUser
              handleMatchSelect={handleMatchSelect}
              userId={userId as string}
              tournamentId={tournamentId as string}
              setLoading={setLoading}
            />
          </div>
        </div>
      }
    />
  );
};

export default TournamentPage;
