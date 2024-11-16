import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../../config/firebaseconfig';
import { doc, updateDoc } from 'firebase/firestore';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function updateLogoHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Sử dụng Promise để xử lý dữ liệu form
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

    // Lấy thông tin từ form
    const { tournamentId, userId, teamId } = data.fields;
    const logoFile = data.files.logo?.[0];

    if (!tournamentId || !userId) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    let teamLogo = '';

    if (logoFile && logoFile.filepath) {
      try {
        // Tạo tham chiếu tới Firebase Storage để upload logo
        const storageRef = ref(
          storage,
          `teams/-${Date.now()}-${logoFile.originalFilename}`,
        );
        const fileBuffer = fs.readFileSync(logoFile.filepath);
        const snapshot = await uploadBytes(storageRef, fileBuffer);
        teamLogo = await getDownloadURL(snapshot.ref);

        // Xóa file tạm sau khi upload
        fs.unlinkSync(logoFile.filepath);
      } catch (uploadError) {
        console.error('Lỗi upload logo:', uploadError);
        return res.status(500).json({
          error: 'Lỗi upload logo',
          details: uploadError.message,
        });
      }
    }

    // Cập nhật logo của giải đấu trong Firestore
    const tournamentRef = doc(
      db,
      `users/${userId}/tournaments/${tournamentId}/teams/${teamId}`,
    );
    await updateDoc(tournamentRef, { teamLogo });

    res.status(200).json({
      message: 'Logo của giải đấu đã được cập nhật thành công',
      teamLogo,
    });
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(500).json({ error: error.message });
  }
}
