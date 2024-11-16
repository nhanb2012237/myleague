// trang này dùng để lấy dữ liệu từ firestore và trả về cho client lấy dữ liệu của các đội bóng dựa trên collection 'teams' từ firestore
import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebaseconfig'; // Đảm bảo đường dẫn chính xác

interface Team {
  id: string; // ID của Firestore là chuỗi
  name: string;
  logo: string;
  coach: string;
  fans: string[];
  value: string | number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    try {
      const querySnapshot = await getDocs(collection(db, 'teams'));
      const teams: Team[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Team, 'id'>), // Chuyển đổi dữ liệu từ Firestore
      }));

      res.status(200).json({ teams });
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      res.status(500).json({ error: 'Failed to fetch teams' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
