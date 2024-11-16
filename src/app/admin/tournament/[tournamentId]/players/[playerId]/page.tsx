'use client';
import Banner from 'components/admin/players/Banner';
import { use } from 'react';
// import General from 'components/admin/profile/General';
// import Notification from 'comp  onents/admin/profile/Notification';
// import Project from 'components/admin/profile/Project';
// import Storage from 'components/admin/profile/Storage';
// import Upload from 'components/admin/profile/Upload';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Player } from 'models/entities';
import Information from 'components/admin/players/Information';
import Spinner from 'components/Loader/Spinner';
import ImageCropProvider from 'providers/ImageCropProvider';
import PlayerAvatarUploadAndCrop from 'components/admin/players/PlayerAvatarUploadAndCrop';

const PlayerProfile = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { tournamentId, playerId } = useParams();
  console.log('tournamentId', tournamentId);
  console.log('playerId', playerId);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchPlayers(user.uid, tournamentId.toString(), playerId.toString());
        setLoading(false);
      } else {
        console.log('User not logged in');
      }
    });

    // Trả về hàm unsubscribe để hủy đăng ký khi component bị unmount
    return () => unsubscribe();
  }, [tournamentId, playerId]);

  const fetchPlayers = async (
    userId: string,
    tournamentId: string,
    playerId: string,
  ) => {
    try {
      const response = await axios.get(`/api/players/getPlayers`, {
        params: { userId, tournamentId },
      });
      console.log('Danh sách cầu thủ:', response.data.players);
      setPlayers(response.data.players);

      // Tìm cầu thủ có playerId trùng với playerId trong params
      const player = response.data.players.find((p) => p.playerId === playerId);
      setSelectedPlayer(player);
      console.log('Selected player:', player);
    } catch (error) {
      console.error('Lỗi khi tải danh sách cầu thủ:', error);
    }
  };

  if (loading && !selectedPlayer) return <Spinner />;
  // console.log('userId', userId);
  // console.log('tournamentId', tournamentId);

  return (
    <div className="flex w-full flex-col gap-5 lg:gap-5">
      <div className="w-ful mt-3 flex h-fit flex-col gap-5 lg:grid lg:grid-cols-12">
        <div className="col-span-4 lg:!mb-0">
          {/* {selectedPlayer && <Banner player={selectedPlayer} />} */}
          <div className="col-span-4 lg:!mb-0">
            {selectedPlayer && (
              <ImageCropProvider>
                <PlayerAvatarUploadAndCrop
                  teamId={selectedPlayer.teamId as string}
                  playerId={playerId as string}
                  userId={userId as string}
                  tournamentId={tournamentId as string}
                  avatarUrl={selectedPlayer?.avatarUrl}
                  player={selectedPlayer}
                />
              </ImageCropProvider>
            )}
          </div>
        </div>

        <div className="col-span-8 lg:!mb-0">
          {selectedPlayer && (
            <Information
              player={selectedPlayer}
              userId={userId}
              tournamentId={tournamentId as string}
              playerId={playerId as string}
              teamId={selectedPlayer.teamId}
            />
          )}
        </div>
      </div>
      {/* all project & ... */}

      <div className="mb-4 grid h-full grid-cols-1 gap-5 lg:!grid-cols-12">
        {/* <div className="col-span-5 lg:col-span-6 lg:mb-0 3xl:col-span-4">
          <Project />
        </div>
        <div className="col-span-5 lg:col-span-6 lg:mb-0 3xl:col-span-5">
          <General />
        </div>

        <div className="col-span-5 lg:col-span-12 lg:mb-0 3xl:!col-span-3">
          <Notification />
        </div> */}
      </div>
    </div>
  );
};

export default PlayerProfile;
