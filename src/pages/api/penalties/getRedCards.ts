import { NextApiRequest, NextApiResponse } from 'next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const { matchId, userId, tournamentId } = req.query;

    // Kiểm tra xem dữ liệu đầu vào có hợp lệ không
    if (!matchId || !userId || !tournamentId) {
      console.error('Dữ liệu đầu vào không hợp lệ:', req.query);
      return res.status(400).json({ error: 'Dữ liệu đầu vào không hợp lệ' });
    }

    try {
      // Tạo tham chiếu đến bộ sưu tập penalties trong Firestore
      const penaltiesRef = collection(
        db,
        `users/${userId}/tournaments/${tournamentId}/penalties`,
      );

      // Tạo truy vấn để lấy về các thẻ đỏ
      const redCardsQuery = query(
        penaltiesRef,
        where('type', '==', 'red'),
        where('matchId', '==', matchId),
      );

      // Thực hiện truy vấn
      const querySnapshot = await getDocs(redCardsQuery);

      // Chuyển đổi kết quả truy vấn thành mảng các thẻ đỏ
      const redCards = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json({ redCards });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thẻ đỏ:', error);
      res.status(500).json({
        error: 'Lỗi khi lấy danh sách thẻ đỏ',
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