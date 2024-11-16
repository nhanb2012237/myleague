import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../../config/firebaseconfig';
import { doc, updateDoc } from 'firebase/firestore';
import { Player } from '../../../models/entities';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  // Check if the method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = await new Promise<{ fields: any; files: any }>(
      (resolve, reject) => {
        const form = new IncomingForm();
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject({ err });
          } else {
            resolve({ fields, files });
          }
        });
      },
    );

    const { playerId, userId, tournamentId, teamId } = data.fields;
    const imageFile = data.files.avatar?.[0];

    // Validate required fields
    if (!playerId || !userId || !tournamentId || !teamId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let avatarUrl = '';
    if (imageFile && imageFile.filepath) {
      try {
        const storageRef = ref(
          storage,
          `players/${Date.now()}-${imageFile.originalFilename}`,
        );
        const fileBuffer = fs.readFileSync(imageFile.filepath);
        const snapshot = await uploadBytes(storageRef, fileBuffer);
        avatarUrl = await getDownloadURL(snapshot.ref);

        // Clean up temporary file
        fs.unlinkSync(imageFile.filepath);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return res.status(500).json({
          error: 'Error uploading image',
          details: uploadError.message,
        });
      }
    }

    // Prepare the player data
    const playerData: Partial<Player> = {
      avatarUrl: avatarUrl || undefined,
    };

    // Remove undefined fields
    Object.keys(playerData).forEach((key) => {
      if (playerData[key as keyof Player] === undefined) {
        delete playerData[key as keyof Player];
      }
    });

    // Update player in Firestore
    try {
      await updateDoc(
        doc(
          db,
          `users/${userId}/tournaments/${tournamentId}/teams/${teamId}/players/${playerId}`,
        ),
        playerData,
      );

      res.status(200).json({
        message: 'Player avatar updated successfully',
        avatarUrl,
      });
    } catch (firestoreError) {
      console.error('Error updating player data:', firestoreError);
      return res.status(500).json({
        error: 'Error updating player data',
        details: firestoreError.message,
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
