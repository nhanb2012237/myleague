// import { NextApiRequest, NextApiResponse } from 'next';
// import {
//   doc,
//   getDoc,
//   addDoc,
//   getDocs,
//   updateDoc,
//   increment,
//   serverTimestamp,
//   collection,
//   deleteDoc,
// } from 'firebase/firestore';
// import { db } from '../../../../config/firebaseconfig';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   if (req.method === 'PUT') {
//     const {
//       matchId,
//       userId,
//       tournamentId,
//       team1Score,
//       team2Score,
//       goalScorers,
//       yellowCards,
//       redCards,
//       team1Id,
//       team2Id,
//     } = req.body;

//     console.log(
//       'req.body:',
//       matchId,
//       userId,
//       tournamentId,
//       goalScorers,
//       team1Id,
//       team2Id,
//     );
//     console.log('tiso1:', team1Score);
//     console.log('tiso2:', team2Score);
//     console.log('thevang:', yellowCards);
//     console.log('thedo:', redCards);

//     // Kiểm tra xem dữ liệu đầu vào có hợp lệ không
//     if (
//       !matchId ||
//       !userId ||
//       !tournamentId ||
//       team1Score === undefined ||
//       team2Score === undefined ||
//       !goalScorers ||
//       !yellowCards ||
//       !redCards
//     ) {
//       console.error('Dữ liệu đầu vào không hợp lệ:', req.body);
//       return res.status(400).json({ error: 'Dữ liệu đầu vào không hợp lệ' });
//     }

//     try {
//       // Tạo tham chiếu đến tài liệu trận đấu trong Firestore
//       const matchRef = doc(
//         db,
//         `users/${userId}/tournaments/${tournamentId}/matches/${matchId}`,
//       );

//       // Lấy dữ liệu hiện tại của trận đấu
//       const matchSnap = await getDoc(matchRef);
//       if (!matchSnap.exists()) {
//         return res.status(404).json({ error: 'Trận đấu không tồn tại' });
//       }
//       const currentMatchData = matchSnap.data();

//       // Kiểm tra nếu dữ liệu không thay đổi
//       const isDataChanged =
//         currentMatchData.score.team1Score !== team1Score ||
//         currentMatchData.score.team2Score !== team2Score ||
//         JSON.stringify(currentMatchData.opponent1.playerScores) !==
//           JSON.stringify(
//             goalScorers
//               .filter((scorer) => scorer.team === 1)
//               .map((scorer) => ({
//                 playerId: scorer.playerId,
//                 playerName: scorer.playerName,
//                 goals: scorer.goals,
//               })),
//           ) ||
//         JSON.stringify(currentMatchData.opponent2.playerScores) !==
//           JSON.stringify(
//             goalScorers
//               .filter((scorer) => scorer.team === 2)
//               .map((scorer) => ({
//                 playerId: scorer.playerId,
//                 playerName: scorer.playerName,
//                 goals: scorer.goals,
//               })),
//           ) ||
//         currentMatchData.penalties.team1.yellowCards !==
//           yellowCards.filter((card) => card.teamId === team1Id).length ||
//         currentMatchData.penalties.team1.redCards !==
//           redCards.filter((card) => card.teamId === team1Id).length ||
//         currentMatchData.penalties.team2.yellowCards !==
//           yellowCards.filter((card) => card.teamId === team2Id).length ||
//         currentMatchData.penalties.team2.redCards !==
//           redCards.filter((card) => card.teamId === team2Id).length;

//       if (!isDataChanged) {
//         return res.status(200).json({ message: 'Dữ liệu không thay đổi' });
//       }

//       // Lấy thông tin thống kê của đội 1 và đội 2
//       const team1StatsRef = doc(
//         db,
//         `users/${userId}/tournaments/${tournamentId}/rankings/${team1Id}`,
//       );
//       const team2StatsRef = doc(
//         db,
//         `users/${userId}/tournaments/${tournamentId}/rankings/${team2Id}`,
//       );

