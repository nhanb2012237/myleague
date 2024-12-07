import React, { useState, useEffect } from 'react';
import { Player, Match, TeamInfo } from '../../../models/entities';
import axios from 'axios';
import { Select, Option } from '@material-tailwind/react';
import { TextField, Alert } from '@mui/material';
import { serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';

interface YellowCardComponentProps {
  team1: TeamInfo;
  team2: TeamInfo;
  userId: string;
  tournamentId: string;
  matchId: string;
  match: Match;
  onReload?: () => void;
  setYellowCardScorers: React.Dispatch<React.SetStateAction<any>>;
}

const YellowCardComponent: React.FC<YellowCardComponentProps> = ({
  team1,
  team2,
  userId,
  tournamentId,
  matchId,
  match,
  onReload,
  setYellowCardScorers,
}) => {
  const [yellowCardsTeam1, setYellowCardsTeam1] = useState<number>(
    match.penalties.team1.yellowCards,
  );
  const [yellowCardsTeam2, setYellowCardsTeam2] = useState<number>(
    match.penalties.team2.yellowCards,
  );
  const [players1, setPlayers1] = useState<Player[]>([]);
  const [players2, setPlayers2] = useState<Player[]>([]);
  const [yellowCardScorersTeam1, setYellowCardScorersTeam1] = useState<
    Player[]
  >([]);
  const [yellowCardScorersTeam2, setYellowCardScorersTeam2] = useState<
    Player[]
  >([]);
  const [loadingPlayers, setLoadingPlayers] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setLoadingPlayers(true);
    Promise.all([
      fetchPlayers(team1.teamId, userId, tournamentId),
      fetchPlayers(team2.teamId, userId, tournamentId),
      fetchYellowCards(matchId, userId, tournamentId),
    ]).then(([players1Data, players2Data, yellowCardsData]) => {
      setPlayers1(players1Data);
      setPlayers2(players2Data);

      const team1YellowCards = yellowCardsData.filter(
        (card) => card.teamId === team1.teamId,
      );
      console.log('team1YellowCards', team1YellowCards);
      const team2YellowCards = yellowCardsData.filter(
        (card) => card.teamId === team2.teamId,
      );
      console.log('team2YellowCards', team2YellowCards);

      setYellowCardScorersTeam1(
        team1YellowCards.map((card) => {
          const player = players1Data.find((p) => p.playerId === card.playerId);
          return {
            playerId: card.playerId,
            playerName: player ? player.playerName : '',
            displayName: player ? player.displayName : '',
            jerseyNumber: player ? player.jerseyNumber : 0,
            dateOfBirth: player ? player.dateOfBirth : new Date(),
            teamId: card.teamId,
            email: player ? player.email : '',
            phone: player ? player.phone : '',
            avatarUrl: player ? player.avatarUrl : '',
            position: player ? player.position : '',
            timestamp: serverTimestamp(),
          };
        }),
      );

      setYellowCardScorersTeam2(
        team2YellowCards.map((card) => {
          const player = players2Data.find((p) => p.playerId === card.playerId);
          return {
            playerId: card.playerId,
            playerName: player ? player.playerName : '',
            displayName: player ? player.displayName : '',
            jerseyNumber: player ? player.jerseyNumber : 0,
            dateOfBirth: player ? player.dateOfBirth : new Date(),
            teamId: card.teamId,
            email: player ? player.email : '',
            phone: player ? player.phone : '',
            avatarUrl: player ? player.avatarUrl : '',
            position: player ? player.position : '',
            timestamp: serverTimestamp(),
          };
        }),
      );

      setLoadingPlayers(false);
    });
  }, [team1.teamId, team2.teamId, userId, tournamentId, matchId]);

  const fetchPlayers = async (
    teamId: string,
    userId: string,
    tournamentId: string,
  ): Promise<Player[]> => {
    try {
      if (teamId && userId && tournamentId) {
        const response = await axios.get(`/api/players/${teamId}`, {
          params: { userId, tournamentId, timestamp: new Date().getTime() },
        });
        return response.data.players;
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách cầu thủ:', error);
    }
    return [];
  };

  const fetchYellowCards = async (
    matchId: string,
    userId: string,
    tournamentId: string,
  ): Promise<any[]> => {
    try {
      const response = await axios.get(`/api/penalties/getYellowCards`, {
        params: { matchId, userId, tournamentId },
      });
      return response.data.yellowCards;
    } catch (error) {
      console.error('Lỗi khi tải danh sách thẻ vàng:', error);
    }
    return [];
  };

  const handleCardChange = (team: number, count: string) => {
    const newCount = parseInt(count, 10);

    if (isNaN(newCount) || newCount < 0) {
      return;
    }

    if (team === 1) {
      setYellowCardsTeam1(newCount);
      setYellowCardScorersTeam1((prev) => {
        if (newCount > prev.length) {
          return [
            ...prev,
            ...Array(newCount - prev.length).fill({
              playerId: '',
              playerName: '',
              displayName: '',
              jerseyNumber: 0,
              dateOfBirth: new Date(),
              teamId: '',
              email: '',
              phone: 0,
              avatarUrl: '',
              position: '',
              timestamp: serverTimestamp(),
            }),
          ];
        } else {
          return prev.slice(0, newCount);
        }
      });
    } else if (team === 2) {
      setYellowCardsTeam2(newCount);
      setYellowCardScorersTeam2((prev) => {
        if (newCount > prev.length) {
          return [
            ...prev,
            ...Array(newCount - prev.length).fill({
              playerId: '',
              playerName: '',
              displayName: '',
              jerseyNumber: 0,
              dateOfBirth: new Date(),
              teamId: '',
              email: '',
              phone: 0,
              avatarUrl: '',
              position: '',
              timestamp: serverTimestamp(),
            }),
          ];
        } else {
          return prev.slice(0, newCount);
        }
      });
    }
  };

  const handlePlayerSelect = (
    team: number,
    index: number,
    playerId: string,
  ) => {
    const player =
      players1.find((p) => p.playerId === playerId) ||
      players2.find((p) => p.playerId === playerId);

    if (team === 1) {
      const newYellowCardScorersTeam1 = [...yellowCardScorersTeam1];
      newYellowCardScorersTeam1[index] = player!;
      setYellowCardScorersTeam1(newYellowCardScorersTeam1);
    } else if (team === 2) {
      const newYellowCardScorersTeam2 = [...yellowCardScorersTeam2];
      newYellowCardScorersTeam2[index] = player!;
      setYellowCardScorersTeam2(newYellowCardScorersTeam2);
    }
  };

  useEffect(() => {
    setYellowCardScorers([
      ...yellowCardScorersTeam1.map((scorer) => ({
        team: 1,
        player: {
          playerId: scorer.playerId,
          playerName: scorer.playerName,
          displayName: scorer.displayName,
          jerseyNumber: scorer.jerseyNumber,
          dateOfBirth: scorer.dateOfBirth,
          teamId: scorer.teamId,
          email: scorer.email,
          phone: scorer.phone,
          avatarUrl: scorer.avatarUrl,
          position: scorer.position,
          timestamp: serverTimestamp(),
        },
      })),
      ...yellowCardScorersTeam2.map((scorer) => ({
        team: 2,
        player: {
          playerId: scorer.playerId,
          playerName: scorer.playerName,
          displayName: scorer.displayName,
          jerseyNumber: scorer.jerseyNumber,
          dateOfBirth: scorer.dateOfBirth,
          teamId: scorer.teamId,
          email: scorer.email,
          phone: scorer.phone,
          avatarUrl: scorer.avatarUrl,
          position: scorer.position,
          timestamp: serverTimestamp(),
        },
      })),
    ]);
  }, [yellowCardScorersTeam1, yellowCardScorersTeam2, setYellowCardScorers]);

  useEffect(() => {
    const allSelected =
      yellowCardScorersTeam1.every((scorer) => scorer.playerId) &&
      yellowCardScorersTeam2.every((scorer) => scorer.playerId);
    if (!allSelected) {
      setError('Vui lòng chọn cầu thủ cho tất cả các thẻ vàng.');
    } else {
      setError('');
    }
  }, [yellowCardScorersTeam1, yellowCardScorersTeam2]);

  return (
    <div>
      {error && <Alert severity="error">{error}</Alert>}
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 text-4xl font-semibold text-black">
          <TextField
            className="!w-20 appearance-none rounded-lg !border-t-blue-gray-200 bg-white text-center !text-lg placeholder:text-blue-gray-300 placeholder:opacity-100 focus:!border-t-gray-900"
            InputLabelProps={{
              className: 'before:content-none after:content-none',
            }}
            InputProps={{
              className: '!min-w-0 !w-15 !shrink-0',
            }}
            value={yellowCardsTeam1}
            onChange={(e) => handleCardChange(1, e.target.value)}
            type="number"
            variant="outlined"
            margin="normal"
          />
          <span className="text-slate-700 text-2xl">-</span>
          <TextField
            className="!w-20 appearance-none rounded-lg !border-t-blue-gray-200 bg-white text-center !text-lg placeholder:text-blue-gray-300 placeholder:opacity-100 focus:!border-t-gray-900"
            InputLabelProps={{
              className: 'before:content-none after:content.none',
            }}
            InputProps={{
              className: '!min-w-0 !w-15 !shrink-0',
            }}
            value={yellowCardsTeam2}
            onChange={(e) => handleCardChange(2, e.target.value)}
            type="number"
            variant="outlined"
            margin="normal"
          />
        </div>
        <div className="mt-4 flex w-full flex-1 items-start justify-between gap-5">
          <div className="flex-1 items-start justify-start">
            {!loadingPlayers &&
              yellowCardScorersTeam1.map((scorer, index) => (
                <div key={index} className="mt-2">
                  <Select
                    size="lg"
                    label="Select Player"
                    value={scorer.playerId}
                    onChange={(value: string) =>
                      handlePlayerSelect(1, index, value)
                    }
                    selected={(element) =>
                      element &&
                      React.cloneElement(element, {
                        className:
                          'flex items-center opacity-100 px-0 gap-2 pointer-events-none',
                      })
                    }
                  >
                    {players1.map(({ playerId, playerName, jerseyNumber }) => (
                      <Option
                        key={playerId}
                        value={playerId}
                        className="flex items-center gap-2"
                      >
                        {playerName}({jerseyNumber})
                      </Option>
                    ))}
                  </Select>
                </div>
              ))}
          </div>

          <div className="flex-1 items-start justify-start">
            {!loadingPlayers &&
              yellowCardScorersTeam2.map((scorer, index) => (
                <div key={index} className="mt-2">
                  <Select
                    size="lg"
                    label="Select Player"
                    value={scorer.playerId}
                    onChange={(value: string) =>
                      handlePlayerSelect(2, index, value)
                    }
                    selected={(element) =>
                      element &&
                      React.cloneElement(element, {
                        className:
                          'flex items-center opacity-100 px-0 gap-2 pointer-events-none',
                      })
                    }
                  >
                    {players2.map(({ playerId, playerName, jerseyNumber }) => (
                      <Option
                        key={playerId}
                        value={playerId}
                        className="flex items-center gap-2"
                      >
                        {playerName}({jerseyNumber})
                      </Option>
                    ))}
                  </Select>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YellowCardComponent;
