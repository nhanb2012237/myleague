import React, { useState } from 'react';
import { Player } from '../../../models/entities';
import { Match } from '../../../models/entities';
import { serverTimestamp } from 'firebase/firestore';
import { TeamInfo } from '../../../models/entities';
import axios from 'axios';
import { Select, Option } from '@material-tailwind/react';
import Image from 'next/image';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import banner from '/public/img/profile/banner.png';
import Button from 'components/Button/Button';
import { TbCards } from 'react-icons/tb';
import ConfirmSavingModal from '../../../components/Modal/ConfirmSavingModal';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from '@material-tailwind/react';
import { FaFutbol, FaRegFutbol, FaExclamationTriangle } from 'react-icons/fa';
import ScoreComponent from './ScoreComponent';
import YellowCardComponent from './YellowCardComponent';
import RedCardComponent from './RedCardComponent';

interface GoalScorer {
  team: number; // 1 for team1, 2 for team2
  player: Player;
}

interface PlayerScore {
  playerId: string; // ID của cầu thủ
  playerName: string; // Tên của cầu thủ
  goals: number; // Số bàn thắng
}

interface ScoreDialogProps {
  open: boolean;
  onClose: () => void;
  team1: TeamInfo;
  team2: TeamInfo;
  userId: string;
  tournamentId: string;
  logo1: string;
  logo2: string;
  matchId: string;
  match: Match;
  onReload?: () => void;
}

const ScoreDialog: React.FC<ScoreDialogProps> = ({
  open,
  onClose,
  team1,
  team2,
  userId,
  tournamentId,
  onReload,
  logo1,
  logo2,
  matchId,
  match,
}) => {
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
      const combinedYellowCardScorers = [...yellowCardScorers];
      const combinedRedCardScorers = [...redCardScorers];

      // Save match information
      await axios.post('/api/matches/saveMatch', {
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
        })),
        yellowCards: combinedYellowCardScorers.map((scorer) => ({
          playerId: scorer.player.playerId,
          playerName: scorer.player.playerName,
          teamId: scorer.team === 1 ? team1.teamId : team2.teamId,
        })),
        redCards: combinedRedCardScorers.map((scorer) => ({
          playerId: scorer.player.playerId,
          playerName: scorer.player.playerName,
          teamId: scorer.team === 1 ? team1.teamId : team2.teamId,
        })),
        status: 'completed',
        team1Id: team1.teamId,
        team2Id: team2.teamId,
      });

      console.log('Cập nhật trận đấu thành công');
      onReload && onReload();
      onClose();
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
        <ScoreComponent
          team1={team1}
          team2={team2}
          userId={userId}
          tournamentId={tournamentId}
          matchId={matchId}
          match={match}
          onReload={onReload}
          setGoalScorers={setGoalScorers}
          setTeam1Score={setTeam1Score}
          setTeam2Score={setTeam2Score}
        />
      ),
    },
    {
      label: 'Thẻ vàng',
      value: 'yellowCards',
      icon: TbCards,
      component: (
        <YellowCardComponent
          team1={team1}
          team2={team2}
          userId={userId}
          tournamentId={tournamentId}
          matchId={matchId}
          match={match}
          onReload={onReload}
          setYellowCardScorers={setYellowCardScorers}
        />
      ),
    },
    {
      label: 'Thẻ đỏ',
      value: 'redCards',
      icon: TbCards,
      component: (
        <RedCardComponent
          team1={team1}
          team2={team2}
          userId={userId}
          tournamentId={tournamentId}
          matchId={matchId}
          match={match}
          onReload={onReload}
          setRedCardScorers={setRedCardScorers}
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
                    <TextField
                      className=" !w-20 appearance-none rounded-lg !border-t-blue-gray-200 bg-white text-center !text-lg placeholder:text-blue-gray-300 placeholder:opacity-100 focus:!border-t-gray-900"
                      InputLabelProps={{
                        className: 'before:content-none after:content-none',
                      }}
                      InputProps={{
                        className: '!min-w-0 !w-15 !shrink-0',
                      }}
                      value={team1Score}
                      onChange={(e) =>
                        setTeam1Score(parseInt(e.target.value, 10))
                      }
                      type="number"
                      variant="outlined"
                      margin="normal"
                      disabled={match.status === 'completed'}
                    />
                    <span className="text-slate-700 text-2xl">-</span>
                    <TextField
                      className="!w-20 appearance-none rounded-lg !border-t-blue-gray-200 bg-white text-center !text-lg placeholder:text-blue-gray-300 placeholder:opacity-100 focus:!border-t-gray-900"
                      InputLabelProps={{
                        className: 'before:content-none after:content-none',
                      }}
                      InputProps={{
                        className: '!min-w-0 !w-15 !shrink-0',
                      }}
                      value={team2Score}
                      onChange={(e) =>
                        setTeam2Score(parseInt(e.target.value, 10))
                      }
                      type="number"
                      variant="outlined"
                      margin="normal"
                      disabled={match.status === 'completed'}
                    />
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
          className="mt-5"
          value={activeTab}
          onChange={(value) => setActiveTab(value)}
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
        {/* <Button className="bg-navy-700 text-white" onClick={onClose}>
          Đóng
        </Button> */}
        <ConfirmSavingModal
          handleConfirm={() => handleSaveMatch()}
          id={matchId as string}
        />
        {/* <Button className="bg-navy-700 text-white" onClick={handleSaveMatch}>
          Cập nhật
        </Button> */}
      </DialogActions>
    </Dialog>
  );
};

export default ScoreDialog;