//       const team1StatsSnap = await getDoc(team1StatsRef);
//       const team2StatsSnap = await getDoc(team2StatsRef);

//       if (!team1StatsSnap.exists() || !team2StatsSnap.exists()) {
//         return res
//           .status(404)
//           .json({ error: 'Thông tin thống kê không tồn tại' });
//       }

//       const team1Stats = team1StatsSnap.data();
//       const team2Stats = team2StatsSnap.data();

//       // Trừ đi các thông số của trận đấu trước đó
//       const previousTeam1Win =
//         currentMatchData.score.team1Score > currentMatchData.score.team2Score
//           ? 1
//           : 0;
//       const previousTeam1Draw =
//         currentMatchData.score.team1Score === currentMatchData.score.team2Score
//           ? 1
//           : 0;
//       const previousTeam1Loss =
//         currentMatchData.score.team1Score < currentMatchData.score.team2Score
//           ? 1
//           : 0;
//       const previousTeam1Points = previousTeam1Win * 3 + previousTeam1Draw;

//       const previousTeam2Win =
//         currentMatchData.score.team2Score > currentMatchData.score.team1Score
//           ? 1
//           : 0;
//       const previousTeam2Draw =
//         currentMatchData.score.team2Score === currentMatchData.score.team1Score
//           ? 1
//           : 0;
//       const previousTeam2Loss =
//         currentMatchData.score.team2Score < currentMatchData.score.team1Score
//           ? 1
//           : 0;
//       const previousTeam2Points = previousTeam2Win * 3 + previousTeam2Draw;

//       await updateDoc(team1StatsRef, {
//         matchesPlayed: increment(-1),
//         wins: increment(-previousTeam1Win),
//         draws: increment(-previousTeam1Draw),
//         losses: increment(-previousTeam1Loss),
//         goalsFor: increment(-currentMatchData.score.team1Score),
//         goalsAgainst: increment(-currentMatchData.score.team2Score),
//         goalDifference: increment(
//           -(
//             currentMatchData.score.team1Score -
//             currentMatchData.score.team2Score
//           ),
//         ),
//         points: increment(-previousTeam1Points),
//       });

//       await updateDoc(team2StatsRef, {
//         matchesPlayed: increment(-1),
//         wins: increment(-previousTeam2Win),
//         draws: increment(-previousTeam2Draw),
//         losses: increment(-previousTeam2Loss),
//         goalsFor: increment(-currentMatchData.score.team2Score),
//         goalsAgainst: increment(-currentMatchData.score.team1Score),
//         goalDifference: increment(
//           -(
//             currentMatchData.score.team2Score -
//             currentMatchData.score.team1Score
//           ),
//         ),
//         points: increment(-previousTeam2Points),
//       });

//       // Cập nhật thông tin trận đấu mới
//       await updateDoc(matchRef, {
//         'score.team1Score': team1Score,
//         'score.team2Score': team2Score,
//         'opponent1.playerScores': goalScorers
//           .filter((scorer) => scorer.team === 1)
//           .map((scorer) => ({
//             playerId: scorer.playerId,
//             playerName: scorer.playerName,
//             goals: scorer.goals,
//           })),
//         'opponent2.playerScores': goalScorers
//           .filter((scorer) => scorer.team === 2)
//           .map((scorer) => ({
//             playerId: scorer.playerId,
//             playerName: scorer.playerName,
//             goals: scorer.goals,
//           })),
//         'penalties.team1.yellowCards': yellowCards.filter(
//           (card) => card.teamId === team1Id,
//         ).length,
//         'penalties.team1.redCards': redCards.filter(
//           (card) => card.teamId === team1Id,
//         ).length,
//         'penalties.team2.yellowCards': yellowCards.filter(
//           (card) => card.teamId === team2Id,
//         ).length,
//         'penalties.team2.redCards': redCards.filter(
//           (card) => card.teamId === team2Id,
//         ).length,
//         status: 'completed', // Cập nhật trạng thái trận đấu
//       });

