'use client';
import Information from 'components/admin/team/Information';
import TeamDetail from 'components/admin/team/TeamDetail';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ImageCropProvider from 'providers/ImageCropProvider';
import axios from 'axios';
import { Team } from 'models/entities';
import AvatarUploadAndCrop from 'components/admin/team/AvatarUploadAndCrop';
import Spinner from '../../../../../../components/Loader/Spinner';

const ProfileOverview = ({ params }) => {
  const { tournamentId, teamId } = useParams();
  console.log('tournamentIdchitietteam', tournamentId);
  const [userId, setUserId] = useState<string | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        // console.log('User logged in1:', user.uid);
      } else {
        // Handle user not logged in
        // router.push('/auth/sign-in');
        console.log('User not logged in');
      }
    });
  }, []);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        if (teamId && userId && tournamentId) {
          console.log('teamIdgetteam:', teamId);
          const response = await axios.get(`/api/teams/${teamId}`, {
            params: { teamId, userId, tournamentId },
          });
          // console.log('Dữ liệu trả về từ API:', response.data);
          setTeam(response.data.team);
        }
      } catch (error) {
        console.error('Failed to fetch team details:', error);
      } finally {
        setLoading(false); // Set loading to false when data is fetched
      }
    };

    fetchTeam();
  }, [teamId, userId, tournamentId]);

  if (loading || !userId || !team) {
    return <Spinner />;
  }

  return (
    <>
      <div className="flex w-full flex-col gap-5 lg:gap-5">
        <div className="w-ful mt-3 flex h-fit flex-col gap-5 lg:grid lg:grid-cols-12">
          <div className="col-span-4 lg:!mb-0">
            <ImageCropProvider>
              <AvatarUploadAndCrop
                teamId={teamId as string}
                userId={userId as string}
                tournamentId={tournamentId as string}
                teamLogo={team?.teamLogo}
                teamName={team?.teamName}
              />
            </ImageCropProvider>
          </div>

          <div className="z-0 col-span-8 lg:!mb-0">
            <Information
              teamId={teamId as string}
              userId={userId as string}
              tournamentId={tournamentId as string}
            />
          </div>
        </div>

        <div className="mb-4 grid h-full grid-cols-1 gap-5 lg:!grid-cols-10">
          <div className="col-span-10 lg:col-span-10 lg:mb-0 3xl:col-span-5">
            <TeamDetail
              teamId={teamId as string}
              userId={userId as string}
              tournamentId={tournamentId as string}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileOverview;
