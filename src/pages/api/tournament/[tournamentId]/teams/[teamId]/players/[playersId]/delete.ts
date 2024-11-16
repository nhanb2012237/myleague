import { db } from '../../../../../../../../../config/firebaseconfig';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { tournamentId, teamId, playerId, userId } = req.query;
  console.log('tournamentId', tournamentId);
  console.log('teamId', teamId);
  console.log('playerId', playerId);
  console.log('userId', userId);
  if (
    typeof tournamentId !== 'string' ||
    typeof teamId !== 'string' ||
    typeof playerId !== 'string' ||
    typeof userId !== 'string'
  ) {
    return res.status(400).json({ message: 'Missing or invalid parameters' });
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
      return res.status(404).json({ message: 'Player not found' });
    }

    // Xóa cầu thủ
    await deleteDoc(playerRef);

    return res.status(200).json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Error deleting player:', error);
    return res.status(500).json({ message: 'Error deleting player', error });
  }
}
