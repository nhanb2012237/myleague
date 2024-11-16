import { NextApiRequest, NextApiResponse } from 'next';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';

export default async function updatePlayerHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { playerId, userId, tournamentId, teamId, playerName, goals } =
      req.body;

    if (!playerId || !userId || !tournamentId || !teamId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Tham chiếu đến cầu thủ trong Firestore
    const playerRef = doc(
      db,
      `users/${userId}/tournaments/${tournamentId}/teams/${teamId}/players/${playerId}`,
    );

    // Lấy dữ liệu hiện tại của cầu thủ
    const playerDoc = await getDoc(playerRef);

    if (!playerDoc.exists()) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Lấy dữ liệu cũ từ Firestore
    const existingPlayerData = playerDoc.data();

    // Tạo object mới với dữ liệu cần cập nhật
    const updatedData: any = {};
    if (playerName && playerName !== existingPlayerData.playerName) {
      updatedData.playerName = playerName;
    }
    if (goals !== undefined && goals !== existingPlayerData.goals) {
      updatedData.goals = goals;
    }

    // Kiểm tra xem có gì thay đổi không
    if (Object.keys(updatedData).length === 0) {
      return res.status(200).json({ message: 'No changes detected' });
    }

    // Cập nhật thông tin cầu thủ trong Firestore
    await updateDoc(playerRef, updatedData);

    res.status(200).json({
      message: 'Player information updated successfully',
      updatedData,
    });
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({
      error: 'Error updating player',
      details: error.message,
    });
  }
}
