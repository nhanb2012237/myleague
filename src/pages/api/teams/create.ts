// import { NextApiRequest, NextApiResponse } from 'next';
// import { collection, writeBatch, doc } from 'firebase/firestore';
// import { db } from '../../../../config/firebaseconfig';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { storage } from '../../../../config/firebaseconfig';
// import fs from 'fs';
// import path from 'path';

// // Hàm để tải ảnh lên Firebase Storage
// const uploadImage = async (filePath) => {
//   const fileBuffer = fs.readFileSync(filePath);
//   const storageRef = ref(storage, 'default-team-logo.png');
//   await uploadBytes(storageRef, fileBuffer);
//   const url = await getDownloadURL(storageRef);
//   return url;
// };

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   if (req.method === 'POST') {
//     const { numberOfTeams, tournamentId } = req.body;

//     if (
//       !numberOfTeams ||
//       typeof numberOfTeams !== 'number' ||
//       numberOfTeams < 2
//     ) {
//       return res
//         .status(400)
//         .json({ error: 'Số đội không hợp lệ hoặc bị thiếu' });
//     }

//     try {
//       // Đường dẫn đến ảnh mặc định trên máy của bạn
//       const defaultLogoPath = path.join(
//         process.cwd(),
//         'public',
//         'img',
//         'teams',
//         'default-team-logo.png',
//       );

//       // Tải ảnh lên Firebase Storage và lấy URL
//       const defaultLogoUrl = await uploadImage(defaultLogoPath);

//       // Tạo các đội với URL ảnh mặc định
//       const batch = writeBatch(db);
//       const teamDocs = [];

//       Array.from({ length: numberOfTeams }, (_, i) => {
//         const teamRef = doc(collection(db, 'teams'));
//         const teamData = {
//           name: `Team ${i + 1}`,
//           logo: defaultLogoUrl, // Sử dụng URL của ảnh mặc định
//           phone: `000-000-000${i + 1}`,
//           tournamentId,
//         };
//         batch.set(teamRef, teamData);
//         teamDocs.push({ ref: teamRef, ...teamData }); // Lưu trữ thông tin tài liệu bao gồm ID
//       });

//       await batch.commit();

//       // Trả về các đội cùng với ID đã được tạo
//       const teamsWithId = teamDocs.map(({ ref, ...rest }) => ({
//         id: ref.id,
//         ...rest,
//       }));

//       res.status(200).json({
//         message: 'Các đội đã được tạo thành công',
//         teams: teamsWithId,
//       });
//     } catch (error) {
//       console.error('Tạo đội thất bại:', error);
//       res
//         .status(500)
//         .json({ error: 'Tạo đội thất bại', details: error.message });
//     }
//   } else {
//     res.setHeader('Allow', ['POST']);
//     res
//       .status(405)
//       .json({ error: `Phương thức ${req.method} không được phép` });
//   }
// }
import { NextApiRequest, NextApiResponse } from 'next';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../config/firebaseconfig';
import fs from 'fs';
import path from 'path';

// Hàm để tải ảnh lên Firebase Storage
const uploadImage = async (filePath: string): Promise<string> => {
  const fileBuffer = fs.readFileSync(filePath);
  const storageRef = ref(storage, 'default-team-logo.png');
  await uploadBytes(storageRef, fileBuffer);
  const url = await getDownloadURL(storageRef);
  return url;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const { numberOfTeams, tournamentId, userId } = req.body;

    if (
      !numberOfTeams ||
      typeof numberOfTeams !== 'number' ||
      numberOfTeams < 2 ||
      !tournamentId ||
      !userId
    ) {
      return res.status(400).json({
        error: 'Số đội, tournamentId hoặc userId không hợp lệ hoặc bị thiếu',
      });
    }

    try {
      // Đường dẫn đến ảnh mặc định trên máy của bạn
      const defaultLogoPath = path.join(
        process.cwd(),
        'public',
        'img',
        'teams',
        'default-team-logo.png',
      );

      // Tải ảnh lên Firebase Storage và lấy URL
      const defaultLogoUrl = await uploadImage(defaultLogoPath);

      // Tạo các đội với URL ảnh mặc định
      const batch = writeBatch(db);
      const teamDocs = [];

      Array.from({ length: numberOfTeams }, (_, i) => {
        const teamRef = doc(
          collection(db, `users/${userId}/tournaments/${tournamentId}/teams`),
        );
        const teamData = {
          teamId: teamRef.id,
          teamName: `Team ${i + 1}`,
          teamLogo: defaultLogoUrl, // Sử dụng URL của ảnh mặc định
          phone: `000-000-000${i + 1}`,
          tournamentId,
          userId,
          address: '',
          coach: '',
          players: [],
        };
        batch.set(teamRef, teamData);
        teamDocs.push({ ref: teamRef, ...teamData }); // Lưu trữ thông tin tài liệu bao gồm ID
      });

      await batch.commit();

      // Trả về các đội cùng với ID đã được tạo
      const teamsWithId = teamDocs.map(({ ref, ...rest }) => ({
        id: ref.id,
        ...rest,
      }));

      res.status(200).json({
        message: 'Các đội đã được tạo thành công',
        teams: teamsWithId,
      });
    } catch (error) {
      console.error('Tạo đội thất bại:', error);
      res
        .status(500)
        .json({ error: 'Tạo đội thất bại', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res
      .status(405)
      .json({ error: `Phương thức ${req.method} không được phép` });
  }
}
