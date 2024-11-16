import { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tournamentId, userId } = req.query;

  if (!tournamentId || !userId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const docRef = doc(db, `users/${userId}/tournaments/${tournamentId}`);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const tournamentData = docSnap.data();
    res.status(200).json({ tournament: tournamentData });
  } catch (error) {
    console.error('Error fetching tournament data:', error);
    res.status(500).json({ error: 'Error fetching tournament data' });
  }
}
