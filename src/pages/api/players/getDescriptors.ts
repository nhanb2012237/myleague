import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const { userId, tournamentId } = req.query;

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
      const teamsCollectionRef = collection(
        db,
        `users/${userId}/tournaments/${tournamentId}/teams`,
      );
      const teamsSnapshot = await getDocs(teamsCollectionRef);

      const faceDescriptors: any[] = [];

      await Promise.all(
        teamsSnapshot.docs.map(async (teamDoc) => {
          const teamId = teamDoc.id;

          const playersCollectionRef = collection(
            db,
            `users/${userId}/tournaments/${tournamentId}/teams/${teamId}/players`,
          );
          const playersSnapshot = await getDocs(playersCollectionRef);

          playersSnapshot.docs.forEach((playerDoc) => {
            const playerData = playerDoc.data();
            if (playerData.faceDescriptor) {
              faceDescriptors.push(playerData.faceDescriptor);
            }
          });
        }),
      );

      return res.status(200).json({ faceDescriptors });
    } catch (error) {
      console.error('Lấy thông tin faceDescriptor thất bại:', error);
      res.status(500).json({
        error: 'Lấy thông tin faceDescriptor thất bại',
        details: error instanceof Error ? error.message : 'Lỗi không xác định',
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res
      .status(405)
      .json({ error: `Phương thức ${req.method} không được phép` });
  }
}
