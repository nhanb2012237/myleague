// import { NextApiRequest, NextApiResponse } from 'next';
// import { IncomingForm } from 'formidable';
// import fs from 'fs';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../../../../config/firebaseconfig';
// import { doc, updateDoc, getDoc } from 'firebase/firestore';
// import { Player } from '../../../models/entities';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ): Promise<void> {
//   // Check if the method is PUT
//   console.log('Request method:', req.method); // Log the request method
//   if (req.method !== 'PUT') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const data = await new Promise<{ fields: any; files: any }>(
//       (resolve, reject) => {
//         const form = new IncomingForm();
//         form.parse(req, (err, fields, files) => {
//           if (err) {
//             reject({ err });
//           } else {
//             resolve({ fields, files });
//           }
//         });
//       },
//     );

//     const {
//       playerId,
//       displayName,
//       jerseyNumber,
//       dateOfBirth,
//       playerName,
//       email,
//       phone,
//       position,
//       teamId,
//       tournamentId,
//       userId,
//       faceDescriptor,
//     } = data.fields;

//     const imageFile = data.files.files?.[0];

//     // Validate required fields
//     if (!playerId || !playerName || !email || !phone || !position || !teamId) {
//       console.log('Missing required fields:', data.fields);
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     let imageUrl = '';
//     if (imageFile && imageFile.filepath) {
//       try {
//         const storageRef = ref(
//           storage,
//           `players/${Date.now()}-${imageFile.originalFilename}`,
//         );
//         const fileBuffer = fs.readFileSync(imageFile.filepath);
//         const snapshot = await uploadBytes(storageRef, fileBuffer);
//         imageUrl = await getDownloadURL(snapshot.ref);

//         // Clean up temporary file
//         fs.unlinkSync(imageFile.filepath);
//       } catch (uploadError) {
//         console.error('Error uploading image:', uploadError);
//         return res.status(500).json({
//           error: 'Error uploading image',
//           details: uploadError.message,
//         });
//       }
//     }

//     // Tham chiếu đến cầu thủ trong Firestore
//     const playerRef = doc(
//       db,
//       `users/${userId}/tournaments/${tournamentId}/teams/${teamId}/players/${playerId}`,
//     );

//     // Lấy dữ liệu hiện tại của cầu thủ
//     const playerDoc = await getDoc(playerRef);

//     if (!playerDoc.exists()) {
//       return res.status(404).json({ error: 'Player not found' });
//     }

//     // Lấy dữ liệu cũ từ Firestore
//     const existingPlayerData = playerDoc.data() as Player;

//     // Prepare the player data
//     const updatedFields: Partial<Player> = {

//       displayName: String(displayName) || existingPlayerData.displayName,
//       dateOfBirth: new Date(dateOfBirth) || existingPlayerData.dateOfBirth,
//       jerseyNumber: Number(jerseyNumber) || existingPlayerData.jerseyNumber,
//       playerName: String(playerName) || existingPlayerData.playerName,
//       email: String(email) || existingPlayerData.email,
//       phone: String(phone) || existingPlayerData.phone,
//       position: String(position) || existingPlayerData.position,
//       avatarUrl: imageUrl || existingPlayerData.avatarUrl,
//       faceDescriptor: faceDescriptor || existingPlayerData.faceDescriptor,

//     };

//     // Kiểm tra dữ liệu có thay đổi không

//     // Update player in Firestore
//     try {
//       await updateDoc(playerRef, updatedFields);

//       res.status(200).json({
//         message: 'Player updated successfully',
//         player: { id: playerId, ...updatedFields },
//       });
//     } catch (firestoreError) {
//       console.error('Error updating player data:', firestoreError);
//       return res.status(500).json({
//         error: 'Error updating player data',
//         details: firestoreError.message,
//       });
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: error.message });
//   }
// }
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../../config/firebaseconfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
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
  // Check if the method is PUT
  console.log('Request method:', req.method);
  // Log the request method
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Phương thức không được phép' });
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
      playerId,
      displayName,
      jerseyNumber,
      dateOfBirth,
      playerName,
      email,
      phone,
      position,
      teamId,
      tournamentId,
      userId,
      faceDescriptor,
    } = data.fields;
    console.log('Data:', data.fields);

    const imageFile = data.files.files?.[0];

    // Validate required fields
    if (!playerId || !tournamentId || !teamId || !userId) {
      console.log('Missing required fields:', data.fields);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let imageUrl = '';
    if (imageFile && imageFile.filepath) {
      try {
        const storageRef = ref(
          storage,
          `players/${Date.now()}-${imageFile.originalFilename}`,
        );
        const fileBuffer = fs.readFileSync(imageFile.filepath);
        const snapshot = await uploadBytes(storageRef, fileBuffer);
        imageUrl = await getDownloadURL(snapshot.ref);

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
    const existingPlayerData = playerDoc.data() as Player;

    // Prepare the player data
    const playerData: Partial<Player> = {
      displayName: displayName ? String(displayName) : undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      jerseyNumber: jerseyNumber ? Number(jerseyNumber) : undefined,
      playerName: playerName ? String(playerName) : undefined,
      email: email ? String(email) : undefined,
      phone: phone ? String(phone) : undefined,
      position: position ? String(position) : undefined,
      avatarUrl: imageUrl || undefined,
      faceDescriptor: faceDescriptor || undefined,
      teamId: existingPlayerData.teamId, // Ensure teamId is included
      timestamp: existingPlayerData.timestamp, // Ensure timestamp is included
    };

    // Remove undefined fields
    Object.keys(playerData).forEach((key) => {
      if (playerData[key as keyof Player] === undefined) {
        delete playerData[key as keyof Player];
      }
    });

    // Remove undefined fields
    Object.keys(playerData).forEach((key) => {
      if (playerData[key as keyof Player] === undefined) {
        delete playerData[key as keyof Player];
      }
    });

    // Update player in Firestore
    try {
      await updateDoc(playerRef, playerData);

      res.status(200).json({
        message: 'Player updated successfully',
        player: { id: playerId, ...playerData },
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
