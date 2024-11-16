// pages/api/players/[teamId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../config/firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { teamId } = req.query;
  const { userId, tournamentId } = req.query;
  console.log('userId api:', userId, tournamentId, teamId);
  // Kiểm tra nếu không có đủ thông tin
  if (!teamId || !tournamentId || !userId) {
    return res.status(400).json({ error: 'Thiếu thông tin yêu cầu' });
  }

  try {
    // Truy vấn tới Firestore
    const playersRef = collection(
      db,
      `users/${userId}/tournaments/${tournamentId}/teams/${teamId}/players`,
    );
    const querySnapshot = await getDocs(playersRef);

    // Lấy dữ liệu và map thành một mảng cầu thủ
    const players = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Trả về danh sách cầu thủ
    res.status(200).json({ players });
  } catch (error) {
    console.error('Lỗi khi tải danh sách cầu thủ:', error);
    res.status(500).json({ error: 'Lỗi khi tải danh sách cầu thủ' });
  }
}
