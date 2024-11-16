import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../config/firebaseconfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log('req.method:', req.method);
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, tournamentId } = req.query;
    console.log('userId:', userId);
    console.log('tournamentId:', tournamentId);

    // Validate required fields
    if (!userId || !tournamentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Query Firestore for recognition history
    const historyPath = `users/${userId}/tournaments/${tournamentId}/recognition-history`;
    const q = query(collection(db, historyPath));
    const querySnapshot = await getDocs(q);

    const recognitionHistory = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(recognitionHistory);
  } catch (error) {
    console.error('Error fetching recognition history:', error);
    res.status(500).json({ error: 'Failed to fetch recognition history' });
  }
}
