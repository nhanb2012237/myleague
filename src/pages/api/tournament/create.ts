import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../../config/firebaseconfig';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
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

    const {
      numberPlayerofTeam,
      tournamentName,
      numberOfTeams,
      startDate,
      endDate,
      location,
      userId,
    } = data.fields;
    const logoFile = data.files.logo?.[0];

    if (
      !numberPlayerofTeam ||
      !tournamentName ||
      !numberOfTeams ||
      !startDate ||
      !endDate ||
      !location ||
      !userId
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let logoUrl = '';
    if (logoFile && logoFile.filepath) {
      try {
        const storageRef = ref(
          storage,
          `tournaments/${Date.now()}-${logoFile.originalFilename}`,
        );
        const fileBuffer = fs.readFileSync(logoFile.filepath);
        const snapshot = await uploadBytes(storageRef, fileBuffer);
        logoUrl = await getDownloadURL(snapshot.ref);

        fs.unlinkSync(logoFile.filepath); // Delete the temporary file after uploading
      } catch (uploadError) {
        console.error('Error uploading logo:', uploadError);
        return res.status(500).json({
          error: 'Error uploading logo',
          details: uploadError.message,
        });
      }
    }

    // Prepare the tournament data
    const tournamentData = {
      tournamentName: String(tournamentName),
      numberOfTeams: Number(numberOfTeams),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location: String(location),
      logoUrl,
      timestamp: serverTimestamp(),
      numberPlayerofTeam: Number(numberPlayerofTeam),
    };

    try {
      // Add the tournament document to Firestore
      const docRef = await addDoc(
        collection(db, `users/${userId}/tournaments`),
        tournamentData,
      );

      // Update the document with the auto-generated ID
      await updateDoc(doc(db, `users/${userId}/tournaments/${docRef.id}`), {
        id: docRef.id,
      });

      res.status(201).json({
        message: 'Tournament created successfully',
        tournament: { id: docRef.id, ...tournamentData },
      });
    } catch (firestoreError) {
      console.error('Error saving tournament data:', firestoreError);
      return res.status(500).json({
        error: 'Error saving tournament data',
        details: firestoreError.message,
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
