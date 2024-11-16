import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../config/firebaseconfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log('req.method:', req.method);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, tournamentId, teamId, playerId, status } = req.body;
    console.log('userId:', userId);
    console.log('tournamentId:', tournamentId);
    console.log('teamId:', teamId);
    console.log('playerId:', playerId);
    console.log('status:', status);
    // Validate required fields
    if (!userId || !tournamentId || !playerId || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prepare data for Firestore
    const recognitionData = {
      userId,
      tournamentId,
      teamId: teamId || null, // Optional
      playerId,
      timestamp: serverTimestamp(),
      status,
      // Optional
    };

    // Save to Firestore
    const historyPath = `users/${userId}/tournaments/${tournamentId}/recognition-history`;
    const docRef = await addDoc(collection(db, historyPath), recognitionData);

    res.status(201).json({
      message: 'Recognition history saved successfully',
      id: docRef.id,
    });
  } catch (error) {
    console.error('Error saving recognition history:', error);
    res.status(500).json({ error: 'Failed to save recognition history' });
  }
}
