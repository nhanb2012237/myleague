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
  const [reload, setReload] = useState<boolean>(false); // Thêm state reload

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        console.log('User logged in1:', user.uid);
        setLoading(false);
      } else {
        console.log('User not logged in');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleMatchSelect = useCallback((match: Match) => {
    setSelectedMatch(match);
  }, []);

  const handleReload = useCallback(() => {
    setReload((prev) => !prev);
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
        {selectedMatch && (
          <Banner
            match={selectedMatch}
            userId={userId as string}
            tournamentId={tournamentId as string}
            setLoading={setLoading}
            onReload={handleReload} // Truyền hàm reload
            reload={reload} // Truyền giá trị reload
          />
        )}
      </div>

      <div className="col-span-1 h-full w-full rounded-xl 2xl:col-span-1">
        {userId && (
          <TopCreatorTable
            userId={userId as string}
            tournamentId={tournamentId as string}
            setLoading={setLoading}
            reload={reload}
          />
        )}
        <div className="mb-5" />
        {userId && (
          <TopPlayers
            onMatchSelect={handleMatchSelect}
            userId={userId as string}
            tournamentId={tournamentId as string}
            setLoading={setLoading}
            reload={reload}
          />
        )}
      </div>
    </div>
  );
};

export default Marketplace;
