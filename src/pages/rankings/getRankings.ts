import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebaseconfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const { userId, tournamentId } = req.query;
    console.log('userId:', userId, 'tournamentId:', tournamentId);

    // Kiểm tra xem dữ liệu đầu vào có hợp lệ không
    if (!userId || !tournamentId) {
      console.error('Dữ liệu đầu vào không hợp lệ:', req.query);
      return res.status(400).json({ error: 'Dữ liệu đầu vào không hợp lệ' });
    }

    try {
      // Lấy dữ liệu từ bảng rankings
      const rankingsRef = collection(
        db,
        `users/${userId}/tournaments/${tournamentId}/rankings`,
      );
      const querySnapshot = await getDocs(rankingsRef);
      const rankings = querySnapshot.docs.map((doc) => doc.data());

      res.status(200).json(rankings);
    } catch (error) {
      console.error('Lấy dữ liệu bảng xếp hạng thất bại:', error);
      res.status(500).json({
        error: 'Lấy dữ liệu bảng xếp hạng thất bại',
        details: error.message,
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res
      .status(405)
      .json({ error: `Phương thức ${req.method} không được phép` });
  }
}
