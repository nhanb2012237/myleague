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
