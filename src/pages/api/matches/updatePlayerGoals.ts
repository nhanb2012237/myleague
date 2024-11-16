import { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const { userId, tournamentId, matchId, playerGoals } = req.body;

    // Kiểm tra xem dữ liệu đầu vào có hợp lệ không
    if (!userId || !tournamentId || !matchId || !playerGoals) {
      console.error('Dữ liệu đầu vào không hợp lệ:', req.body);
      return res.status(400).json({ error: 'Dữ liệu đầu vào không hợp lệ' });
    }

    try {
      // Fetch the current match data
      const matchRef = doc(
        db,
        `users/${userId}/tournaments/${tournamentId}/matches/${matchId}`,
      );
      const matchSnap = await getDoc(matchRef);
      const matchData = matchSnap.data();

      console.log('Match data:', matchData);

      // Calculate the total goals for each player before the update
      const previousGoalsMap = matchData.opponent1.playerScores
        .concat(matchData.opponent2.playerScores)
        .reduce((acc, scorer) => {
          if (!acc[scorer.playerId]) {
            acc[scorer.playerId] = 0;
          }
          acc[scorer.playerId] += scorer.goals;
          return acc;
        }, {});

      console.log('Previous goals map:', previousGoalsMap);

      // Calculate the total new goals for each player
      const newGoalsMap = playerGoals.reduce((acc, player) => {
        if (!acc[player.playerId]) {
          acc[player.playerId] = 0;
        }
        acc[player.playerId] += player.goals;
        return acc;
      }, {});

      console.log('New goals map:', newGoalsMap);

      // Calculate the difference in goals for each player
      const goalDifferences = Object.keys(newGoalsMap).map((playerId) => ({
        playerId,
        playerName: playerGoals.find((player) => player.playerId === playerId)
          ?.playerName,
        teamId: playerGoals.find((player) => player.playerId === playerId)
          ?.teamId,
        goals: newGoalsMap[playerId],
        previousGoals: previousGoalsMap[playerId] || 0,
        goalDifference:
          newGoalsMap[playerId] - (previousGoalsMap[playerId] || 0),
      }));

      console.log('Goal differences:', goalDifferences);

      // Update the player's total goals
      await Promise.all(
        goalDifferences.map(async (player) => {
          const playerRef = doc(
            db,
            `users/${userId}/tournaments/${tournamentId}/teams/${player.teamId}/players/${player.playerId}`,
          );
          const playerSnap = await getDoc(playerRef);

          if (playerSnap.exists()) {
            await updateDoc(playerRef, {
              goals: increment(player.goalDifference),
            });
          } else {
            await setDoc(playerRef, {
              playerId: player.playerId,
              playerName: player.playerName,
              teamId: player.teamId,
              goals: player.goals,
            });
          }
        }),
      );

      // Update the match data with the new goal scorers
      await updateDoc(matchRef, {
        'opponent1.playerScores': playerGoals
          .filter((scorer) => scorer.team === 1)
          .map((scorer) => ({
            playerId: scorer.playerId,
            playerName: scorer.playerName,
            goals: newGoalsMap[scorer.playerId],
          })),
        'opponent2.playerScores': playerGoals
          .filter((scorer) => scorer.team === 2)
          .map((scorer) => ({
            playerId: scorer.playerId,
            playerName: scorer.playerName,
            goals: newGoalsMap[scorer.playerId],
          })),
      });

      res
        .status(200)
        .json({ message: 'Cập nhật số bàn thắng của cầu thủ thành công' });
    } catch (error) {
      console.error('Cập nhật số bàn thắng của cầu thủ thất bại:', error);
      res.status(500).json({
        error: 'Cập nhật số bàn thắng của cầu thủ thất bại',
        details: error.message,
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res
      .status(405)
      .json({ error: `Phương thức ${req.method} không được phép` });
  }
}
