// pages/api/tournament/status.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../config/firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    try {
      const querySnapshot = await getDocs(collection(db, 'tournaments'));
      if (!querySnapshot.empty) {
        // Giả sử chỉ có một giải đấu hoặc lấy giải đấu mới nhất
        const tournamentDoc = querySnapshot.docs[0].data();
        res.status(200).json({
          tournamentCreated: true,
          tournament: tournamentDoc,
        });
      } else {
        res.status(200).json({
          tournamentCreated: false,
          tournament: null,
        });
      }
    } catch (error) {
      console.error('Failed to fetch tournament status:', error);
      res.status(500).json({ error: 'Failed to fetch tournament status' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
