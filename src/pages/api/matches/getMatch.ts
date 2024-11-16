import { NextApiRequest, NextApiResponse } from 'next';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const { userId, tournamentId, matchId } = req.query;
    console.log('userId api:', userId);
    console.log('tournamentId:', tournamentId);

    // Kiểm tra tham số đầu vào
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId phải là một chuỗi hợp lệ' });
    }

    if (!tournamentId || typeof tournamentId !== 'string') {
      return res
        .status(400)
        .json({ error: 'tournamentId phải là một chuỗi hợp lệ' });
    }

    try {
      // Nếu có matchId, trả về thông tin của trận đấu cụ thể
      if (matchId) {
        const matchDocRef = doc(
          db,
          `users/${userId}/tournaments/${tournamentId}/matches`,
          matchId as string,
        );
        const matchDoc = await getDoc(matchDocRef);

        // Kiểm tra xem tài liệu có tồn tại không
        if (!matchDoc.exists()) {
          return res
            .status(404)
            .json({ error: 'Không tìm thấy trận đấu với ID này' });
        }

        // Trả về dữ liệu trận đấu
        const matchData = matchDoc.data();
        return res
          .status(200)
          .json({ match: { id: matchDoc.id, ...matchData } });
      }

      // Nếu không có matchId, trả về danh sách các trận đấu
      const matchesCollectionRef = collection(
        db,
        `users/${userId}/tournaments/${tournamentId}/matches`,
      );
      const matchesSnapshot = await getDocs(matchesCollectionRef);

      // Kiểm tra xem có trận đấu nào không
      if (matchesSnapshot.empty) {
        return res
          .status(404)
          .json({ error: 'Không có trận đấu nào trong giải đấu này' });
      }

      // Lưu trữ danh sách các trận đấu
      const matchesList = matchesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json({ matches: matchesList });
    } catch (error) {
      // Log lỗi và trả về thông báo lỗi cho client
      console.error('Lấy thông tin trận đấu thất bại:', error);
      res.status(500).json({
        error: 'Lấy thông tin trận đấu thất bại',
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
