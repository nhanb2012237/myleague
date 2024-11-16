import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../config/firebaseconfig'; // Update the correct path
import { collection, writeBatch, doc } from 'firebase/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const { numberOfTeams } = req.body;

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
      // Create temporary teams with additional attributes
      const teams = Array.from({ length: numberOfTeams }, (_, i) => ({
        id: i + 1,
        name: `Team ${i + 1}`,
        logo: `https://example.com/logo${i + 1}.png`,
        phone: `000-000-000${i + 1}`,
      }));

      // Write teams to Firestore in a batch
      const batch = writeBatch(db);
      teams.forEach((team) => {
        const teamRef = doc(collection(db, 'teams'));
        batch.set(teamRef, team);
      });
      await batch.commit();

      res.status(200).json({ teams });
    } catch (error) {
      console.error('Tạo đội thất bại:', error);
      res.status(500).json({ error: 'Tạo đội thất bại' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res
      .status(405)
      .json({ error: `Phương thức ${req.method} không được phép` });
  }
}
