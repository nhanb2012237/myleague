// pages/teams.tsx
// trang này dùng để
'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid } from '@mui/material';
import TeamCard from 'components/card/teamCard'; // Đảm bảo đường dẫn chính xác
import { useRouter } from 'next/navigation';
import { Team } from '../../../../../../models/entities'; // Đảm bảo đường dẫn đúng
import { auth } from '../../../../../../../config/firebaseconfig';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        console.log('userId:', user.uid);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await axios.get('/api/teams');
        setTeams(response.data.teams);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTeams();
  }, []);

  if (loading) return <p>Loading...</p>;

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
              tournamentId={team.tournamentId}
              userId={userId} // Thay thế bằng ID của người dùng
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
