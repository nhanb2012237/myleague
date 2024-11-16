// 'use client';
// import Banner from 'components/admin/players/Banner';
// import General from 'components/admin/players/General';
// import Notification from 'components/admin/players/Notification';
// import Project from 'components/admin/players/Project';
// import Storage from 'components/admin/players/Storage';
// import Upload from 'components/admin/players/Upload';

// const ProfileOverview = () => {
//   return (
//     <div className="flex w-full flex-col gap-5 lg:gap-5">
//       <div className="w-ful mt-3 flex h-fit flex-col gap-5 lg:grid lg:grid-cols-12">
//         <div className="col-span-4 lg:!mb-0">
//           <Banner />
//         </div>

//         <div className="col-span-3 lg:!mb-0">
//           <Storage />
//         </div>

//         <div className="z-0 col-span-5 lg:!mb-0">
//           <Upload />
//         </div>
//       </div>
//       {/* all project & ... */}

//       <div className="mb-4 grid h-full grid-cols-1 gap-5 lg:!grid-cols-12">
//         <div className="col-span-5 lg:col-span-6 lg:mb-0 3xl:col-span-4">
//           <Project />
//         </div>
//         <div className="col-span-5 lg:col-span-6 lg:mb-0 3xl:col-span-5">
//           <General />
//         </div>

//         <div className="col-span-5 lg:col-span-12 lg:mb-0 3xl:!col-span-3">
//           <Notification />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfileOverview;
'use client';
// import tableDataDevelopment from 'variables/data-tables/tableDataDevelopment';
import PlayerTable from 'components/admin/data-tables/PlayerTable';
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
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  // Số lượng cầu thủ trên mỗi trang
  const [sortConfig, setSortConfig] = useState({
    key: 'playerName',
    direction: 'asc',
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        console.log('User not logged in');
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-1">
        <PlayerTable
          tournamentId={tournamentId as string}
          userId={userId as string}
        />
      </div>
    </div>
  );
};

export default Tables;
