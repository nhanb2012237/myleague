import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs } from 'firebase/firestore';
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
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  if (typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  try {
    const tournamentsRef = collection(db, `users/${userId}/tournaments`);
    const tournamentsSnap = await getDocs(tournamentsRef);

    if (tournamentsSnap.empty) {
      return res.status(404).json({ error: 'No tournaments found' });
    }

    const tournaments = tournamentsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ tournaments });
  } catch (error) {
    console.error('Error fetching tournaments data:', error);
    res.status(500).json({ error: 'Error fetching tournaments data' });
  }
}
