'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from 'components/Loader/Spinner';
import TournamentsList from 'components/user/tournament/TournamentList';

const TournamentsPage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get('/api/tournament/getTournamentUser');
        console.log('response:', response.data);
        setTournaments(response.data);
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
