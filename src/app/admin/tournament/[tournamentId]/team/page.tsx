// 'use client';
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Grid } from '@mui/material';
// import TeamCard from 'components/card/teamCard'; // Đảm bảo đường dẫn đúng
// import { useRouter, usePathname } from 'next/navigation';
// import { Team } from 'models/entities'; // Đảm bảo đường dẫn đúng
// import { auth } from '../../../../../../config/firebaseconfig'; // Đảm bảo đường dẫn đúng

// export default function TeamsPage() {
//   const [teams, setTeams] = useState<Team[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [userId, setUserId] = useState<string | null>(null);
//   const router = useRouter();

//   // L  const router = useRouter();
//   const pathname = usePathname(); // Get the current pathname

//   const [tournamentId, setTournamentId] = useState<string | null>(null);

//   useEffect(() => {
//     // Lấy tournamentId từ URL bằng window.location.pathname
//     const currentPath = window.location.pathname; // Lấy đường dẫn hiện tại
//     const pathParts = currentPath.split('/'); // Tách các phần của đường dẫn
//     const extractedTournamentId = pathParts[3]; // tournamentId là phần thứ 4

//     if (extractedTournamentId) {
//       setTournamentId(extractedTournamentId); // Lưu tournamentId vào state
//       console.log('Tournament ID:', extractedTournamentId);
//     } else {
//       console.error('No tournamentId found in the URL');
//     }
//   }, []);

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         setUserId(user.uid);
//         console.log('userId', user.uid);
//       } else {
//         // Nếu không có người dùng đăng nhập, điều hướng đến trang đăng nhập hoặc xử lý lỗi
//         router.push('/login');
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   useEffect(() => {
//     async function fetchTeams() {
//       if (userId && tournamentId) {
//         try {
//           const response = await axios.get('/api/teams', {
//             params: {
//               userId,
//               tournamentId,
//             },
//           });
//           setTeams(response.data.teams);
//         } catch (error) {
//           console.error('Không thể lấy danh sách đội:', error);
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         console.error('Thiếu userId hoặc tournamentId');
//         setLoading(false);
//       }
//     }

//     fetchTeams();
//   }, [userId, tournamentId]);

//   if (loading) return <p>Đang tải dữ liệu...</p>;

//   return (
//     <div>
//       <Grid container spacing={3} style={{ marginTop: '20px' }}>
//         {teams.map((team) => (
//           <Grid item xs={12} sm={6} md={4} lg={3} key={team.teamId}>
//             <TeamCard
//               image={team.teamLogo}
//               title={team.teamName}
//               coach={team.coach}
//               teamId={team.teamId}
//             />
//           </Grid>
//         ))}
//       </Grid>
//     </div>
//   );
// }
'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid } from '@mui/material';
import TeamCard from 'components/card/teamCard'; // Đảm bảo đường dẫn đúng
import { useRouter } from 'next/navigation';
import { Team } from 'models/entities'; // Đảm bảo đường dẫn đúng
import { auth } from '../../../../../../config/firebaseconfig'; // Đảm bảo đường dẫn đúng
import Spinner from '../../../../../components/Loader/Spinner';
export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [readyToFetch, setReadyToFetch] = useState<boolean>(false);
  // Trạng thái để biết khi nào sẵn sàng gọi API
  const router = useRouter();

  // Lấy tournamentId từ URL
  useEffect(() => {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const extractedTournamentId = pathParts[3];

    if (extractedTournamentId) {
      setTournamentId(extractedTournamentId);
      // console.log('Tournament ID:', extractedTournamentId);
    } else {
      console.error('No tournamentId found in the URL');
    }
  }, []);

  // Lấy userId từ Firebase Authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        console.log('userId:', user.uid);
      } else {
        // router.push('/auth/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Theo dõi cả userId và tournamentId để xác định khi nào sẵn sàng gọi API
  useEffect(() => {
    if (userId && tournamentId) {
      setReadyToFetch(true);
    }
  }, [userId, tournamentId]);

  // Gọi API chỉ khi cả userId và tournamentId đều sẵn sàng
  useEffect(() => {
    async function fetchTeams() {
      if (readyToFetch) {
        setLoading(true); // Đảm bảo chỉ loading khi thực sự gọi API
        try {
          const response = await axios.get('/api/teams/getTeam', {
            params: {
              userId,
              tournamentId,
            },
          });
          setTeams(response.data.teams);
          // console.log('Teamstrave:', response.data.teams);
        } catch (error) {
          console.error('Không thể lấy danh sách đội:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    if (readyToFetch) {
      fetchTeams();
    }
  }, [readyToFetch, userId, tournamentId]);

  if (loading) return <Spinner />;

  return (
    <div>
      <Grid container spacing={3} style={{ marginTop: '20px' }}>
        {teams.map((team) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={team.teamId}>
            <TeamCard
              image={team.teamLogo}
              title={team.teamName}
              coach={team.coach}
              teamId={team.teamId}
              tournamentId={tournamentId}
              userId={userId}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
