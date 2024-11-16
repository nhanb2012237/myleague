import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Image from 'next/image';
import { useToggleState } from '../../../hooks/useToggleState';
import { readFile } from '../../../helpers/cropImage';
import { useImageCropContext } from '../../../providers/ImageCropProvider';
import TournamentUpload from './TournamentUpload';
import AvatarEditModal from '../../Modal/AvatarEditModal';
import SearchBox from './SearchBox';
import Map from './Map'; // Ensure the correct import

import { Input, Button, Select, Option, Card } from '@material-tailwind/react';
import { toast } from 'sonner';
import { set } from 'date-fns';
import card from '@material-tailwind/react/theme/components/card';

interface UpdateTournamentFormProps {
  tournamentId: string;
  userId: string;
  setLoading: (loading: boolean) => void;
}

const UpdateTournamentForm = ({
  tournamentId,
  userId,
  setLoading,
}: UpdateTournamentFormProps) => {
  console.log('response', tournamentId, userId);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [img, setImg] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { state: isOpen, toggleState } = useToggleState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getProcessedImage, setImage, resetStates } = useImageCropContext();
  const [value, setValue] = useState(null);
  const [selectPosition, setSelectPosition] = useState(null);
  const [values, setValues] = useState('5');

  useEffect(() => {
    const fetchTournamentDetails = async () => {
      try {
        const response = await axios.get(`/api/tournament/getTournament`, {
          params: { tournamentId, userId },
        });
        const data = response.data.tournament;
        formik.setValues({
          tournamentName: data.tournamentName,
          numberOfTeams: data.numberOfTeams.toString() || '',
          startDate:
            data.startDate instanceof Date
              ? data.startDate.toISOString().split('T')[0]
              : new Date(data.startDate.seconds * 1000)
                  .toISOString()
                  .split('T')[0],
          endDate:
            data.endDate instanceof Date
              ? data.endDate.toISOString().split('T')[0]
              : new Date(data.endDate.seconds * 1000)
                  .toISOString()
                  .split('T')[0],
          location: data?.location,
          numberPlayerofTeam: data?.numberPlayerofTeam.toString() || '',
        });
        setImagePreview(data.logoUrl);
      } catch (error) {
        console.error('Failed to fetch tournament details:', error);
      }
    };

    if (tournamentId) {
      fetchTournamentDetails();
      setLoading(false);
    }
  }, [tournamentId]);

  const formik = useFormik({
    initialValues: {
      tournamentName: '',
      numberOfTeams: '',
      startDate: '',
      endDate: '',
      location: '',
      numberPlayerofTeam: '',
    },
    enableReinitialize: true,
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
      numberPlayerofTeam: Yup.number().required('Số lượng cầu thủ là bắt buộc'),
    }),
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append('tournamentName', values.tournamentName);
        formData.append('numberOfTeams', values.numberOfTeams.toString());
        formData.append('startDate', values.startDate);
        formData.append('endDate', values.endDate);
        formData.append('location', values.location);
        formData.append(
          'numberPlayerofTeam',
          values.numberPlayerofTeam.toString(),
        );
        formData.append('userId', userId);
        formData.append('tournamentId', tournamentId);
        if (img) {
          formData.append('logo', img);
        }

        const response = await axios.put(
          `/api/tournament/updateTournament`,
          formData,
        );

        if (response.status !== 200) {
          throw new Error('Lỗi khi gửi dữ liệu');
        } else {
          console.log('Tournament updated:', response.data);

          setLogoPreview('');
          setLogo(null);

          toast.success('Giải đấu đã được cập nhật thành công!');
        }
      } catch (error) {
        toast.error('Không thể cập nhật giải đấu. Vui lòng thử lại.');
        console.error('Lỗi khi cập nhật giải đấu:', error);
      } finally {
        setUploading(false);
      }
    },
  });

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

  const handleSelectChange = (value: string) => {
    setValues(value);
    formik.setFieldValue('numberPlayerofTeam', value);
  };

  return (
    <Card className="space-y-3 pb-5">
      <div className="mx-5 flex gap-5 pt-3 font-dm">
        <div className="mt-2 h-full w-1/4 flex-none rounded-xl bg-lightPrimary dark:!bg-navy-700">
          {imagePreview ? (
            <>
              <Image
                src={imagePreview}
                alt="Xem trước logo"
                className="mt-1 h-full w-full rounded border-2 border-blue-gray-700 object-cover"
                width={300}
                height={100}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  setImagePreview('');
                  setImg(null);
                }}
                className="mt-2 w-full bg-brand-500 text-white"
              >
                Tải lên logo mới
              </Button>
              {/* <TournamentUpload
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
              /> */}
            </>
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

        {/* <div className="mr-5  flex-grow gap-3 space-y-4 overflow-hidden rounded-xl bg-white pb-4 pl-3 dark:bg-navy-800"> */}
        <form onSubmit={formik.handleSubmit} className="  mt-2 flex ">
          <div className="w-full flex-1 md:w-1/2">
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
                name="numberPlayerofTeam"
                value={formik.values.numberPlayerofTeam}
                onChange={(value) => handleSelectChange(value)}
                onBlur={formik.handleBlur}
              >
                <Option value="5">5 người</Option>
                <Option value="7">7 người</Option>
              </Select>
              {formik.errors.numberPlayerofTeam && (
                <p className="-mt-4 w-full font-[0.75rem] text-red-500">
                  {formik.errors.numberPlayerofTeam}
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
                  formik.touched.startDate && Boolean(formik.errors.startDate)
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
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              />
            </div>
          </div>

          <div className="ml-3  w-full flex-1 md:w-1/2">
            <div className="mb-4">
              {formik.values.location && (
                <SearchBox
                  values={formik.values.location}
                  setSelectPosition={setSelectPosition}
                  setFieldValue={formik.setFieldValue}
                />
              )}
            </div>
            <div className="mb-4">
              <Map selectPosition={selectPosition} />
            </div>

            <div className=" w-full flex-1 justify-end">
              {/* <Button
            variant="outlined"
            onClick={formik.handleReset}
            className="gap-5 bg-brand-500 text-white"
          >
            Hủy
          </Button> */}
              <Button
                type="button" // Đổi từ "submit" thành "button"
                disabled={uploading}
                onClick={handleButtonClick} // Gọi hàm handleSubmit của formik
                className=" w-full  bg-brand-500 text-white"
              >
                {uploading ? 'Đang cập nhật...' : 'Cập nhật giải đấu'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default UpdateTournamentForm;
