import { useState, useRef, ChangeEvent } from 'react';
import { useImageCropContext } from '../../../providers/ImageCropProvider';
import { useToggleState } from '../../../hooks/useToggleState';
import { readFile } from '../../../helpers/cropImage';
import AvatarDisplay from './AvatarDisplay';
import AvatarEditModal from '../../Modal/AvatarEditModal';
import AvatarUpload from './AvatarUpload';
import { Toaster, toast } from 'sonner';
import banner from '/public/img/profile/banner.png';
import { Player } from '../../../models/entities';
import Card from 'components/card';
import axios from 'axios';
import Spinner from '../../../components/Loader/Spinner';

interface PlayerAvatarUploadAndCropProps {
  playerId: string;
  userId: string;
  tournamentId: string;
  teamId: string;
  avatarUrl: string | null;
  player: Player;
}

export default function PlayerAvatarUploadAndCrop({
  playerId,
  userId,
  tournamentId,
  teamId,
  avatarUrl,
  player,
}: PlayerAvatarUploadAndCropProps) {
  const { state: isOpen, toggleState } = useToggleState();
  const [photoURL, setPhotoURL] = useState<string | null>(avatarUrl);
  const { getProcessedImage, setImage, resetStates } = useImageCropContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files?.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid file type. Please upload an image file.');
        return;
      }

      const imageDataUrl = await readFile(file);
      setImage(imageDataUrl as string);
      toggleState();
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAvatarUpload = async (
    avatar: File,
    playerId: string,
    userId: string,
    tournamentId: string,
    teamId: string,
  ) => {
    try {
      // Tạo FormData để gửi file ảnh
      const formData = new FormData();
      // 'avatar' là key gửi file hình
      formData.append('playerId', playerId);
      formData.append('userId', userId);
      formData.append('tournamentId', tournamentId);
      formData.append('teamId', teamId);

      if (avatar) {
        formData.append('avatar', avatar);
      }

      try {
        const response = await axios.post(
          '/api/players/uploadAvatar',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        console.log('Upload thành công:', response.data);
        return response.data.avatarUrl;
      } catch (error) {
        console.error('Lỗi khi upload:', error.response?.data || error.message);
      }

      // Lấy URL avatar mới trả về từ API
      // Giả sử API trả về URL của avatar mới
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error uploading player avatar');
      return null;
    }
  };

  const handleDone = async () => {
    const avatar = await getProcessedImage(); // Lấy ảnh đã được crop và xử lý

    if (avatar && playerId && userId) {
      // Gọi API để upload avatar cầu thủ
      const newPhotoURL = await handleAvatarUpload(
        avatar,
        playerId,
        userId,
        tournamentId,
        teamId,
      );
      if (newPhotoURL) {
        setPhotoURL(newPhotoURL);

        toast.success('Avatar updated successfully!');
      }
    }

    resetStates(); // Reset lại state sau khi hoàn tất
  };

  return (
    <Card extra={'items-center w-full h-full p-[16px] bg-cover'}>
      <div
        className="relative mt-1 flex h-32 w-full justify-center rounded-md bg-cover"
        style={{ backgroundImage: `url(${banner.src})` }}
      >
        <div className="absolute -bottom-10 flex h-[123px] w-[123px] items-center justify-center rounded-md border-[4px] border-white bg-pink-400 dark:!border-navy-700">
          <AvatarDisplay photoURL={photoURL} />
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center">
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
          {player?.playerName}
        </h4>
        <h5 className="text-base font-normal text-gray-600">
          {player?.position}
        </h5>
      </div>

      <AvatarUpload
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
      />
      <AvatarEditModal
        isOpen={isOpen}
        toggleState={toggleState}
        handleDone={handleDone}
      />

      <Toaster />
    </Card>
  );
}