//       // Xóa tất cả các bàn thắng của trận đấu trước đó
//       const existingGoalsSnap = await getDocs(
//         collection(db, `users/${userId}/tournaments/${tournamentId}/goals`),
//       );
//       const deleteGoalPromises = existingGoalsSnap.docs
//         .filter((doc) => doc.data().matchId === matchId)
//         .map((doc) => deleteDoc(doc.ref));

//       // Xóa tất cả các thẻ phạt của trận đấu trước đó
//       const existingPenaltiesSnap = await getDocs(
//         collection(db, `users/${userId}/tournaments/${tournamentId}/penalties`),
//       );
//       const deletePenaltyPromises = existingPenaltiesSnap.docs
//         .filter((doc) => doc.data().matchId === matchId)
//         .map((doc) => deleteDoc(doc.ref));

//       await Promise.all([...deleteGoalPromises, ...deletePenaltyPromises]);

//       // Lưu thông tin cầu thủ ghi bàn vào bảng goal
//       const goalPromises = goalScorers.map(async (scorer) => {
//         const goalDocRef = await addDoc(
//           collection(db, `users/${userId}/tournaments/${tournamentId}/goals`),
//           {
//             matchId: matchId,
//             playerId: scorer.playerId,
//             playerName: scorer.playerName,
//             teamId: scorer.team === 1 ? team1Id : team2Id,
//             goals: scorer.goals,
//             timestamp: serverTimestamp(),
//           },
//         );
//         const goalId = goalDocRef.id;
//         await updateDoc(goalDocRef, { goalId }); // Thêm goalId vào dữ liệu
//       });

//       // Lưu thông tin thẻ phạt vào bảng penalties
//       const penaltyPromises = [...yellowCards, ...redCards].map(
//         async (card) => {
//           const penaltyDocRef = await addDoc(
//             collection(
//               db,
//               `users/${userId}/tournaments/${tournamentId}/penalties`,
//             ),
//             {
//               matchId: matchId,
//               playerId: card.playerId,
//               playerName: card.playerName,
//               teamId: card.teamId === team1Id ? team1Id : team2Id,
//               type: yellowCards.includes(card) ? 'yellow' : 'red',
//               timestamp: serverTimestamp(),
//             },
//           );
//           const cardId = penaltyDocRef.id;
//           await updateDoc(penaltyDocRef, { cardId }); // Thêm cardId vào dữ liệu
//         },
//       );

//       await Promise.all([...goalPromises, ...penaltyPromises]);

//       // Cộng thêm các thông số của trận đấu mới
//       const team1WinNew = team1Score > team2Score ? 1 : 0;
//       const team1DrawNew = team1Score === team2Score ? 1 : 0;
//       const team1LossNew = team1Score < team2Score ? 1 : 0;
//       const team1PointsNew = team1WinNew * 3 + team1DrawNew;

//       const team2WinNew = team2Score > team1Score ? 1 : 0;
//       const team2DrawNew = team2Score === team1Score ? 1 : 0;
//       const team2LossNew = team2Score < team1Score ? 1 : 0;
//       const team2PointsNew = team2WinNew * 3 + team2DrawNew;

//       await updateDoc(team1StatsRef, {
//         teamId: team1Id,
//         matchesPlayed: increment(1),
//         wins: increment(team1WinNew),
//         draws: increment(team1DrawNew),
//         losses: increment(team1LossNew),
//         goalsFor: increment(team1Score),
//         goalsAgainst: increment(team2Score),
//         goalDifference: increment(team1Score - team2Score),
//         points: increment(team1PointsNew),
//       });

