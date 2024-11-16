import { NextApiRequest, NextApiResponse } from 'next';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const { userId, tournamentId, teamId } = req.query;
    console.log('userId api:', userId);
    console.log('tournamentId:', tournamentId);
    console.log('teamId:', teamId);

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
      // Nếu có teamId, trả về thông tin của đội bóng cụ thể
      if (teamId) {
        const teamDocRef = doc(
          db,
          `users/${userId}/tournaments/${tournamentId}/teams`,
          teamId as string,
        );
        const teamDoc = await getDoc(teamDocRef);

        // Kiểm tra xem tài liệu có tồn tại không
        if (!teamDoc.exists()) {
          return res
            .status(404)
            .json({ error: 'Không tìm thấy đội bóng với ID này' });
        }

        // Trả về dữ liệu đội bóng
        const teamData = teamDoc.data();
        return res.status(200).json({ team: { id: teamDoc.id, ...teamData } });
      }

      // Nếu không có teamId, trả về danh sách các đội bóng
      const teamsCollectionRef = collection(
        db,
        `users/${userId}/tournaments/${tournamentId}/teams`,
      );
      const teamsSnapshot = await getDocs(teamsCollectionRef);

      // Kiểm tra xem có đội bóng nào không
      if (teamsSnapshot.empty) {
        return res
          .status(404)
          .json({ error: 'Không có đội bóng nào trong giải đấu này' });
      }

      // Lưu trữ danh sách các đội bóng
      const teamsList = teamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json({ teams: teamsList });
    } catch (error) {
      // Log lỗi và trả về thông báo lỗi cho client
      console.error('Lấy thông tin đội bóng thất bại:', error);
      res.status(500).json({
        error: 'Lấy thông tin đội bóng thất bại',
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
