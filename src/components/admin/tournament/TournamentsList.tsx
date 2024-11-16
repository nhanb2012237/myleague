'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Tournament } from '../../../models/entities';
import { Avatar, Typography } from '@material-tailwind/react';
import Loader from '../../Loader/Loader';

interface TopCreatorTableProps {
  userId: string | null;
  setLoading: (loading: boolean) => void;
  tournaments: Tournament[];
}

const TopCreatorTable: React.FC<TopCreatorTableProps> = ({
  userId,
  tournaments,
}) => {
  const [loadingTournamentId, setLoadingTournamentId] = useState<string | null>(
    null,
  );
  const router = useRouter();

  const handleClick = (tournamentId: string) => {
    setLoadingTournamentId(tournamentId);
    setTimeout(() => {
      setLoadingTournamentId(null);
      router.push(`/admin/tournament/${tournamentId}`);
    }, 15000);
  };

  return (
    <div>
      {tournaments.map((tournament) => {
        const numberOfTeams =
          tournament.numberOfTeams || 'Không có số lượng đội';
        const startDate = tournament.startDate?.seconds
          ? format(new Date(tournament.startDate.seconds * 1000), 'dd MMM yyyy')
          : 'Ngày không được cung cấp';
        const endDate = tournament.endDate?.seconds
          ? format(new Date(tournament.endDate.seconds * 1000), 'dd MMM yyyy')
          : 'Ngày không được cung cấp';
        const tournamentName =
          tournament.tournamentName || 'Không có tên giải đấu';

        const startDay = startDate
          ? format(startDate, 'dd')
          : 'Ngày không được cung cấp';
        const startMonth = startDate ? format(startDate, 'MMM') : '';
        const startYear = startDate ? format(startDate, 'yyyy') : '';

        const endDay = endDate
          ? format(endDate, 'dd')
          : 'Ngày không được cung cấp';
        const endMonth = endDate ? format(endDate, 'MM') : '';
        const endYear = endDate ? format(endDate, 'yyyy') : '';

        return (
          <div key={tournament.id} className="mt-5 h-full w-full">
            <div
              className="dark:bg-dark-light dark:border-dark-light relative rounded-lg border-2 border-white bg-white px-4 py-3 shadow-item transition duration-200 ease-in-out hover:border-brand-500 lg:col-span-6"
              onClick={() => handleClick(tournament.id)}
            >
              {loadingTournamentId === tournament.id && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
                  <Loader />
                </div>
              )}

              {/* Tournament Info */}
              <div
                className={`${
                  loadingTournamentId === tournament.id ? 'opacity-0' : ''
                }`}
              >
                <div className="hidden md:flex">
                  <Avatar
                    src={tournament.logoUrl}
                    alt="avatar"
                    variant="rounded"
                    className="items-center justify-center"
                  />
                  <div className="ml-5">
                    <div>
                      <Typography variant="h5">
                        Giải {tournamentName}
                      </Typography>
                    </div>
                    <div className=" mt-1 text-base font-bold text-gray-700 md:mt-1">
                      Diễn ra từ {startDay} - {endDay} tháng {endMonth} năm{' '}
                      {endYear}
                    </div>
                  </div>

                  {/* <Typography variant="paragraph">
                    {numberOfTeams} đội
                  </Typography> */}
                </div>

                {/* Mobile Styles */}
                <div className="flex flex-col items-stretch justify-center gap-6 md:hidden">
                  <Typography variant="h4">{tournamentName}</Typography>
                  <div className="flex items-center justify-between">
                    <p className="text-heading-s-variant">
                      <span className="text-blue-gray">#</span>
                      {tournament.id}
                    </p>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-body-variant text-gray-medium dark:text-gray-light pb-2">
                        {startDate}
                      </p>
                      <p className="text-heading-s">{numberOfTeams} đội</p>
                    </div>
                    <div className="w-[104px]">
                      {/* <Status status={tournament.status} /> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TopCreatorTable;
