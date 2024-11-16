'use client';
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

import { GiSoccerField } from 'react-icons/gi';
import { GiSoccerBall } from 'react-icons/gi';
import { TbCards } from 'react-icons/tb';
import { RiTeamFill } from 'react-icons/ri';
import { FaUser } from 'react-icons/fa6';
import { Player } from 'models/entities';
import Spinner from 'components/Loader/Spinner';
import UpdateTournamentForm from 'components/admin/tournament/UpdateTournamentForm';
import ImageCropProvider from 'providers/ImageCropProvider';

const Page = () => {
  const { tournamentId } = useParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
  if (loading) return <Spinner />;

  return (
    <div>
      <ImageCropProvider>
        <UpdateTournamentForm
          tournamentId={tournamentId as string}
          userId={userId as string}
          setLoading={setLoading}
        />
      </ImageCropProvider>
    </div>
  );
};

export default Page;
