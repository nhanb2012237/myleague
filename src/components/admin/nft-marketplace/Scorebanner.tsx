import Image from 'next/image';
import Button from 'components/Button/Button';
import { useState } from 'react';
import nft1 from '/public/img/nfts/NftBanner1.png';
import ScoreDialog from './ScoreDialog';
import { Match } from 'models/entities';
import { TeamInfo } from 'models/entities';

interface BannerProps {
  match: Match;
  // Replace MatchType with the actual type of match
  userId: string; // or number, depending on your data type
  tournamentId: string; // or number, depending on your data type
}

const Scorebanner: React.FC<BannerProps> = ({
  match,
  userId,
  tournamentId,
}) => {
  const [open, setOpen] = useState(false);

  const handleOpenDialog = () => {
    setOpen(true); // Mở dialog
  };

  const handleCloseDialog = () => {
    setOpen(false); // Đóng dialog
  };

  return (
    <div
      className="flex w-full flex-col rounded-[20px] bg-cover px-[30px] py-[30px] md:px-[64px] md:py-[56px]"
      style={{ backgroundImage: `url(${nft1.src})` }}
    >
      <div className="w-full">
        <div className="">
          <div className="flex justify-between">
            {/* Home Team */}
            <div className="flex flex-col items-center p-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md">
                <Image
                  src={match.opponent1.teamLogo}
                  alt={`${match.opponent1.teamName} Logo`}
                  className="h-full w-full rounded-full"
                  width={48}
                  height={48}
                />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-white">
                {match.opponent1.teamName}
              </h2>
            </div>

            {/* Match Details */}
            <div className="flex flex-col items-center justify-center p-5 text-center">
              <h1 className="mb-2 text-lg text-white">
                {/* {match.date} at <strong>{match.time}</strong> */}
              </h1>
              <div className="flex items-center gap-3 text-4xl font-semibold text-white">
                <h1>{match.score.team1Score}</h1>

                <span className="mx-2">:</span>

                <h1>{match.score.team2Score}</h1>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center p-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md">
                <Image
                  src={match.opponent2.teamLogo}
                  alt={`${match.opponent2.teamName} Logo`}
                  className="h-full w-full rounded-full"
                  width={48}
                  height={48}
                />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-white">
                {match.opponent2.teamName}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scorebanner;
