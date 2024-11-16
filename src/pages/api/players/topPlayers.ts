import { NextApiRequest, NextApiResponse } from 'next';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    try {
      // Tạo truy vấn để lấy 3 cầu thủ có số bàn thắng nhiều nhất
      const topPlayersQuery = query(
        collection(db, 'players'),
        orderBy('goals', 'desc'), // Sắp xếp theo số bàn thắng giảm dần
        limit(3), // Giới hạn kết quả trả về chỉ có 3 cầu thủ
      );
      const querySnapshot = await getDocs(topPlayersQuery);

      // Chuyển đổi dữ liệu tài liệu thành một mảng
      const topPlayers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Trả về danh sách 3 cầu thủ có số bàn thắng nhiều nhất
      res.status(200).json({ topPlayers });
    } catch (error) {
      // Log lỗi để debug và trả về thông báo lỗi cho client
      console.error('Lấy danh sách cầu thủ thất bại:', error);
      res.status(500).json({
        error: 'Lấy danh sách cầu thủ thất bại',
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
