import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const { userId, tournamentId } = req.query;
    if (!userId || !tournamentId) {
      console.error('Dữ liệu đầu vào không hợp lệ:', req.query);
      return res.status(400).json({ error: 'Dữ liệu đầu vào không hợp lệ' });
    }
    try {
      // Tạo truy vấn để lấy tất cả các bàn thắng từ Firestore
      const goalsCollection = collection(
        db,
        `users/${userId}/tournaments/${tournamentId}/goals`,
      );

      // Thực hiện truy vấn
      const goalsSnap = await getDocs(goalsCollection);

      // Chuyển đổi kết quả truy vấn thành mảng các bàn thắng
      const goals = goalsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Trả về danh sách bàn thắng
      res.status(200).json(goals);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bàn thắng:', error);
      res.status(500).json({ error: 'Lỗi khi lấy danh sách bàn thắng' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res
      .status(405)
      .json({ error: `Phương thức ${req.method} không được phép` });
  }
}
