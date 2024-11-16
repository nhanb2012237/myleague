import React, { useState } from 'react';
import { Player } from '../../../models/entities';
import { Match } from '../../../models/entities';
import { TeamInfo } from '../../../models/entities';
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from '@material-tailwind/react';
import { FaFutbol, FaRegFutbol, FaExclamationTriangle } from 'react-icons/fa';
import UpdateScore from './UpdateScore';
import UpdateYellowCard from './UpdateYellowCard';
import UpdateRedCard from './UpdateRedCard';
import Button from '../../../components/Button/Button';
import ConfirmSavingModal from '../../../components/Modal/ConfirmSavingModal';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import banner from '/public/img/profile/banner.png';
import axios from 'axios';

interface GoalScorer {
  team: number; // 1 cho đội 1, 2 cho đội 2
  player: Player;
}

interface PlayerScore {
  playerId: string; // ID của cầu thủ
  playerName: string; // Tên của cầu thủ
  goals: number; // Số bàn thắng
}

interface CompletedMatchProps {
  team1: TeamInfo;
  team2: TeamInfo;
  userId: string;
  tournamentId: string;
  logo1: string;
  logo2: string;
  matchId: string;
  match: Match;
  onReload?: () => void;
  open: boolean;
  onClose: () => void;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const CompletedMatch: React.FC<CompletedMatchProps> = ({
  team1,
  team2,
  userId,
  tournamentId,
  onReload,
  logo1,
  logo2,
  matchId,
  match,
  open,
  onClose,
  isEditing,
  setIsEditing,
}) => {
  console.log('match', match);
  const [activeTab, setActiveTab] = useState<string>('goals');
  const [goalScorers, setGoalScorers] = useState<GoalScorer[]>([]);
  const [yellowCardScorers, setYellowCardScorers] = useState<GoalScorer[]>([]);
  const [redCardScorers, setRedCardScorers] = useState<GoalScorer[]>([]);
  const [team1Score, setTeam1Score] = useState<number>(match.score.team1Score);
  const [team2Score, setTeam2Score] = useState<number>(match.score.team2Score);

  const handleSaveMatch = async () => {
    try {
      // Combine all scorers
      const combinedGoalScorers = [...goalScorers];
      console.log('combinedGoalScorers', combinedGoalScorers);
      const combinedYellowCardScorers = [...yellowCardScorers];
      const combinedRedCardScorers = [...redCardScorers];

      // Save match information
      await axios.put('/api/matches/updateMatch', {
        matchId,
        userId,
        tournamentId,
        team1Score,
        team2Score,
        goalScorers: combinedGoalScorers.map((scorer) => ({
          team: scorer.team,
          playerId: scorer.player.playerId,
          playerName: scorer.player.playerName,
          teamId: scorer.team === 1 ? team1.teamId : team2.teamId,
          goals: scorer.player.goals,
          goalId: `${matchId}-${scorer.player.playerId}`, // Unique ID for each goal
        })),
        yellowCards: combinedYellowCardScorers.map((scorer) => ({
          matchId: matchId,
          playerId: scorer.player.playerId,
          playerName: scorer.player.playerName,
          teamId: scorer.team === 1 ? team1.teamId : team2.teamId,
          type: 'yellow',
          // Unique ID for each yellow card
        })),
        redCards: combinedRedCardScorers.map((scorer) => ({
          matchId: matchId,
          playerId: scorer.player.playerId,
          playerName: scorer.player.playerName,
          teamId: scorer.team === 1 ? team1.teamId : team2.teamId,
          type: 'red',
          // Unique ID for each red card
        })),
        status: 'completed',
        team1Id: team1.teamId,
        team2Id: team2.teamId,
      });

      console.log('Cập nhật trận đấu thành công');
      onReload && onReload();
      onClose();
      setIsEditing(false); // Reset editing state
    } catch (error) {
      console.error('Cập nhật trận đấu thất bại:', error);
    }
  };

  const data = [
    {
      label: 'Bàn thắng',
      value: 'goals',
      icon: FaFutbol,
      component: (
        <UpdateScore
          team1={team1}
          team2={team2}
          userId={userId}
          tournamentId={tournamentId}
          matchId={matchId}
          match={match}
          onReload={onReload}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          setGoalScorers={setGoalScorers}
          setTeam1Score={setTeam1Score}
          setTeam2Score={setTeam2Score}
        />
      ),
    },
    {
      label: 'Thẻ vàng',
      value: 'yellowCards',
      icon: FaRegFutbol,
      component: (
        <UpdateYellowCard
          team1={team1}
          team2={team2}
          userId={userId}
          tournamentId={tournamentId}
          matchId={matchId}
          match={match}
          onReload={onReload}
          setYellowCardScorers={setYellowCardScorers}
          isEditing={isEditing}
        />
      ),
    },
    {
      label: 'Thẻ đỏ',
      value: 'redCards',
      icon: FaExclamationTriangle,
      component: (
        <UpdateRedCard
          team1={team1}
          team2={team2}
          userId={userId}
          tournamentId={tournamentId}
          matchId={matchId}
          match={match}
          onReload={onReload}
          setRedCardScorers={setRedCardScorers}
          isEditing={isEditing}
        />
      ),
    },
  ];

  return (
    <Dialog
      fullWidth={true}
      maxWidth="sm"
      open={open}
      onClose={onClose}
      className="flex w-full flex-col rounded-[20px] bg-cover px-[30px] py-[30px] md:px-[64px] md:py-[56px]"
    >
      <DialogTitle>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div
          className="flex w-full flex-col rounded-[20px] bg-cover px-[30px] py-[30px] md:px-[64px] md:py-[56px]"
          style={{ backgroundImage: `url(${banner.src})` }}
        >
          <div className="w-full">
            <div className="">
              <div className="flex items-center justify-center">
                {/* Home Team */}
                <div className="flex flex-col items-center p-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md">
                    <Image
                      src={logo1}
                      alt={`${logo1} Logo`}
                      className="h-full w-full rounded-full"
                      width={48}
                      height={48}
                    />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-white">
                    {team1.teamName}
                  </h2>
                </div>

                {/* ti so */}
                <div className="-mt-6 flex items-center gap-3 text-4xl font-semibold text-white">
                  <div className="my-3 flex items-center justify-center gap-2">
                    <span className="text-slate-700 text-2xl">
                      {match.score.team1Score}
                    </span>
                    <span className="text-slate-700 text-2xl">-</span>
                    <span className="text-slate-700 text-2xl">
                      {match.score.team2Score}
                    </span>
                  </div>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center p-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md">
                    <Image
                      src={logo2}
                      alt={`${logo2} Logo`}
                      className="h-full w-full rounded-full"
                      width={48}
                      height={48}
                    />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-white">
                    {team2.teamName}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value)}
          className="mt-5"
        >
          <TabsHeader>
            {data.map(({ label, value, icon }) => (
              <Tab key={value} value={value}>
                <div className="flex items-center gap-2">
                  {React.createElement(icon, { className: 'w-5 h-5' })}
                  {label}
                </div>
              </Tab>
            ))}
          </TabsHeader>
          <TabsBody>
            {data.map(({ value, component }) => (
              <TabPanel key={value} value={value}>
                {component}
              </TabPanel>
            ))}
          </TabsBody>
        </Tabs>
      </DialogContent>
      <DialogActions>
        <div className=" mb-5 ml-2 mr-3 mt-5 flex w-full gap-5">
          {/* <Button
            onClick={onClose}
            className="bg-navy-700 text-white hover:text-navy-700"
          >
            Đóng
          </Button> */}
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="!w-full bg-navy-700 text-white hover:text-navy-700"
            >
              Cập nhật
            </Button>
          )}
          {isEditing && (
            // <Button onClick={handleSaveMatch}>Lưu</Button>

            <ConfirmSavingModal
              handleConfirm={() => handleSaveMatch()}
              id={matchId}
            />
          )}
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default CompletedMatch;
