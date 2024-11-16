import { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const { userId, tournamentId, teamId } = req.query;
    console.log('Received userId:', userId);
    console.log('Received tournamentId:', tournamentId);
    console.log('Received teamId:', teamId);
    // Kiểm tra tham số đầu vào
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId phải là một chuỗi hợp lệ' });
    }

    if (!tournamentId || typeof tournamentId !== 'string') {
      return res
        .status(400)
        .json({ error: 'tournamentId phải là một chuỗi hợp lệ' });
    }

    if (!teamId || typeof teamId !== 'string') {
      return res.status(400).json({ error: 'teamId phải là một chuỗi hợp lệ' });
    }

    try {
      // Lấy thông tin đội bóng cụ thể
      const teamDocRef = doc(
        db,
        `users/${userId}/tournaments/${tournamentId}/teams`,
        teamId,
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
      res.status(200).json({ team: { id: teamDoc.id, ...teamData } });
    } catch (error) {
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
