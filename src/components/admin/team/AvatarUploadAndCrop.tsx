import { useState, useRef, ChangeEvent } from 'react';
import { useImageCropContext } from '../../../providers/ImageCropProvider';
import { useToggleState } from '../../../hooks/useToggleState';
import { readFile } from '../../../helpers/cropImage';
import AvatarDisplay from './AvatarDisplay';
import AvatarEditModal from '../../Modal/AvatarEditModal';
import AvatarUpload from './AvatarUpload';
import { Toaster, toast } from 'sonner';
import banner from '/public/img/profile/banner.png';
import { Team } from '../../../models/entities';
import Card from 'components/card';
import axios from 'axios';
import Spinner from '../../../components/Loader/Spinner';
interface AvatarUploadAndCropProps {
  teamId: string;
  userId: string;
  tournamentId: string;
  teamLogo: string | null;
  teamName: string;
}

export default function AvatarUploadAndCrop({
  teamId,
  userId,
  tournamentId,
  teamLogo,
  teamName,
}: AvatarUploadAndCropProps) {
  const { state: isOpen, toggleState } = useToggleState();
  const [photoURL, setPhotoURL] = useState<string | null>(teamLogo);
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
    teamId: string,
    userId: string,
    tournamentId: string,
  ) => {
    try {
      // Tạo FormData để gửi file ảnh
      const formData = new FormData();
      // 'logo' là key gửi file hình
      formData.append('teamId', teamId);
      formData.append('userId', userId);
      formData.append('tournamentId', tournamentId);

      if (avatar) {
        formData.append('logo', avatar);
      }

      try {
        const response = await axios.post('/api/teams/uploadLogo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Upload thành công:', response.data);
        return response.data.teamLogo;
      } catch (error) {
        console.error('Lỗi khi upload:', error.response?.data || error.message);
      }

      // Lấy URL logo mới trả về từ API
      // Giả sử API trả về URL của logo mới
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Error uploading team logo');
      return null;
    }
  };

  const handleDone = async () => {
    const avatar = await getProcessedImage(); // Lấy ảnh đã được crop và xử lý

    if (avatar && teamId && userId) {
      // Gọi API để upload logo đội bóng
      const newPhotoURL = await handleAvatarUpload(
        avatar,
        teamId,
        userId,
        tournamentId,
      );
      if (newPhotoURL) {
        setPhotoURL(newPhotoURL);

        toast.success('Cập nhật logo đội bóng thành công');
      }
    }

    resetStates(); // Reset lại state sau khi hoàn tất
  };

  return (
    <Card extra={'items-center w-full h-full p-[16px] bg-cover'}>
      <div
        className="relative mt-1 flex h-32 w-full justify-center rounded-xl bg-cover"
        style={{ backgroundImage: `url(${banner.src})` }}
      >
        <div className="absolute -bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white bg-pink-400 dark:!border-navy-700">
          <AvatarDisplay photoURL={photoURL} />
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center">
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
          {teamName || 'Team Name'}
        </h4>
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
