import { db } from '../../../../config/firebaseconfig';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Sửa lại phần kiểm tra phương thức HTTP
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Phương thức không được phép' });
  }

  const { tournamentId, teamId, playerId, userId } = req.query;
  console.log('tournamentId', tournamentId);
  console.log('teamId', teamId);
  console.log('playerId', playerId);
  console.log('userId', userId);

  // Kiểm tra xem các tham số có hợp lệ không
  if (
    typeof tournamentId !== 'string' ||
    typeof teamId !== 'string' ||
    typeof playerId !== 'string' ||
    typeof userId !== 'string'
  ) {
    return res.status(400).json({ message: 'Thiếu hoặc tham số không hợp lệ' });
  }

  try {
    // Đảm bảo đường dẫn Firebase có số phần tử chẵn
    const playerRef = doc(
      db,
      `users/${userId}/tournaments/${tournamentId}/teams/${teamId}/players/${playerId}`,
    );

    // Kiểm tra xem cầu thủ có tồn tại không
    const playerDoc = await getDoc(playerRef);
    console.log('playerDoc', playerDoc);
    if (!playerDoc.exists()) {
      return res.status(404).json({ message: 'Cầu thủ không tìm thấy' });
    }

    // Xóa cầu thủ
    await deleteDoc(playerRef);

    return res.status(200).json({ message: 'Cầu thủ đã được xóa thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa cầu thủ:', error);
    return res.status(500).json({ message: 'Lỗi khi xóa cầu thủ', error });
  }
}
