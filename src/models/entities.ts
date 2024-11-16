import { Timestamp, serverTimestamp } from 'firebase/firestore';

export interface Tournament {
  id: string;
  tournamentName: string;
  location: string;
  logoUrl: string;
  numberOfTeams: number;
  numberPlayerofTeam: number;
  startDate: {
    seconds: number;
    nanoseconds: number;
  };
  endDate: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface Team {
  teamId: string;
  teamName: string;
  phone: string;
  email: string;
  address: string;
  teamLogo: string;
  coach: string; // URL của logo đội (có thể mặc định)
  players: Player[]; // Mảng chứa danh sách cầu thủ
  tournamentId: string; // ID của giải đấu mà team thuộc về
  createdAt?: Date; // Thời gian tạo team (tùy chọn)
  updatedAt?: Date; // Thời gian cập nhật team (tùy chọn)
}

export interface Player {
  playerId: string;
  displayName: string;
  playerName: string;
  jerseyNumber: number;
  dateOfBirth: Date | FirebaseTimestamp;
  teamId: string;
  email: string;
  phone: string;
  avatarUrl: string; // URL của ảnh đại diện của cầu thủ
  position: string; // Vị trí thi đấu của cầu thủ (ví dụ: tiền đạo, hậu vệ)
  goals?: number; // Số bàn thắng (tùy chọn)
  assists?: number; // Số đường kiến tạo (tùy chọn)
  appearances?: number;
  faceDescriptor?: number[]; // Đặc trưng khuôn mặt của cầu thủ
  timestamp: ReturnType<typeof serverTimestamp>; // Correctly define the timestamp property
}

interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface Match {
  matchId: string; // ID duy nhất của trận đấu
  // stageId: string; // ID của vòng đấu (stage)
  roundId: number; // ID của vòng đấu
  groupId?: number;
  teamLogo?: string; // URL của logo đội (có thể mặc định)
  opponent1: TeamInfo; // Thông tin về đội 1
  opponent2: TeamInfo; // Thông tin về đội 2
  score: Score; // Tỷ số trận đấu
  status: 'pending' | 'in_progress' | 'completed'; // Trạng thái trận đấu
  // startTime: Date; // Thời gian bắt đầu trận đấu
  // endTime?: Date; // Thời gian kết thúc trận đấu (tùy chọn)
  // location: string;
  penalties: Penalties;
}

export interface PlayerScore {
  playerId: string; // ID của cầu thủ
  playerName: string; // Tên của cầu thủ
  goals: number; // Số bàn thắng
}

export interface TeamInfo {
  teamId: string; // ID của đội
  teamName: string;
  teamLogo: string; // URL của logo đội
  playerScores?: PlayerScore[]; // Tên của đội
}

export interface Score {
  team1Score: number; // Số bàn thắng của đội 1
  team2Score: number; // Số bàn thắng của đội 2
}

export interface Penalties {
  team1: {
    yellowCards: number;
    redCards: number;
  };
  team2: {
    yellowCards: number;
    redCards: number;
  };
}

export interface TeamRanking {
  teamId: string;
  tournamentId: string;
  teamName: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface InformationFormValues {
  playerId: string;
  playerName: string;
  displayName: string;
  email: string;
  phone: string;
  position: string;
  jerseyNumber: string;
  dateOfBirth: Timestamp;
}
