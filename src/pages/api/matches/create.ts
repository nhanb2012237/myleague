import { NextApiRequest, NextApiResponse } from 'next';
import { BracketsManager } from 'brackets-manager';
import { collection, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';
import { JsonDatabase } from 'brackets-json-db';
import { Match } from '../../../models/entities';

const storage = new JsonDatabase();
const manager = new BracketsManager(storage);

export interface PlayerScore {
  playerId: string; // ID của cầu thủ
  playerName: string; // Tên của cầu thủ
  goals: number; // Số bàn thắng
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log('Request method:', req.method); // Log the request method

  if (req.method === 'POST') {
    const { teams, tournamentId, userId } = req.body;
    console.log('Teamstaomatch:', teams);

    // Kiểm tra xem dữ liệu đầu vào có hợp lệ không
    if (!teams || !Array.isArray(teams) || teams.length < 2) {
      return res
        .status(400)
        .json({ error: 'Danh sách đội không hợp lệ hoặc bị thiếu' });
    }

    try {
      // Lọc và đảm bảo các tên đội không trùng lặp
      const uniqueTeamNames = [...new Set(teams.map((team) => team.teamName))];

      if (teams.length !== uniqueTeamNames.length) {
        return res
          .status(400)
          .json({ error: 'Danh sách đội có tên trùng lặp' });
      }

      // Tạo vòng đấu "Vòng bảng" với định dạng vòng tròn (round robin)
      const stage = await manager.create.stage({
        tournamentId: tournamentId, // Bạn cần liên kết với ID giải đấu thực
        name: 'Vòng bảng',
        type: 'round_robin',
        seeding: uniqueTeamNames,
        settings: { groupCount: 1 },
      });

      // Tạo danh sách các trận đấu dựa trên cấu trúc của Match
      const matches: Match[] = [];
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const match: Match = {
            matchId: '', // Firebase sẽ tạo ID tự động
            roundId: 1, // Cố định là 1 cho vòng bảng
            opponent1: {
              teamId: teams[i].id,
              teamName: teams[i].teamName,
              playerScores: [],
              teamLogo: teams[i].teamLogo,
            },
            opponent2: {
              teamId: teams[j].id,
              teamName: teams[j].teamName,
              teamLogo: teams[j].teamLogo,
              playerScores: [],
            },
            score: {
              team1Score: 0, // Khởi tạo tỷ số 0-0
              team2Score: 0,
            },
            status: 'pending', // Trạng thái ban đầu
            penalties: {
              team1: {
                yellowCards: 0,
                redCards: 0,
              },
              team2: {
                yellowCards: 0,
                redCards: 0,
              },
            },
          };

          // Remove undefined fields
          Object.keys(match).forEach((key) => {
            if (match[key] === undefined) {
              delete match[key];
            }
          });

          matches.push(match);
        }
      }

      // Lưu các trận đấu vào Firestore
      const matchesRef = collection(
        db,
        `users/${userId}/tournaments/${tournamentId}/matches`,
      );

      const matchDocs = await Promise.all(
        matches.map(async (match) => {
          const docRef = await addDoc(matchesRef, match);
          await updateDoc(docRef, { matchId: docRef.id });
          return { id: docRef.id, ...match, matchId: docRef.id };
        }),
      );

      res.status(200).json({
        message: 'Các trận đấu đã được tạo thành công',
        matches: matchDocs.map((doc, index) => ({
          id: doc.id,
          ...matches[index],
        })),
      });
    } catch (error) {
      console.error('Tạo trận đấu thất bại:', error);
      res.status(500).json({
        error: 'Tạo trận đấu thất bại',
        details: error.message,
      });
    }
  } else {
    console.log(`Received a ${req.method} request, which is not allowed.`);
    res.setHeader('Allow', ['POST']);
    res
      .status(405)
      .json({ error: `Phương thức ${req.method} không được phép` });
  }
}
