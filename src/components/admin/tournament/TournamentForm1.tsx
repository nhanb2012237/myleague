'use client';
import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Image from 'next/image';
import { useToggleState } from '../../../hooks/useToggleState';
import { readFile } from '../../../helpers/cropImage';
import { useImageCropContext } from '../../../providers/ImageCropProvider';
import TournamentUpload from './TournamentUpload';
import AvatarEditModal from '../../Modal/AvatarEditModal';
import SearchBox from './SearchBox';
// import Maps from './Map';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

import {
  Input,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Select,
  Option,
} from '@material-tailwind/react';
import { toast } from 'sonner';
import { IoCloseSharp } from 'react-icons/io5';

interface CreateTournamentDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onTournamentCreated: (id: string) => void;
  onTournamentsReload: () => void;
}

const CreateTournamentDialog = ({
  open,
  onClose,
  userId,
  onTournamentCreated,
  onTournamentsReload,
}: CreateTournamentDialogProps) => {
  const [isClient, setIsClient] = useState(false);
  const Map = useMemo(() => dynamic(() => import('./Map'), { ssr: false }), []);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [tournamentCreated, setTournamentCreated] = useState<boolean>(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [img, setImg] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { state: isOpen, toggleState } = useToggleState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getProcessedImage, setImage, resetStates } = useImageCropContext();
  const [value, setValue] = useState(null);
  const [selectPosition, setSelectPosition] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // quy dinh cho formik
  const formik = useFormik({
    initialValues: {
      tournamentName: '',
      numberOfTeams: '',
      startDate: '',
      endDate: '',
      location: '',
      numberOfPlayers: '',
    },
    validationSchema: Yup.object({
      tournamentName: Yup.string()
        .required('Tên giải đấu là bắt buộc')
        .min(4, 'Tên giải đấu phải có ít nhất 4 ký tự'),
      numberOfTeams: Yup.number().required('Số đội là bắt buộc'),
      startDate: Yup.date().required('Ngày bắt đầu là bắt buộc'),
      endDate: Yup.date().required('Ngày kết thúc là bắt buộc'),
      location: Yup.string()
        .required('Địa điểm là bắt buộc')
        .min(4, 'Địa điểm phải có ít nhất 4 ký tự'),
      numberOfPlayers: Yup.string().required('Số lượng cầu thủ là bắt buộc'),
    }),
    onSubmit: async (values) => {
      if (!img) {
        toast.error('Vui lòng tải lên logo của giải đấu.');
        return;
      }

      const formData = new FormData();
      formData.append('tournamentName', values.tournamentName);
      formData.append('numberOfTeams', values.numberOfTeams);
      formData.append('startDate', values.startDate);
      formData.append('endDate', values.endDate);
      formData.append('location', values.location);
      formData.append('numberPlayerofTeam', values.numberOfPlayers);
      formData.append('userId', userId);
      formData.append('logo', img);

      try {
        setUploading(true);

        const response = await fetch('/api/tournament/create', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Lỗi khi gửi dữ liệu');
        } else {
          const data = await response.json();
          console.log('Tournament created:', data);

          // Call function to create teams
          const teams = await handleCreateTeams(data.tournament?.id);
          if (!teams) {
            throw new Error('Không thể tạo đội.');
          }

          // Call function to create matches
          const matchesCreated = await handleCreateMatches(
            data.tournament?.id,
            teams,
          );
          if (!matchesCreated) {
            throw new Error('Không thể tạo trận đấu.');
          }

          // Reset form and state
          formik.resetForm();
          setLogoPreview('');
          setLogo(null);
          setTournamentCreated(true);

          // Optional: Call onTournamentCreated if needed
          onTournamentCreated(data.tournament?.id);
          toast.success('Giải đấu đã được tạo thành công!');

          // Close the dialog and reset form
          onTournamentsReload();
          onClose();
        }
      } catch (error) {
        toast.error('Không thể tạo giải đấu. Vui lòng thử lại.');
        console.error('Lỗi khi tạo giải đấu:', error);
      } finally {
        setUploading(false);
      }
    },
  });

  const handleCreateTeams = async (tournamentId: string) => {
    console.log('Number of Teams1:', formik.values.numberOfTeams);
    console.log('Tournament ID trang from:', tournamentId);
    console.log('User ID:', userId);
    try {
      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numberOfTeams: formik.values.numberOfTeams,
          tournamentId,
          userId,
        }),
      });
      const data = await response.json();
      console.log('Datateam:', data);
      if (response.ok) {
        console.log('Teams created:', data.teams);
        return data.teams; // Return the created teams
      } else {
        console.error('Failed to create teams:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Failed to create teams:', error);
      return null;
    }
  };

  const handleCreateMatches = async (tournamentId: string, teams: any[]) => {
    console.log('Teams:', teams);
    if (!teams || teams.length < 2) {
      console.error('Invalid teams data:', teams);
      return false;
    }

    try {
      const response = await fetch('/api/matches/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teams: teams,
          tournamentId: tournamentId,
          userId: userId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Matches created:', data.matches);
        setMatches(data.matches);
        return true;
      } else {
        console.error('Failed to create matches:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Failed to create matches:', error);
      return false;
    }
  };

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
      console.log('Image:', img);
      toggleState();
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    // Clear image preview and file
    setImagePreview('');
    setImage(null);
    formik.resetForm();
    onClose();
  };

  const handleDone = async () => {
    const avatar = await getProcessedImage();
    console.log('Avatar:', avatar);
    if (avatar) {
      setImg(avatar as File);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
        } else {
          console.error('Kết quả FileReader không phải là chuỗi');
        }
      };
      reader.readAsDataURL(avatar); // Hiển thị ảnh đã crop
    }
  };

  const handlePlaceSelected = (place) => {
    if (place.geometry) {
      console.log('Place details:', place);
      console.log('Formatted address:', place.formatted_address);
    } else {
      console.log('No details available for input:', place.name);
    }
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    formik.handleSubmit();
  };

  return (
    <Dialog size="lg" open={open} handler={onClose}>
      <DialogHeader className="relative">
        <span>Tạo Giải Đấu</span>
        <IoCloseSharp onClick={onClose} className="ml-auto h-5 w-5" />
      </DialogHeader>

      <DialogBody className="space-y-3 pb-5">
        <div className="flex w-full gap-3 rounded-[20px] bg-white bg-clip-border pt-3 font-dm">
          <div className="h-full w-1/4 flex-none rounded-xl bg-lightPrimary dark:!bg-navy-700">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Xem trước logo"
                className="h-full w-full rounded object-cover"
                width={300}
                height={200}
              />
            ) : (
              <TournamentUpload
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
              />
            )}
            <AvatarEditModal
              isOpen={isOpen}
              toggleState={toggleState}
              handleDone={handleDone}
            />
          </div>

          <div className="grid h-full w-full flex-grow gap-3 space-y-4 overflow-hidden rounded-xl bg-white pb-4  pl-3 dark:bg-navy-800">
            <form
              onSubmit={formik.handleSubmit}
              className="col-span-12 mt-2 flex"
            >
              <div className="w-full md:w-1/2">
                <div className="mb-4">
                  <Input
                    label="Tên giải đấu"
                    name="tournamentName"
                    value={formik.values.tournamentName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.tournamentName &&
                      Boolean(formik.errors.tournamentName)
                    }
                  />
                </div>

                <div className="mb-4">
                  <Input
                    label="Số đội"
                    name="numberOfTeams"
                    type="number"
                    value={formik.values.numberOfTeams}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.numberOfTeams &&
                      Boolean(formik.errors.numberOfTeams)
                    }
                  />
                </div>

                <div className="mb-4">
                  <Select
                    label="Số lượng cầu thủ mỗi đội"
                    name="numberOfPlayers"
                    value={formik.values.numberOfPlayers}
                    onChange={(value) =>
                      formik.setFieldValue('numberOfPlayers', value)
                    }
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.numberOfPlayers &&
                      Boolean(formik.errors.numberOfPlayers)
                    }
                  >
                    <Option value="5">5 người</Option>
                    <Option value="7">7 người</Option>
                  </Select>
                  {formik.errors.numberOfPlayers && (
                    <p className="font-sm mt-1 text-red-500">
                      {formik.errors.numberOfPlayers}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <Input
                    type="date"
                    label="Ngày bắt đầu"
                    name="startDate"
                    value={formik.values.startDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.startDate &&
                      Boolean(formik.errors.startDate)
                    }
                  />
                </div>

                <div className="mb-4">
                  <Input
                    type="date"
                    label="Ngày kết thúc"
                    name="endDate"
                    value={formik.values.endDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.endDate && Boolean(formik.errors.endDate)
                    }
                  />
                </div>
              </div>

              <div className="ml-3 w-full md:w-1/2">
                <div className="mb-4">
                  <SearchBox
                    values={''}
                    setSelectPosition={setSelectPosition}
                    setFieldValue={formik.setFieldValue}
                  />
                </div>
                <div className="mb-4">
                  <Map selectPosition={selectPosition} />
                </div>
              </div>
            </form>
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <div className="mr-0 flex justify-end">
          <Button
            variant="outlined"
            onClick={handleClose}
            className="gap-5 bg-navy-700  text-white"
          >
            Hủy
          </Button>
          <Button
            type="button" // Đổi từ "submit" thành "button"
            disabled={uploading}
            onClick={handleButtonClick} // Gọi hàm handleSubmit của formik
            className="ml-5 bg-navy-700 text-white"
          >
            {uploading ? 'Đang tạo...' : 'Tạo giải đấu'}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};

const MatchesList = ({ matches }: { matches: any[] }) => (
  <div>
    <h2>Matches</h2>
    <ul>
      {matches.map((match, index) => (
        <li key={index}>
          {match.opponent1.name} vs {match.opponent2.name}
        </li>
      ))}
    </ul>
  </div>
);

export default CreateTournamentDialog;
