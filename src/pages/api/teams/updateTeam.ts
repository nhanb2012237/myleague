// import { NextApiRequest, NextApiResponse } from 'next';
// import { doc, updateDoc, getDoc } from 'firebase/firestore';
// import { db } from '../../../../config/firebaseconfig';

// export default async function updateTeamHandler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ): Promise<void> {
//   if (req.method !== 'PUT') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const {
//       tournamentId,
//       userId,
//       teamId,
//       name,
//       coach,
//       players,
//       teamLogo,
//       address,
//     } = req.body;

//     if (!tournamentId || !userId || !teamId) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Tham chiếu đến team trong Firestore
//     const teamRef = doc(
//       db,
//       `users/${userId}/tournaments/${tournamentId}/teams/${teamId}`,
//     );

//     // Lấy dữ liệu hiện tại của team
//     const teamDoc = await getDoc(teamRef);

//     if (!teamDoc.exists()) {
//       return res.status(404).json({ error: 'Team not found' });
//     }

//     // Lấy dữ liệu cũ từ Firestore
//     const existingTeamData = teamDoc.data();

//     // Tạo object mới với dữ liệu cần cập nhật
//     const updatedData = {
//       teamName: name || existingTeamData.name, // Nếu name không có trong request thì giữ nguyên
//       coach: coach || existingTeamData.coach, // Giữ nguyên coach nếu không có trong request
//       players: players || existingTeamData.players, // Giữ nguyên players nếu không có
//       teamLogo: teamLogo || existingTeamData.teamLogo, // Giữ nguyên teamLogo nếu không có
//       address: address || existingTeamData.address, // Giữ nguyên address nếu không
//     };

//     // Cập nhật thông tin team trong Firestore
//     await updateDoc(teamRef, updatedData);

//     res.status(200).json({
//       message: 'Team information updated successfully',
//       updatedData,
//     });
//   } catch (error) {
//     console.error('Error updating team:', error);
//     res
//       .status(500)
//       .json({ error: 'Error updating team', details: error.message });
//   }
// }
import { NextApiRequest, NextApiResponse } from 'next';
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';

export default async function updateTeamHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      tournamentId,
      userId,
      teamId,
      name,
      coach,
      players,
      teamLogo,
      address,
      email,
    } = req.body;

    if (!tournamentId || !userId || !teamId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Tham chiếu đến team trong Firestore
    const teamRef = doc(
      db,
      `users/${userId}/tournaments/${tournamentId}/teams/${teamId}`,
    );

    // Lấy dữ liệu hiện tại của team
    const teamDoc = await getDoc(teamRef);

    if (!teamDoc.exists()) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Lấy dữ liệu cũ từ Firestore
    const existingTeamData = teamDoc.data();

    // Tạo object mới với dữ liệu cần cập nhật
    const updatedData = {
      teamName: name || existingTeamData.teamName, // Nếu name không có trong request thì giữ nguyên
      coach: coach || existingTeamData.coach, // Giữ nguyên coach nếu không có trong request
      players: players || existingTeamData.players, // Giữ nguyên players nếu không có
      teamLogo: teamLogo || existingTeamData.teamLogo, // Giữ nguyên teamLogo nếu không có
      address: address || existingTeamData.address,
      email: email || existingTeamData.email,
    };

    // Cập nhật thông tin team trong Firestore
    await updateDoc(teamRef, updatedData);

    // Lấy danh sách các trận đấu có tham gia đội bóng này
    const matchesRef = collection(
      db,
      `users/${userId}/tournaments/${tournamentId}/matches`,
    );

    const opponent1Query = query(
      matchesRef,
      where('opponent1.teamId', '==', teamId),
    );
    const opponent2Query = query(
      matchesRef,
      where('opponent2.teamId', '==', teamId),
    );

    // Lấy các trận đấu có teamId là opponent1
    const opponent1Snapshot = await getDocs(opponent1Query);
    const opponent2Snapshot = await getDocs(opponent2Query);

    const batchUpdates: Promise<void>[] = [];

    // Duyệt qua tất cả các trận đấu có opponent1 là teamId và cập nhật thông tin
    opponent1Snapshot.forEach((matchDoc) => {
      batchUpdates.push(
        updateDoc(doc(db, matchDoc.ref.path), {
          'opponent1.teamName': updatedData.teamName,
          'opponent1.players': updatedData.players,
          'opponent1.teamLogo': updatedData.teamLogo,
        }),
      );
    });

    // Duyệt qua tất cả các trận đấu có opponent2 là teamId và cập nhật thông tin
    opponent2Snapshot.forEach((matchDoc) => {
      batchUpdates.push(
        updateDoc(doc(db, matchDoc.ref.path), {
          'opponent2.teamName': updatedData.teamName,
          'opponent2.players': updatedData.players,
          'opponent2.teamLogo': updatedData.teamLogo,
        }),
      );
    });

    // Thực hiện tất cả các cập nhật đồng loạt
    await Promise.all(batchUpdates);

    res.status(200).json({
      message: 'Team information and related matches updated successfully',
      updatedData,
    });
  } catch (error) {
    console.error('Error updating team and matches:', error);
    res.status(500).json({
      error: 'Error updating team and matches',
      details: error.message,
    });
  }
}
