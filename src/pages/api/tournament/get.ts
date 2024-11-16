import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Tạo truy vấn để lấy các giải đấu của người dùng
    const tournamentsRef = collection(db, `users/${userId}/tournaments`);
    const tournamentsSnapshot = await getDocs(tournamentsRef);

    const tournaments = tournamentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ tournaments });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
}