//       await updateDoc(team2StatsRef, {
//         teamId: team2Id,
//         matchesPlayed: increment(1),
//         wins: increment(team2WinNew),
//         draws: increment(team2DrawNew),
//         losses: increment(team2LossNew),
//         goalsFor: increment(team2Score),
//         goalsAgainst: increment(team1Score),
//         goalDifference: increment(team2Score - team1Score),
//         points: increment(team2PointsNew),
//       });

//       res.status(200).json({ message: 'Cập nhật trận đấu thành công' });
//     } catch (error) {
//       console.error('Cập nhật trận đấu thất bại:', error);
//       res.status(500).json({
//         error: 'Cập nhật trận đấu thất bại',
//         details: error.message,
//       });
//     }
//   } else {
//     res.setHeader('Allow', ['PUT']);
//     res
//       .status(405)
//       .json({ error: `Phương thức ${req.method} không được phép` });
//   }
// }
import { NextApiRequest, NextApiResponse } from 'next';
import {
  doc,
  getDoc,
  addDoc,
  getDocs,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'PUT') {
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

      // Lấy dữ liệu hiện tại của trận đấu
      const matchSnap = await getDoc(matchRef);
      if (!matchSnap.exists()) {
        return res.status(404).json({ error: 'Trận đấu không tồn tại' });
      }
      const currentMatchData = matchSnap.data();

      const previousStatus = currentMatchData.status;
      const newStatus = 'completed'; // Có thể thay đổi tùy theo logic của bạn

      // Kiểm tra nếu dữ liệu không thay đổi
      const isDataChanged =
        currentMatchData.score.team1Score !== team1Score ||
        currentMatchData.score.team2Score !== team2Score ||
        JSON.stringify(currentMatchData.opponent1.playerScores) !==
          JSON.stringify(
            goalScorers
              .filter((scorer) => scorer.team === 1)
              .map((scorer) => ({
                playerId: scorer.playerId,
                playerName: scorer.playerName,
                goals: scorer.goals,
              })),
          ) ||
        JSON.stringify(currentMatchData.opponent2.playerScores) !==
          JSON.stringify(
            goalScorers
              .filter((scorer) => scorer.team === 2)
              .map((scorer) => ({
                playerId: scorer.playerId,
                playerName: scorer.playerName,
                goals: scorer.goals,
              })),
          ) ||
        currentMatchData.penalties.team1.yellowCards !==
          yellowCards.filter((card) => card.teamId === team1Id).length ||
        currentMatchData.penalties.team1.redCards !==
          redCards.filter((card) => card.teamId === team1Id).length ||
        currentMatchData.penalties.team2.yellowCards !==
          yellowCards.filter((card) => card.teamId === team2Id).length ||
        currentMatchData.penalties.team2.redCards !==
          redCards.filter((card) => card.teamId === team2Id).length;

      if (!isDataChanged) {
        return res.status(200).json({ message: 'Dữ liệu không thay đổi' });
      }

      // Lấy thông tin thống kê của đội 1 và đội 2
      const team1StatsRef = doc(
        db,
        `users/${userId}/tournaments/${tournamentId}/rankings/${team1Id}`,
      );
      const team2StatsRef = doc(
        db,
        `users/${userId}/tournaments/${tournamentId}/rankings/${team2Id}`,
      );

      const team1StatsSnap = await getDoc(team1StatsRef);
      const team2StatsSnap = await getDoc(team2StatsRef);

      if (!team1StatsSnap.exists() || !team2StatsSnap.exists()) {
        return res
          .status(404)
          .json({ error: 'Thông tin thống kê không tồn tại' });
      }

      const team1Stats = team1StatsSnap.data();
      const team2Stats = team2StatsSnap.data();

      // Tính toán các chỉ số trước khi cập nhật
      const previousTeam1Win =
        currentMatchData.score.team1Score > currentMatchData.score.team2Score
          ? 1
          : 0;
      const previousTeam1Draw =
        currentMatchData.score.team1Score === currentMatchData.score.team2Score
          ? 1
          : 0;
      const previousTeam1Loss =
        currentMatchData.score.team1Score < currentMatchData.score.team2Score
          ? 1
          : 0;
      const previousTeam1Points = previousTeam1Win * 3 + previousTeam1Draw;

      const previousTeam2Win =
        currentMatchData.score.team2Score > currentMatchData.score.team1Score
          ? 1
          : 0;
      const previousTeam2Draw =
        currentMatchData.score.team2Score === currentMatchData.score.team1Score
          ? 1
          : 0;
      const previousTeam2Loss =
        currentMatchData.score.team2Score < currentMatchData.score.team1Score
          ? 1
          : 0;
      const previousTeam2Points = previousTeam2Win * 3 + previousTeam2Draw;

      if (previousStatus !== 'completed' && newStatus === 'completed') {
        // Trận đấu mới hoàn thành
        const team1WinNew = team1Score > team2Score ? 1 : 0;
        const team1DrawNew = team1Score === team2Score ? 1 : 0;
        const team1LossNew = team1Score < team2Score ? 1 : 0;
        const team1PointsNew = team1WinNew * 3 + team1DrawNew;

        const team2WinNew = team2Score > team1Score ? 1 : 0;
        const team2DrawNew = team2Score === team1Score ? 1 : 0;
        const team2LossNew = team2Score < team1Score ? 1 : 0;
        const team2PointsNew = team2WinNew * 3 + team2DrawNew;

        await updateDoc(team1StatsRef, {
          matchesPlayed: increment(1),
          wins: increment(team1WinNew),
          draws: increment(team1DrawNew),
          losses: increment(team1LossNew),
          goalsFor: increment(team1Score),
          goalsAgainst: increment(team2Score),
          goalDifference: increment(team1Score - team2Score),
          points: increment(team1PointsNew),
        });

        await updateDoc(team2StatsRef, {
          matchesPlayed: increment(1),
          wins: increment(team2WinNew),
          draws: increment(team2DrawNew),
          losses: increment(team2LossNew),
          goalsFor: increment(team2Score),
          goalsAgainst: increment(team1Score),
          goalDifference: increment(team2Score - team1Score),
          points: increment(team2PointsNew),
        });
      } else if (previousStatus === 'completed' && newStatus === 'completed') {
        // Trận đấu đã hoàn thành và vẫn hoàn thành (cập nhật kết quả)
        // Trừ đi các chỉ số của kết quả cũ
        await updateDoc(team1StatsRef, {
          wins: increment(-previousTeam1Win),
          draws: increment(-previousTeam1Draw),
          losses: increment(-previousTeam1Loss),
          goalsFor: increment(-currentMatchData.score.team1Score),
          goalsAgainst: increment(-currentMatchData.score.team2Score),
          goalDifference: increment(
            -(
              currentMatchData.score.team1Score -
              currentMatchData.score.team2Score
            ),
          ),
          points: increment(-previousTeam1Points),
        });

        await updateDoc(team2StatsRef, {
          wins: increment(-previousTeam2Win),
          draws: increment(-previousTeam2Draw),
          losses: increment(-previousTeam2Loss),
          goalsFor: increment(-currentMatchData.score.team2Score),
          goalsAgainst: increment(-currentMatchData.score.team1Score),
          goalDifference: increment(
            -(
              currentMatchData.score.team2Score -
              currentMatchData.score.team1Score
            ),
          ),
          points: increment(-previousTeam2Points),
        });

        // Cộng lại các chỉ số mới
        const team1WinNew = team1Score > team2Score ? 1 : 0;
        const team1DrawNew = team1Score === team2Score ? 1 : 0;
        const team1LossNew = team1Score < team2Score ? 1 : 0;
        const team1PointsNew = team1WinNew * 3 + team1DrawNew;

        const team2WinNew = team2Score > team1Score ? 1 : 0;
        const team2DrawNew = team2Score === team1Score ? 1 : 0;
        const team2LossNew = team2Score < team1Score ? 1 : 0;
        const team2PointsNew = team2WinNew * 3 + team2DrawNew;

        await updateDoc(team1StatsRef, {
          wins: increment(team1WinNew),
          draws: increment(team1DrawNew),
          losses: increment(team1LossNew),
          goalsFor: increment(team1Score),
          goalsAgainst: increment(team2Score),
          goalDifference: increment(team1Score - team2Score),
          points: increment(team1PointsNew),
        });

        await updateDoc(team2StatsRef, {
          wins: increment(team2WinNew),
          draws: increment(team2DrawNew),
          losses: increment(team2LossNew),
          goalsFor: increment(team2Score),
          goalsAgainst: increment(team1Score),
          goalDifference: increment(team2Score - team1Score),
          points: increment(team2PointsNew),
        });
      } else if (previousStatus === 'completed' && newStatus !== 'completed') {
        // Trận đấu thay đổi từ hoàn thành sang chưa hoàn thành
        // Trừ đi các chỉ số của kết quả cũ
        await updateDoc(team1StatsRef, {
          matchesPlayed: increment(-1),
          wins: increment(-previousTeam1Win),
          draws: increment(-previousTeam1Draw),
          losses: increment(-previousTeam1Loss),
          goalsFor: increment(-currentMatchData.score.team1Score),
          goalsAgainst: increment(-currentMatchData.score.team2Score),
          goalDifference: increment(
            -(
              currentMatchData.score.team1Score -
              currentMatchData.score.team2Score
            ),
          ),
          points: increment(-previousTeam1Points),
        });

        await updateDoc(team2StatsRef, {
          matchesPlayed: increment(-1),
          wins: increment(-previousTeam2Win),
          draws: increment(-previousTeam2Draw),
          losses: increment(-previousTeam2Loss),
          goalsFor: increment(-currentMatchData.score.team2Score),
          goalsAgainst: increment(-currentMatchData.score.team1Score),
          goalDifference: increment(
            -(
              currentMatchData.score.team2Score -
              currentMatchData.score.team1Score
            ),
          ),
          points: increment(-previousTeam2Points),
        });
      }

      // Cập nhật thông tin trận đấu mới
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
        status: newStatus, // Cập nhật trạng thái trận đấu
      });

      // Xóa tất cả các bàn thắng của trận đấu trước đó
      const existingGoalsSnap = await getDocs(
        collection(db, `users/${userId}/tournaments/${tournamentId}/goals`),
      );
      const deleteGoalPromises = existingGoalsSnap.docs
        .filter((doc) => doc.data().matchId === matchId)
        .map((doc) => deleteDoc(doc.ref));

      // Xóa tất cả các thẻ phạt của trận đấu trước đó
      const existingPenaltiesSnap = await getDocs(
        collection(db, `users/${userId}/tournaments/${tournamentId}/penalties`),
      );
      const deletePenaltyPromises = existingPenaltiesSnap.docs
        .filter((doc) => doc.data().matchId === matchId)
        .map((doc) => deleteDoc(doc.ref));

      await Promise.all([...deleteGoalPromises, ...deletePenaltyPromises]);

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
              type: yellowCards.some((yc) => yc.cardId === card.cardId)
                ? 'yellow'
                : 'red',
              timestamp: serverTimestamp(),
            },
          );
          const cardId = penaltyDocRef.id;
          await updateDoc(penaltyDocRef, { cardId }); // Thêm cardId vào dữ liệu
        },
      );

      await Promise.all([...goalPromises, ...penaltyPromises]);

      res.status(200).json({ message: 'Cập nhật trận đấu thành công' });
    } catch (error) {
      console.error('Cập nhật trận đấu thất bại:', error);
      res.status(500).json({
        error: 'Cập nhật trận đấu thất bại',
        details: error.message,
      });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res
      .status(405)
      .json({ error: `Phương thức ${req.method} không được phép` });
  }
}
