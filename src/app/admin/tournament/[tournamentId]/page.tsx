// 'use client';
// import Banner from 'components/admin/nft-marketplace/Banner';
// import tableDataTopCreators from 'variables/nfts/marketplace/tableDataTopCreators';
// import TopPlayers from 'components/admin/nft-marketplace/TopPlayers';
// import TopCreatorTable from 'components/admin/nft-marketplace/TableTopCreators';
// import NftCard from 'components/card/NftCard';
// import { useEffect, useState, useCallback } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import { useParams, useRouter } from 'next/navigation';
// import Spinner from 'components/Loader/Spinner';
// import axios from 'axios';
// import { Match } from 'models/entities';
// import { Team, Player } from 'models/entities';

// const Marketplace = () => {
//   const router = useRouter();
//   const { tournamentId } = useParams();
//   const [userId, setUserId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
//   const [team1, setTeam1] = useState<Team | null>(null);
//   const [team2, setTeam2] = useState<Team | null>(null);
//   const [playersTeam1, setPlayersTeam1] = useState<Player[]>([]);
//   const [playersTeam2, setPlayersTeam2] = useState<Player[]>([]);

//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUserId(user.uid);
//         setLoading(false);
//         console.log('User logged in1:', user.uid);
//       } else {
//         // Handle user not logged in
//         // router.push('/auth/sign-in');
//         console.log('User not logged in');
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleMatchSelect = async (match: Match) => {
//     setSelectedMatch(match);
//   };

//   if (loading || !userId) {
//     return <Spinner />;
//   }

//   // Hàm lấy danh sách cầu thủ từ API theo teamId
//   // const fetchPlayers = useCallback(
//   //   async (
//   //     teamId: string,
//   //     setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
//   //   ) => {
//   //     try {
//   //       const response = await axios.get(`/api/players/${teamId}`, {
//   //         params: { userId, tournamentId },
//   //       });
//   //       setPlayers(response.data.players);
//   //     } catch (error) {
//   //       console.error('Lỗi khi lấy danh sách cầu thủ:', error);
//   //     }
//   //   },
//   //   [tournamentId],
//   // );

//   // // Hàm xử lý khi chọn trận đấu từ danh sách

//   // // Kiểm tra trạng thái đăng nhập của người dùng
//   // useEffect(() => {
//   //   const auth = getAuth();
//   //   const unsubscribe = onAuthStateChanged(auth, (user) => {
//   //     if (user) {
//   //       setUserId(user.uid);
//   //       setLoading(false);
//   //     } else {
//   //       router.push('/auth/sign-in');
//   //     }
//   //   });
//   //   return () => unsubscribe();
//   // }, [router]);

//   // Sử dụng useCallback để tránh hàm fetchPlayers bị tạo mới mỗi lần component render lại

//   // const reloadPage = () => {
//   //   window.location.reload();
//   // };

//   return (
//     <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
//       <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
//         {/* NFt Banner */}
//         {selectedMatch && (
//           <Banner
//             match={selectedMatch}
//             team1={team1}
//             team2={team2}
//             // playersTeam1={playersTeam1}
//             // playersTeam2={playersTeam2}
//             userId={userId}
//             tournamentId={tournamentId as string}
//             // onReload={reloadPage}
//             setLoading={setLoading}
//           />
//         )}
//       </div>

//       {/* right side section */}

//       <div className="col-span-1 h-full w-full rounded-xl 2xl:col-span-1">
//         <TopCreatorTable
//           userId={userId}
//           tournamentId={tournamentId as string}
//           setLoading={setLoading}
//         />
//         <div className="mb-5" />
//         <TopPlayers
//           onMatchSelect={handleMatchSelect}
//           userId={userId}
//           tournamentId={tournamentId as string}
//           setLoading={setLoading}
//         />
//       </div>
//     </div>
//   );
// };

// export default Marketplace;

'use client';
import Banner from 'components/admin/nft-marketplace/Banner';
import tableDataTopCreators from 'variables/nfts/marketplace/tableDataTopCreators';
import TopPlayers from 'components/admin/nft-marketplace/TopPlayers';
import TopCreatorTable from 'components/admin/nft-marketplace/TableTopCreators';
import NftCard from 'components/card/NftCard';
import { useEffect, useState, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useParams, useRouter } from 'next/navigation';
import Spinner from 'components/Loader/Spinner';
import axios from 'axios';
import { Match } from 'models/entities';
import { Team, Player } from 'models/entities';

const Marketplace = () => {
  const router = useRouter();
  const { tournamentId } = useParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        console.log('User logged in1:', user.uid);
      } else {
        console.log('User not logged in');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleMatchSelect = useCallback((match: Match) => {
    setSelectedMatch(match);
  }, []);

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
        {selectedMatch && (
          <Banner
            match={selectedMatch}
            userId={userId as string}
            tournamentId={tournamentId as string}
            setLoading={setLoading}
          />
        )}
      </div>

      <div className="col-span-1 h-full w-full rounded-xl 2xl:col-span-1">
        {userId && (
          <TopCreatorTable
            userId={userId as string}
            tournamentId={tournamentId as string}
            setLoading={setLoading}
          />
        )}
        <div className="mb-5" />
        {userId && (
          <TopPlayers
            onMatchSelect={handleMatchSelect}
            userId={userId as string}
            tournamentId={tournamentId as string}
            setLoading={setLoading}
          />
        )}
      </div>
    </div>
  );
};

export default Marketplace;
