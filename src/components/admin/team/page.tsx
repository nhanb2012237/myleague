'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    // Fetch teams from the API
    fetch('/api/teams')
      .then((response) => response.json())
      .then((data) => setTeams(data.teams))
      .catch((error) => console.error('Failed to fetch teams:', error));
  }, []);

  return (
    <div>
      <h1>Teams</h1>
      <ul>
        {teams.map((team) => (
          <li key={team.id} style={{ listStyle: 'none', marginBottom: '20px' }}>
            <div>
              <strong>Name:</strong> {team.name}
            </div>
            <div>
              <strong>Phone:</strong> {team.phone}
            </div>
            <Image
              src={team.logo}
              alt={`${team.name} logo`}
              width={50}
              height={50}
            />
            <button>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamsPage;
