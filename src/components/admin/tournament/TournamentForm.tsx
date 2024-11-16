// src/components/admin/tournament/TournamentForm.tsx
import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

interface TournamentFormProps {
  onTournamentCreated: (id: string) => void;
}

const TournamentForm = ({ onTournamentCreated }: TournamentFormProps) => {
  const [tournamentName, setTournamentName] = useState('');
  const [numberOfTeams, setNumberOfTeams] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [tournamentCreated, setTournamentCreated] = useState<boolean>(false);

  const handleCreateTournament = async () => {
    try {
      const response = await fetch('/api/tournament/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tournamentName, numberOfTeams }),
      });
      const data = await response.json();
      if (response.ok) {
        // console.log('Tournament created:', data);
        onTournamentCreated(data.id);
        await handleCreateTeams(data.id);
      } else {
        console.error('Failed to create tournament:', data.error);
      }
    } catch (error) {
      console.error('Failed to create tournament:', error);
    }
  };

  const handleCreateTeams = async (tournamentId: string) => {
    try {
      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numberOfTeams, tournamentId }),
      });
      const data = await response.json();
      if (response.ok) {
        // console.log('Teams created:', data.teams);
        await handleCreateMatches(data.teams);
      } else {
        console.error('Failed to create teams:', data.error);
      }
    } catch (error) {
      console.error('Failed to create teams:', error);
    }
  };

  const handleCreateMatches = async (teams: any[]) => {
    try {
      const response = await fetch('/api/matches/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teams }),
      });
      const data = await response.json();
      if (response.ok) {
        // console.log('Matches created:', data.matches);
        setMatches(data.matches);
        setTournamentCreated(true);
      } else {
        console.error('Failed to create matches:', data.error);
      }
    } catch (error) {
      console.error('Failed to create matches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreateTournament();
  };

  return (
    <div>
      {!tournamentCreated ? (
        <Box component="form" onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Tournament Name"
            variant="outlined"
            fullWidth
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
          />
          <TextField
            label="Number of Teams"
            variant="outlined"
            type="number"
            fullWidth
            value={numberOfTeams}
            onChange={(e) => setNumberOfTeams(Number(e.target.value))}
          />
          <Button type="submit" variant="contained" color="primary">
            Create Tournament
          </Button>
        </Box>
      ) : (
        <MatchesList matches={matches} />
      )}
    </div>
  );
};

const MatchesList = ({ matches }: { matches: any[] }) => (
  <div>
    <h2>Matches</h2>
    <ul>
      {matches.map((match, index) => (
        <li key={index}>
          {match.opponent1.name} vs {match.opponent2.name}
        </li>
      ))}
    </ul>
  </div>
);

export default TournamentForm;
