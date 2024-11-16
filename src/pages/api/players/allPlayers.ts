import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../config/firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { userId, tournamentId } = req.query;
  console.log('userId:', userId);
  console.log('tournamentId:', tournamentId);

  // Kiểm tra nếu không có đủ thông tin
  if (!tournamentId || !userId) {
    return res.status(400).json({ error: 'Thiếu thông tin yêu cầu' });
  }

  try {
    // 1. Truy vấn tới Firestore để lấy danh sách tất cả các đội
    const teamsRef = collection(
      db,
      `users/${userId}/tournaments/${tournamentId}/teams`,
    );
    const teamsSnapshot = await getDocs(teamsRef);

    if (teamsSnapshot.empty) {
      return res.status(404).json({ message: 'Không tìm thấy đội nào.' });
    }

    // 2. Tạo một mảng để chứa danh sách cầu thủ từ tất cả các đội
    const allPlayers: any[] = [];

    // 3. Lặp qua từng đội để truy vấn danh sách cầu thủ của từng đội
    for (const teamDoc of teamsSnapshot.docs) {
      const teamId = teamDoc.id;
      const playersRef = collection(
        db,
        `users/${userId}/tournaments/${tournamentId}/teams/${teamId}/players`,
      );
      const playersSnapshot = await getDocs(playersRef);

      const players = playersSnapshot.docs.map((doc) => ({
        id: doc.id,
        teamId: teamId, // Gắn thêm teamId để biết cầu thủ thuộc đội nào
        ...doc.data(),
      }));

      // 4. Thêm danh sách cầu thủ của đội này vào mảng tổng
      allPlayers.push(...players);
    }

    // 5. Trả về danh sách tất cả cầu thủ
    res.status(200).json({ players: allPlayers });
  } catch (error) {
    console.error('Lỗi khi tải danh sách cầu thủ:', error);
    res.status(500).json({ error: 'Lỗi khi tải danh sách cầu thủ' });
  }
}
