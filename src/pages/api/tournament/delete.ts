// FILE: delete.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { db, storage } from '../../../../config/firebaseconfig';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, tournamentId } = req.query;

    if (!userId || !tournamentId) {
      return res.status(400).json({ error: 'Missing userId or tournamentId' });
    }

    const tournamentRef = doc(
      db,
      `users/${userId}/tournaments/${tournamentId}`,
    );
    const tournamentSnap = await getDoc(tournamentRef);

    if (!tournamentSnap.exists()) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const tournamentData = tournamentSnap.data();

    // Delete logo from Firebase Storage if exists
    if (tournamentData.logoUrl) {
      try {
        const logoUrl = tournamentData.logoUrl;
        const decodeUrl = decodeURIComponent(logoUrl);
        const storagePath = decodeUrl
          .split('/o/')[1]
          .split('?')[0]
          .replace(/\+/g, ' ');
        const logoRef = ref(storage, storagePath);
        await deleteObject(logoRef);
        console.log('Logo deleted successfully.');
      } catch (storageError: any) {
        console.error('Error deleting logo:', storageError);
        return res.status(500).json({
          error: 'Error deleting logo from storage',
          details: storageError.message,
        });
      }
    }

    // Delete tournament document from Firestore
    await deleteDoc(tournamentRef);
    console.log('Tournament document deleted successfully.');

    res.status(200).json({ message: 'Tournament deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting tournament:', error);
    res.status(500).json({ error: error.message });
  }
}
