import { NextApiRequest, NextApiResponse } from 'next';
import {
  doc,
  setDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const {
      matchId,
      userId,
      tournamentId,
      team1Score,
      team2Score,
      goalScorers,
      yellowCards,
      redCards,
      team1Id,
      team2Id,
    } = req.body;

    console.log(
      'req.body:',
      matchId,
      userId,
      tournamentId,
      goalScorers,
      team1Id,
      team2Id,
    );
    console.log('tiso1:', team1Score);
    console.log('tiso2:', team2Score);
    console.log('thevang:', yellowCards);
    console.log('thedo:', redCards);

    // Kiểm tra xem dữ liệu đầu vào có hợp lệ không
    if (
      !matchId ||
      !userId ||
      !tournamentId ||
      team1Score === undefined ||
      team2Score === undefined ||
      !goalScorers ||
      !yellowCards ||
      !redCards
    ) {
      console.error('Dữ liệu đầu vào không hợp lệ:', req.body);
      return res.status(400).json({ error: 'Dữ liệu đầu vào không hợp lệ' });
    }

    try {
      // Tạo tham chiếu đến tài liệu trận đấu trong Firestore
      const matchRef = doc(
        db,
        `users/${userId}/tournaments/${tournamentId}/matches/${matchId}`,
      );

      await updateDoc(matchRef, {
        'score.team1Score': team1Score,
        'score.team2Score': team2Score,
        'opponent1.playerScores': goalScorers
          .filter((scorer) => scorer.team === 1)
          .map((scorer) => ({
            playerId: scorer.playerId,
            playerName: scorer.playerName,
            goals: scorer.goals,
          })),
        'opponent2.playerScores': goalScorers
          .filter((scorer) => scorer.team === 2)
          .map((scorer) => ({
            playerId: scorer.playerId,
            playerName: scorer.playerName,
            goals: scorer.goals,
          })),
        'penalties.team1.yellowCards': yellowCards.filter(
          (card) => card.teamId === team1Id,
        ).length,
        'penalties.team1.redCards': redCards.filter(
          (card) => card.teamId === team1Id,
        ).length,
        'penalties.team2.yellowCards': yellowCards.filter(
          (card) => card.teamId === team2Id,
        ).length,
        'penalties.team2.redCards': redCards.filter(
          (card) => card.teamId === team2Id,
        ).length,
        status: 'completed', // Cập nhật trạng thái trận đấu
      });

      // Lưu thông tin cầu thủ ghi bàn vào bảng goal
      const goalPromises = goalScorers.map(async (scorer) => {
        const goalDocRef = await addDoc(
          collection(db, `users/${userId}/tournaments/${tournamentId}/goals`),
          {
            matchId,
            playerId: scorer.playerId,
            playerName: scorer.playerName,
            teamId: scorer.team === 1 ? team1Id : team2Id,
            goals: scorer.goals,
            timestamp: serverTimestamp(),
          },
        );
        const goalId = goalDocRef.id;
        await updateDoc(goalDocRef, { goalId }); // Thêm goalId vào dữ liệu
      });

      // Lưu thông tin thẻ phạt vào bảng penalties
      const penaltyPromises = [...yellowCards, ...redCards].map(
        async (card) => {
          const penaltyDocRef = await addDoc(
            collection(
              db,
              `users/${userId}/tournaments/${tournamentId}/penalties`,
            ),
            {
              matchId,
              playerId: card.playerId,
              playerName: card.playerName,
              teamId: card.teamId === team1Id ? team1Id : team2Id,
              type: yellowCards.includes(card) ? 'yellow' : 'red',
              timestamp: serverTimestamp(),
            },
          );
          const cardId = penaltyDocRef.id;
          await updateDoc(penaltyDocRef, { cardId }); // Thêm cardId vào dữ liệu
        },
      );

      await Promise.all([...goalPromises, ...penaltyPromises]);

      // Lưu thông tin thống kê của đội 1 lần đầu tiên
      const team1StatsRef = doc(
        db,
        `users/${userId}/tournaments/${tournamentId}/rankings/${team1Id}`,
      );

      const team1Win = team1Score > team2Score ? 1 : 0;
      const team1Draw = team1Score === team2Score ? 1 : 0;
      const team1Loss = team1Score < team2Score ? 1 : 0;
      const team1Points = team1Win * 3 + team1Draw;

      await setDoc(team1StatsRef, {
        teamId: team1Id,
        matchesPlayed: 1,
        wins: team1Win,
        draws: team1Draw,
        losses: team1Loss,
        goalsFor: team1Score,
        goalsAgainst: team2Score,
        goalDifference: team1Score - team2Score,
        points: team1Points,
      });

      // Lưu thông tin thống kê của đội 2 lần đầu tiên
      const team2StatsRef = doc(
        db,
        `users/${userId}/tournaments/${tournamentId}/rankings/${team2Id}`,
      );

      const team2Win = team2Score > team1Score ? 1 : 0;
      const team2Draw = team2Score === team1Score ? 1 : 0;
      const team2Loss = team2Score < team1Score ? 1 : 0;
      const team2Points = team2Win * 3 + team2Draw;

      await setDoc(team2StatsRef, {
        teamId: team2Id,
        matchesPlayed: 1,
        wins: team2Win,
        draws: team2Draw,
        losses: team2Loss,
        goalsFor: team2Score,
        goalsAgainst: team1Score,
        goalDifference: team2Score - team1Score,
        points: team2Points,
      });

      res.status(200).json({ message: 'Cập nhật trận đấu thành công' });
    } catch (error) {
      console.error('Cập nhật trận đấu thất bại:', error);
      res.status(500).json({
        error: 'Cập nhật trận đấu thất bại',
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
