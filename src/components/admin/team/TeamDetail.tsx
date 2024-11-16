import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { RiUserAddLine } from 'react-icons/ri';
import Card from 'components/card';
import AddPlayerDialog from 'components/admin/team/addplayer';
import { toast } from 'sonner';
import { Team } from '../../../models/entities'; // Đảm bảo đường dẫn đúng
import { auth } from '../../../../config/firebaseconfig';
import axios from 'axios';
import ImageCropProvider from 'providers/ImageCropProvider';
import { Player } from '../../../models/entities';
import ConfirmDeletionModal from '../../../components/Modal/ConfirmDeletionModal';
import { MdModeEditOutline } from 'react-icons/md';
import Button from 'components/Button/Button';

interface TeamDetailProps {
  teamId: string;
  userId: string;
  tournamentId: string;
}

const TeamDetail = ({ teamId, userId, tournamentId }: TeamDetailProps) => {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = async () => {
    try {
      if (teamId && userId && tournamentId) {
        const response = await axios.get(`/api/players/${teamId}`, {
          params: { userId, tournamentId },
        });
        console.log('Danh sách cầu thủ:', response.data.players);
        setPlayers(response.data.players);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách cầu thủ:', error);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [teamId, tournamentId, userId, router]);

  const handleRemovePlayer = async (playerId: string) => {
    try {
      // console.log('Received teamId:', teamId);
      // console.log('Received userId:', userId);
      // console.log('Received tournamentId:', tournamentId);

      const response = await axios.delete(`/api/players/deleteplayer`, {
        params: {
          userId,
          tournamentId,
          teamId,
          playerId,
        },
      });

      if (response.status !== 200) {
        throw new Error('Lỗi khi xóa cầu thủ');
      }

      // Cập nhật danh sách cầu thủ sau khi xóa thành công
      await fetchPlayers();
      toast.success('Đã xóa cầu thủ thành công!');
    } catch (error) {
      toast.error('Lỗi khi xóa cầu thủ');
    }
  };

  const handleAddPlayer = async () => {
    if (teamId) {
      try {
        const response = await fetch(`/api/players?teamId=${teamId}`);
        if (!response.ok) {
          throw new Error('Lỗi khi tải danh sách cầu thủ');
        }
        const data = await response.json();
        console.log('data:', data);
        setPlayers(data.players);
        await fetchPlayers();
      } catch (error) {
        console.error('Lỗi khi tải danh sách cầu thủ:', error);
      } finally {
        setLoading(false);
      }
    }
    // Refresh the list after adding a player
  };

  return (
    <Card className="mx-auto max-w-7xl px-3 md:px-12 xl:px-2">
      {error && <p className="text-red-500">{error}</p>}

      <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
        {players.map((player) => (
          <Card
            key={player.teamId}
            extra={'items-center w-full h-full p-[16px] bg-cover'}
          >
            <div className="flex flex-col items-center">
              <div className="group relative overflow-hidden rounded-2xl">
                <Image
                  width={950}
                  height={1593}
                  src={player.avatarUrl}
                  alt={player.playerName}
                  className="h-auto w-full object-cover object-top transition duration-500 group-hover:translate-y-10 group-hover:scale-150"
                />
                {/* {player. && (
                  <div className="absolute left-0 top-0 rounded-full bg-blue-500 p-1 text-xs text-white">
                    Đội trưởng
                  </div>
                )} */}
              </div>
              <h6 className="mt-2 text-sm font-bold text-navy-700">
                {player.playerName}
              </h6>
              <p className="text-xs font-bold text-gray-500">
                {player.position}
              </p>
              <div className="mt-3 flex w-full gap-3">
                <div className="w-full flex-1">
                  <ConfirmDeletionModal
                    handleConfirm={() => handleRemovePlayer(player.playerId)}
                    id={player.playerId}
                  />
                </div>
                <div className="w-full flex-1">
                  {' '}
                  <Button
                    onClick={() => {
                      router.push(
                        `/admin/tournament/${tournamentId}/players/${player.playerId}`,
                      ); // Điều hướng đến trang chỉnh sửa với teamId
                    }}
                    className="h-full w-full bg-navy-800"
                  >
                    <MdModeEditOutline className="cursor-pointer text-white hover:text-red-500" />
                  </Button>
                </div>

                {/* <MdModeEditOutline
                  className="cursor-pointer hover:text-red-500"
                  onClick={() => {
                    router.push(
                      `/admin/tournament/${tournamentId}/players/${player.playerId}`,
                    ); // Điều hướng đến trang chỉnh sửa với teamId
                  }}
                /> */}
              </div>
            </div>
          </Card>
        ))}

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <span className="text-gray-500">
              <RiUserAddLine onClick={() => setDialogOpen(true)} />
            </span>
          </div>
          {/* <button
            className="mt-2 rounded-full bg-gray-200 px-3 py-1"
            onClick={() => setDialogOpen(true)}
          >
            +
          </button> */}
        </div>
      </div>
      {/* thêm cầu thủ */}
      <ImageCropProvider>
        <AddPlayerDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          teamId={teamId ? teamId.toString() : ''}
          userId={userId}
          tournamentId={tournamentId}
          onAddPlayer={fetchPlayers}
        />
      </ImageCropProvider>
    </Card>
  );
};

export default TeamDetail;
