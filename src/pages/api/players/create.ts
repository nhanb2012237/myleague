// import { NextApiRequest, NextApiResponse } from 'next';
// import { IncomingForm } from 'formidable';
// import fs from 'fs';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../../../../config/firebaseconfig';
// import {
//   doc,
//   collection,
//   addDoc,
//   serverTimestamp,
//   updateDoc,
// } from 'firebase/firestore';
// import { Player } from '../../../models/entities';
// import * as faceapi from 'face-api.js';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
// async function loadModels() {
//   const MODEL_URL = '/models'; // Thay đổi đường dẫn này nếu cần
//   await Promise.all([
//     faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
//     faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
//     faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
//   ]);
// }

// // Hàm để tạo đặc trưng khuôn mặt
// async function getFaceDescriptor(
//   imageUrl: string,
// ): Promise<Float32Array | undefined> {
//   const img = await faceapi.fetchImage(imageUrl);
//   const detection = await faceapi
//     .detectSingleFace(img)
//     .withFaceLandmarks()
//     .withFaceDescriptor();

//   if (detection) {
//     return detection.descriptor;
//   } else {
//     throw new Error('Không phát hiện khuôn mặt trong ảnh');
//   }
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ): Promise<void> {
//   // if (req.method !== 'POST') {
//   //   return res.status(405).json({ error: 'Method not allowed' });
//   // }

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
//     } = data.fields;
//     console.log(data.fields);
//     const imageFile = data.files.files?.[0];

//     if (!playerName || !email || !phone || !position || !teamId) {
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

//         fs.unlinkSync(imageFile.filepath);
//       } catch (uploadError) {
//         console.error('Error uploading image:', uploadError);
//         return res.status(500).json({
//           error: 'Error uploading image',
//           details: uploadError.message,
//         });
//       }
//     }

//     await loadModels(); // Tải các mô hình face-api
//     const faceDescriptor = await getFaceDescriptor(imageUrl);

//     // Prepare the player data
//     const playerData: Player = {
//       playerId: '',
//       displayName: String(displayName),
//       dateOfBirth: new Date(dateOfBirth),
//       jerseyNumber: Number(jerseyNumber),
//       playerName: String(playerName),
//       email: String(email),
//       phone: Number(phone),
//       position: String(position),
//       avatarUrl: imageUrl,
//       goals: 0,
//       teamId: String(teamId),
//       timestamp: serverTimestamp(),
//       faceDescriptor: faceDescriptor,
//     };

//     try {
//       // Tạo tham chiếu tới collection players trong đội bóng cụ thể

//       const playerRef = await addDoc(
//         collection(
//           db,
//           `users/${userId}/tournaments/${tournamentId}/teams/${teamId}/players`,
//         ),
//         playerData,
//       );

//       // Thêm cầu thủ vào Firestore
//       // const docRef = await addDoc(playerRef, playerData);

//       await updateDoc(
//         doc(
//           db,
//           `users/${userId}/tournaments/${tournamentId}/teams/${teamId}/players/${playerRef.id}`,
//         ),
//         {
//           playerId: playerRef.id,
//         },
//       );

//       res.status(201).json({
//         message: 'Cầu thủ đã được thêm thành công',
//         player: { id: playerRef.id, ...playerData },
//       });
//     } catch (firestoreError) {
//       console.error('Error saving player data:', firestoreError);
//       return res.status(500).json({
//         error: 'Error saving player data',
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
import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { Player } from '../../../models/entities';
import * as faceapi from 'face-api.js';

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

    const {
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

    const imageFile = data.files.files?.[0];

    // Validate required fields
    if (!playerName || !email || !phone || !position || !teamId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate image file
    if (!imageFile || !imageFile.filepath) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    let imageUrl = '';
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
    } catch (firestoreError) {
      console.error('Error saving player data:', firestoreError);
      return res.status(500).json({
        error: 'Error saving player data',
        details: firestoreError.message,
      });
    }

    // Prepare the player data
    const playerData: Player = {
      playerId: '',
      displayName: String(displayName),
      dateOfBirth: new Date(dateOfBirth),
      jerseyNumber: Number(jerseyNumber),
      playerName: String(playerName),
      email: String(email),
      phone: String(phone),
      position: String(position),
      avatarUrl: imageUrl,
      goals: 0,
      teamId: String(teamId),
      timestamp: serverTimestamp(),
      faceDescriptor: faceDescriptor,
    };

    // Add player to Firestore
    try {
      const playerRef = await addDoc(
        collection(
          db,
          `users/${userId}/tournaments/${tournamentId}/teams/${teamId}/players`,
        ),
        playerData,
      );

      // Update playerId in the player data
      await updateDoc(
        doc(
          db,
          `users/${userId}/tournaments/${tournamentId}/teams/${teamId}/players/${playerRef.id}`,
        ),
        {
          playerId: playerRef.id,
        },
      );

      res.status(201).json({
        message: 'Player added successfully',
        player: { id: playerRef.id, ...playerData },
      });
    } catch (firestoreError) {
      console.error('Error saving player data:', firestoreError);
      return res.status(500).json({
        error: 'Error saving player data',
        details: firestoreError.message,
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
