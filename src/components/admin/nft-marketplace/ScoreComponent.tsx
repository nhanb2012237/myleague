import React, { useState, useEffect } from 'react';
import { Player } from '../../../models/entities';
import { Match } from '../../../models/entities';
import { serverTimestamp } from 'firebase/firestore';
import { TeamInfo } from '../../../models/entities';
import axios from 'axios';
import { Select, Option } from '@material-tailwind/react';
import { TextField, Alert, Input } from '@mui/material';

interface GoalScorer {
  team: number; // 1 cho đội 1, 2 cho đội 2
  player: Player;
}

interface PlayerScore {
  playerId: string; // ID của cầu thủ
  playerName: string; // Tên của cầu thủ
  goals: number; // Số bàn thắng
}

interface ScoreComponentProps {
  team1: TeamInfo;
  team2: TeamInfo;
  userId: string;
  tournamentId: string;
  matchId: string;
  match: Match;
  onReload?: () => void;
  setGoalScorers: (scorers: GoalScorer[]) => void;
  setTeam1Score: (score: number) => void;
  setTeam2Score: (score: number) => void;
}

const ScoreComponent: React.FC<ScoreComponentProps> = ({
  team1,
  team2,
  userId,
  tournamentId,
  matchId,
  match,
  onReload,
  setGoalScorers,
  setTeam1Score,
  setTeam2Score,
}) => {
  const [team1Score, setLocalTeam1Score] = useState<number>(
    match.score.team1Score,
  );
  const [team2Score, setLocalTeam2Score] = useState<number>(
    match.score.team2Score,
  );
  const [goalScorersTeam1, setGoalScorersTeam1] = useState<PlayerScore[]>([]);
  const [goalScorersTeam2, setGoalScorersTeam2] = useState<PlayerScore[]>([]);
  const [players1, setPlayers1] = useState<Player[]>([]);
  const [players2, setPlayers2] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setLoadingPlayers(true);
    Promise.all([
      fetchPlayers(team1.teamId, userId, tournamentId),
      fetchPlayers(team2.teamId, userId, tournamentId),
    ]).then(([players1Data, players2Data]) => {
      setPlayers1(players1Data);
      setPlayers2(players2Data);
      setLoadingPlayers(false);
    });
  }, [team1.teamId, team2.teamId, userId, tournamentId]);

  const fetchPlayers = async (
    teamId: string,
    userId: string,
    tournamentId: string,
  ): Promise<any[]> => {
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

  // const handleScoreChange = (team: number, score: string) => {
  //   const newScore = parseInt(score, 10);

  //   if (isNaN(newScore) || newScore < 0) {
  //     return; // Không làm gì nếu newScore không hợp lệ hoặc âm
  //   }

  //   if (team === 1) {
  //     setLocalTeam1Score(newScore);
  //     setTeam1Score(newScore);
  //     setGoalScorersTeam1((prev) => {
  //       if (newScore > prev.length) {
  //         return [
  //           ...prev,
  //           ...Array(newScore - prev.length).fill({
  //             playerId: '',
  //             playerName: '',
  //             goals: 1,
  //           }),
  //         ];
  //       } else {
  //         return prev.slice(0, newScore);
  //       }
  //     });
  //   } else if (team === 2) {
  //     setLocalTeam2Score(newScore);
  //     setTeam2Score(newScore);
  //     setGoalScorersTeam2((prev) => {
  //       if (newScore > prev.length) {
  //         return [
  //           ...prev,
  //           ...Array(newScore - prev.length).fill({
  //             playerId: '',
  //             playerName: '',
  //             goals: 1,
  //           }),
  //         ];
  //       } else {
  //         return prev.slice(0, newScore);
  //       }
  //     });
  //   }
  // };
  const handleScoreChange = (team: number, score: string) => {
    // Giá trị nhập vào là chuỗi
    if (score === '') {
      // Nếu giá trị trống, reset score về 0
      if (team === 1) {
        setLocalTeam1Score(0);
        setTeam1Score(0);
      } else if (team === 2) {
        setLocalTeam2Score(0);
        setTeam2Score(0);
      }
      return;
    }

    const newScore = parseInt(score, 10); // Chuyển chuỗi sang số nguyên

    if (isNaN(newScore) || newScore < 0) {
      // Không làm gì nếu giá trị không hợp lệ
      return;
    }

    // Cập nhật state và logic số bàn thắng
    if (team === 1) {
      setLocalTeam1Score(newScore);
      setTeam1Score(newScore);
      setGoalScorersTeam1((prev) => {
        if (newScore > prev.length) {
          return [
            ...prev,
            ...Array(newScore - prev.length).fill({
              playerId: '',
              playerName: '',
              goals: 1,
            }),
          ];
        } else {
          return prev.slice(0, newScore);
        }
      });
    } else if (team === 2) {
      setLocalTeam2Score(newScore);
      setTeam2Score(newScore);
      setGoalScorersTeam2((prev) => {
        if (newScore > prev.length) {
          return [
            ...prev,
            ...Array(newScore - prev.length).fill({
              playerId: '',
              playerName: '',
              goals: 1,
            }),
          ];
        } else {
          return prev.slice(0, newScore);
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
      const newGoalScorersTeam1 = [...goalScorersTeam1];
      newGoalScorersTeam1[index] = {
        playerId: player?.playerId || '',
        playerName: player?.playerName || '',
        goals: 1,
      };
      setGoalScorersTeam1(newGoalScorersTeam1);
    } else if (team === 2) {
      const newGoalScorersTeam2 = [...goalScorersTeam2];
      newGoalScorersTeam2[index] = {
        playerId: player?.playerId || '',
        playerName: player?.playerName || '',
        goals: 1,
      };
      setGoalScorersTeam2(newGoalScorersTeam2);
    }
  };

  useEffect(() => {
    setGoalScorers([
      ...goalScorersTeam1.map((scorer) => ({
        team: 1,
        player: {
          playerId: scorer.playerId,
          playerName: scorer.playerName,
          displayName: '',
          jerseyNumber: 0,
          dateOfBirth: new Date(),
          teamId: '',
          email: '',
          phone: '',
          avatarUrl: '',
          position: '',
          timestamp: serverTimestamp(),
          goals: scorer.goals,
        },
      })),
      ...goalScorersTeam2.map((scorer) => ({
        team: 2,
        player: {
          playerId: scorer.playerId,
          playerName: scorer.playerName,
          displayName: '',
          jerseyNumber: 0,
          dateOfBirth: new Date(),
          teamId: '',
          email: '',
          phone: '',
          avatarUrl: '',
          position: '',
          timestamp: serverTimestamp(),
          goals: scorer.goals,
        },
      })),
    ]);
  }, [goalScorersTeam1, goalScorersTeam2, setGoalScorers]);

  useEffect(() => {
    // Check if all goal scorers have a selected player
    const allSelected =
      goalScorersTeam1.every((scorer) => scorer.playerId) &&
      goalScorersTeam2.every((scorer) => scorer.playerId);
    if (!allSelected) {
      setError('Vui lòng chọn cầu thủ cho tất cả các bàn thắng.');
    } else {
      setError('');
    }
  }, [goalScorersTeam1, goalScorersTeam2]);

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
            value={team1Score}
            onChange={(e) => handleScoreChange(1, e.target.value)}
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
            value={team2Score}
            onChange={(e) => handleScoreChange(2, e.target.value)}
            type="number"
            variant="outlined"
            margin="normal"
          />
        </div>
        <div className="mt-4 flex w-full flex-1 items-start justify-between gap-5">
          <div className="flex-1 items-start justify-start">
            {!loadingPlayers &&
              goalScorersTeam1.map((scorer, index) => (
                <div key={index} className="mt-2">
                  <Select
                    size="lg"
                    label="Select Players"
                    value={scorer.playerId}
                    onChange={(value: string) =>
                      handlePlayerSelect(1, index, value)
                    }
                    selected={(element) =>
                      element &&
                      React.cloneElement(element, {
                        disabled: true,
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
              goalScorersTeam2.map((scorer, index) => (
                <div key={index} className="mt-2">
                  <Select
                    size="lg"
                    label="Chọn cầu thủ"
                    value={scorer.playerId}
                    onChange={(value: string) =>
                      handlePlayerSelect(2, index, value)
                    }
                    selected={(element) =>
                      element &&
                      React.cloneElement(element, {
                        disabled: true,
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

export default ScoreComponent;
