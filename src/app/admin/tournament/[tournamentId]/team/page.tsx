// 'use client';
// import useSWR from 'swr';
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Grid } from '@mui/material';
// import TeamCard from 'components/card/teamCard'; // Đảm bảo đường dẫn đúng
// import { useRouter } from 'next/navigation';
// import { Team } from 'models/entities'; // Đảm bảo đường dẫn đúng
// import { auth } from '../../../../../../config/firebaseconfig'; // Đảm bảo đường dẫn đúng
// import Spinner from '../../../../../components/Loader/Spinner';

// export default function TeamsPage() {
//   const [teams, setTeams] = useState<Team[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [tournamentId, setTournamentId] = useState<string | null>(null);
//   const [readyToFetch, setReadyToFetch] = useState<boolean>(false);
//   // Trạng thái để biết khi nào sẵn sàng gọi API
//   const router = useRouter();
// const MILLISECOND_PER_HOUR = 60 * 60 * 1000

//   const fetcher = (url: string, params: any) =>
//     axios.get(url, { params }).then((res) => res.data);

//   // const { data, error } = useSWR(
//   //   readyToFetch ? ['/api/teams/getTeam', { userId, tournamentId }] : null,
//   //   fetcher
//   // );

//   // Lấy tournamentId từ URL
//   useEffect(() => {
//     const currentPath = window.location.pathname;
//     const pathParts = currentPath.split('/');
//     const extractedTournamentId = pathParts[3];

//     if (extractedTournamentId) {
//       setTournamentId(extractedTournamentId);
//       // console.log('Tournament ID:', extractedTournamentId);
//     } else {
//       console.error('No tournamentId found in the URL');
//     }
//   }, []);

//   // Lấy userId từ Firebase Authentication
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         setUserId(user.uid);
//         console.log('userId:', user.uid);
//       } else {
//         // router.push('/auth/login');
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   // Theo dõi cả userId và tournamentId để xác định khi nào sẵn sàng gọi API
//   useEffect(() => {
//     if (userId && tournamentId) {
//       setReadyToFetch(true);
//     }
//   }, [userId, tournamentId]);

//   // Gọi API chỉ khi cả userId và tournamentId đều sẵn sàng
//   // useEffect(() => {
//   //   async function fetchTeams() {
//   //     if (readyToFetch) {
//   //       setLoading(true); // Đảm bảo chỉ loading khi thực sự gọi API
//   //       try {
//   //         const response = await axios.get('/api/teams/getTeam', {
//   //           params: {
//   //             userId,
//   //             tournamentId,
//   //           },
//   //         });
//   //         setTeams(response.data.teams);
//   //         // console.log('Teamstrave:', response.data.teams);
//   //       } catch (error) {
//   //         console.error('Không thể lấy danh sách đội:', error);
//   //       } finally {
//   //         setLoading(false);
//   //       }
//   //     }
//   //   }

//   //   if (readyToFetch) {
//   //     fetchTeams();
//   //   }
//   // }, [readyToFetch, userId, tournamentId]);

//   const { data, error, mutate, isValidating } = useSWR(`/students/${studentId}`, {
// 		revalidateOnFocus: false,
// 		dedupingInterval: MILLISECOND_PER_HOUR,
// 	})

//   if (loading) return <Spinner />;

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
//               tournamentId={tournamentId}
//               userId={userId}
//             />
//           </Grid>
//         ))}
//       </Grid>
//     </div>
//   );
// }
'use client';

import useSWR from 'swr';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid } from '@mui/material';
import TeamCard from 'components/card/teamCard'; // Đảm bảo đường dẫn đúng
import { useRouter } from 'next/navigation';
import { Team } from 'models/entities'; // Đảm bảo đường dẫn đúng
import { auth } from '../../../../../../config/firebaseconfig'; // Đảm bảo đường dẫn đúng
import Spinner from '../../../../../components/Loader/Spinner';

export default function TeamsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const router = useRouter();
  const MILLISECOND_PER_HOUR = 60 * 60 * 1000;

  // Fetcher function for SWR
  const fetcher = (url: string, params: any) =>
    axios.get(url, { params }).then((res) => res.data);

  // Extract tournamentId from the URL
  useEffect(() => {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const extractedTournamentId = pathParts[3];

    if (extractedTournamentId) {
      setTournamentId(extractedTournamentId);
    } else {
      console.error('No tournamentId found in the URL');
    }
  }, []);

  // Get userId from Firebase Authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        router.push('/auth/login'); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Use SWR to fetch teams data
  const { data, error, isValidating } = useSWR(
    userId && tournamentId
      ? ['/api/teams/getTeam', { userId, tournamentId }]
      : null, // Only fetch when userId and tournamentId are ready
    ([url, params]) => fetcher(url, params),
    {
      revalidateOnFocus: false, // Prevent refetching when the page gains focus
      dedupingInterval: MILLISECOND_PER_HOUR, // Deduplicate API calls within the specified interval
    },
  );

  if (!data && !error) {
    return <Spinner />; // Show a loading spinner if data is not yet loaded
  }

  if (error) {
    return <div>Không thể tải danh sách đội: {error.message}</div>;
  }

  const teams = data?.teams || [];

  return (
    <div>
      <Grid container spacing={3} style={{ marginTop: '20px' }}>
        {teams.map((team: Team) => (
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
