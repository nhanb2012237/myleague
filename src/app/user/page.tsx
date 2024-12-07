'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from 'components/Loader/Spinner';
import TournamentsList from 'components/user/tournament/TournamentList';
interface Match {
  id: string;
  team1: { name: string };
  team2: { name: string };
  date: string;
}

interface Tournament {
  id: string;
  tournamentName: string;
  logoUrl: string;
  numberOfTeams: number;
  startDate: { seconds: number };
  endDate: { seconds: number };
  matches: Match[];
  userId: string;
}
interface user {
  id: string;
  displayName: string;
  email: string;
  userId: string;
}
interface TournamentUser {
  user: user;
  tournaments: Tournament[];
}
const TournamentsPage = () => {
  // const [tournaments, setTournaments] = useState([]);
  const [tournaments, setTournaments] = useState<TournamentUser[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get('/api/tournament/getTournamentUser');
        console.log('response:', response.data);
        // Filter out users without tournaments
        const filteredData: TournamentUser[] = response.data.filter(
          (item: TournamentUser) =>
            item.tournaments && item.tournaments.length > 0,
        );

        setTournaments(filteredData);
        console.log('tournaments:', tournaments);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className=" items-center justify-between ">
      <TournamentsList tournaments={tournaments} />
    </div>
  );
};

export default TournamentsPage;
