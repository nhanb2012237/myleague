// import { NextApiRequest, NextApiResponse } from 'next';
// import { BracketsManager } from 'brackets-manager';
// import { db } from '../../../config/firebaseconfig'; // Đảm bảo đường dẫn chính xác
// import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';

// // Khởi tạo JsonDatabase và BracketsManager với đối số
// import { JsonDatabase } from 'brackets-json-db';

// const storage = new JsonDatabase();
// const manager = new BracketsManager(storage);

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   if (req.method === 'POST') {
//     const { tournamentName, numberOfTeams } = req.body;

//     if (!tournamentName || typeof tournamentName !== 'string') {
//       return res
//         .status(400)
//         .json({ error: 'Tên giải đấu không hợp lệ hoặc bị thiếu' });
//     }

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
//       // Create temporary teams with additional attributes
//       const teams = Array.from({ length: numberOfTeams }, (_, i) => ({
//         id: i + 1,
//         name: `Team ${i + 1}`,
//         logo: `https://example.com/logo${i + 1}.png`,
//         phone: `000-000-000${i + 1}`,
//       }));

//       // Lưu thông tin các đội lên Firestore
//       const batch = writeBatch(db);
//       teams.forEach((team) => {
//         const teamRef = doc(collection(db, 'teams'));
//         batch.set(teamRef, team);
//       });
//       await batch.commit();

//       // Create stage for the tournament
//       const stage = await manager.create.stage({
//         tournamentId: 0,
//         name: 'Vòng bảng',
//         type: 'round_robin',
//         seeding: teams.map((team) => team.name),
//         settings: { groupCount: 1 },
//       });

//       // Create matches for the stage
//       const matches = [];
//       for (let i = 0; i < numberOfTeams; i++) {
//         for (let j = i + 1; j < numberOfTeams; j++) {
//           matches.push({
//             stage_id: stage.id,
//             round_id: 1,
//             group_id: 1,
//             opponent1: { id: teams[i].id, name: teams[i].name },
//             opponent2: { id: teams[j].id, name: teams[j].name },
//           });
//         }
//       }

//       // Lưu thông tin giải đấu lên Firestore
//       const docRef = await addDoc(collection(db, 'tournaments'), {
//         tournamentName,
//         numberOfTeams,
//         teams,
//         matches,
//         createdAt: new Date(),
//       });

//       res
//         .status(200)
//         .json({ message: 'Giải đấu đã được tạo thành công', id: docRef.id });
//     } catch (error) {
//       console.error('Tạo giải đấu thất bại:', error);
//       res.status(500).json({ error: 'Tạo giải đấu thất bại' });
//     }
//   } else {
//     res.setHeader('Allow', ['POST']);
//     res
//       .status(405)
//       .json({ error: `Phương thức ${req.method} không được phép` });
//   }
// }
import { NextApiRequest, NextApiResponse } from 'next';
import { BracketsManager } from 'brackets-manager';
import { db } from '../../../config/firebaseconfig'; // Đảm bảo đường dẫn chính xác
import {
  collection,
  addDoc,
  writeBatch,
  doc,
  getDocs,
} from 'firebase/firestore';

// Khởi tạo JsonDatabase và BracketsManager với đối số
import { JsonDatabase } from 'brackets-json-db';

const storage = new JsonDatabase();
const manager = new BracketsManager(storage);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const { tournamentName, numberOfTeams } = req.body;

    if (!tournamentName || typeof tournamentName !== 'string') {
      return res
        .status(400)
        .json({ error: 'Tên giải đấu không hợp lệ hoặc bị thiếu' });
    }

    if (
      !numberOfTeams ||
      typeof numberOfTeams !== 'number' ||
      numberOfTeams < 2
    ) {
      return res
        .status(400)
        .json({ error: 'Số đội không hợp lệ hoặc bị thiếu' });
    }

    try {
      // Tạo đội bóng tạm thời với các thuộc tính bổ sung
      const teams = Array.from({ length: numberOfTeams }, (_, i) => ({
        id: i + 1,
        name: `Team ${i + 1}`,
        logo: `https://example.com/logo${i + 1}.png`,
        phone: `000-000-000${i + 1}`,
      }));

      // Lưu thông tin các đội lên Firestore
      const batch = writeBatch(db);
      teams.forEach((team) => {
        const teamRef = doc(collection(db, 'teams'));
        batch.set(teamRef, team);
      });
      await batch.commit();

      // Lấy danh sách đội vừa được tạo từ Firestore
      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      const allTeams = teamsSnapshot.docs.map((doc) => doc.data());

      // Đảm bảo rằng tất cả các đội trong `allTeams` không bị trùng lặp
      const teamNames = allTeams.map((team) => team.name);
      const uniqueTeamNames = [...new Set(teamNames)];

      if (teamNames.length !== uniqueTeamNames.length) {
        return res
          .status(400)
          .json({ error: 'Danh sách đội có tên trùng lặp' });
      }

      // Tạo giai đoạn cho giải đấu
      const stage = await manager.create.stage({
        tournamentId: 0,
        name: 'Vòng bảng',
        type: 'round_robin',
        seeding: uniqueTeamNames,
        settings: { groupCount: 1 },
      });

      // Tạo các cặp đấu cho giai đoạn
      const matches = [];
      for (let i = 0; i < numberOfTeams; i++) {
        for (let j = i + 1; j < numberOfTeams; j++) {
          matches.push({
            stage_id: stage.id,
            round_id: 1,
            group_id: 1,
            opponent1: { id: teams[i].id, name: teams[i].name },
            opponent2: { id: teams[j].id, name: teams[j].name },
          });
        }
      }

      // Lưu thông tin giải đấu lên Firestore
      const docRef = await addDoc(collection(db, 'tournaments'), {
        tournamentName,
        numberOfTeams,
        teams,
        matches,
        createdAt: new Date(),
      });

      res
        .status(200)
        .json({
          message: 'Giải đấu đã được tạo thành công',
          id: docRef.id,
          matches,
        });
    } catch (error) {
      console.error('Tạo giải đấu thất bại:', error);
      res
        .status(500)
        .json({ error: 'Tạo giải đấu thất bại', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res
      .status(405)
      .json({ error: `Phương thức ${req.method} không được phép` });
  }
}
