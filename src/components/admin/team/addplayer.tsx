import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useFormik } from 'formik';
import { useImageCropContext } from '../../../providers/ImageCropProvider';
import * as Yup from 'yup';
import Image from 'next/image';
import axios from 'axios';
import { Player } from '../../../models/entities';
import PlayerDisplay from './AvatarDisplay';
import AvatarEditModal from '../../Modal/AvatarEditModal';
import { useToggleState } from '../../../hooks/useToggleState';
import { readFile } from '../../../helpers/cropImage';
import PlayerUpload from './PlayerUpload';
import * as faceapi from 'face-api.js';
import { db } from '../../../../config/firebaseconfig';
import { collection, addDoc } from 'firebase/firestore';
import { IoCloseSharp } from 'react-icons/io5';

import {
  Input,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  Select,
  Option,
} from '@material-tailwind/react';
import { toast } from 'sonner';

interface AddPlayerDialogProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
  userId: string;
  onAddPlayer: () => void;
  tournamentId: string;
}

const AddPlayerDialog: React.FC<AddPlayerDialogProps> = ({
  open,
  onClose,
  teamId,
  userId,
  onAddPlayer,
  tournamentId,
}) => {
  const [img, setImg] = useState<File | null>(null);
  const [savedDescriptor, setSavedDescriptor] = useState<Float32Array[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const { state: isOpen, toggleState } = useToggleState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getProcessedImage, setImage, resetStates } = useImageCropContext();
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(
    null,
  );

  useEffect(() => {
    // Load the TinyFaceDetector model
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    };
    loadModels();
  }, []);

  const fetchFaceDescriptors = async () => {
    try {
      console.log('Loading face descriptors...', userId, tournamentId);
      const response = await axios.get('/api/players/allPlayers', {
        params: {
          userId,
          tournamentId,
        },
      });

      const players = response.data.players;
      console.log('Players:', players);
      const descriptors = players
        .map((player: any) => {
          if (!player.faceDescriptor) {
            console.warn(
              `Player ${player.playerName} does not have faceDescriptor`,
            );
            return null;
          }
          return player.faceDescriptor.map(
            (desc: string) => new Float32Array(JSON.parse(desc)),
          );
        })
        .flat()
        .filter(Boolean);
      console.log('Fetched descriptors:', descriptors);

      setSavedDescriptor(descriptors);
      console.log('Saved descriptors:', savedDescriptor);
    } catch (error: any) {
      console.error('Error loading face descriptors:', error);
      toast.error('Failed to load face descriptors');
      throw error; // Propagate the error to handle it in onSubmit
    }
  };

  const fetchTeamPlayers = async (): Promise<Player[]> => {
    try {
      const response = await axios.get(`/api/players/${teamId}`, {
        params: {
          userId,
          tournamentId,
        },
      });
      return response.data.players as Player[];
    } catch (error: any) {
      console.error('Error fetching team players:', error);
      toast.error('Failed to fetch team players');
      throw error;
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      displayName: '',
      email: '',
      jerseyNumber: '',
      phone: '',
      position: '',
      dateOfBirth: '',
      faceDescriptor: [],
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Tên cầu thủ là bắt buộc')
        .min(4, 'Tên cầu thủ phải có ít nhất 4 ký tự'),
      email: Yup.string()
        .required('Email là bắt buộc')
        .email('Email không hợp lệ'),
      displayName: Yup.string()
        .required('Tên thi đấu là bắt buộc')
        .min(4, 'Tên cầu thủ phải có ít nhất 4 ký tự'),
      phone: Yup.string()
        .required('Số điện thoại là bắt buộc')
        .matches(
          /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
          'Số điện thoại không hợp lệ',
        ),
      position: Yup.string().required('Vị trí là bắt buộc'),
      jerseyNumber: Yup.number()
        .required('Số áo là bắt buộc')
        .typeError('Số áo phải là một số'),
      dateOfBirth: Yup.date().required('Ngày sinh là bắt buộc'),
    }),
    onSubmit: async (values) => {
      try {
        if (!faceDescriptor) {
          toast.error('Vui lòng tải lên ảnh để trích xuất dữ liệu gương mặt.');
          return;
        }

        // Fetch the latest face descriptors
        await fetchFaceDescriptors();

        // Kiểm tra descriptor mới với danh sách descriptor đã đăng ký
        let isRegistered = false;
        if (savedDescriptor.length > 0) {
          console.log('faceDescriptor:', faceDescriptor);
          for (let i = 0; i < savedDescriptor.length; i++) {
            console.log('savedDescriptor:', savedDescriptor[i]);

            const distance = faceapi.euclideanDistance(
              faceDescriptor,
              savedDescriptor[i],
            );
            if (distance < 0.5) {
              isRegistered = true;
              break;
            }
          }
        }

        if (isRegistered) {
          toast.error('Cầu thủ này đã được đăng ký trước đó.');
          setImagePreview('');
          setImg(null);
          return;
        }

        // Fetch existing team players to check jersey number
        const existingPlayers = await fetchTeamPlayers();
        const isJerseyNumberTaken = existingPlayers.some(
          (player) => player.jerseyNumber === Number(values.jerseyNumber),
        );

        if (isJerseyNumberTaken) {
          toast.error('Số áo này đã được sử dụng bởi cầu thủ khác.');
          return;
        }

        const formData = new FormData();
        formData.append('playerName', values.name);
        formData.append('displayName', values.displayName);
        formData.append('email', values.email);
        formData.append('phone', values.phone);
        formData.append('position', values.position);
        formData.append('jerseyNumber', values.jerseyNumber.toString());
        formData.append('dateOfBirth', values.dateOfBirth);
        formData.append('teamId', teamId);
        formData.append('tournamentId', tournamentId);
        formData.append('userId', userId);
        formData.append(
          'faceDescriptor',
          JSON.stringify(values.faceDescriptor),
        );

        if (img) {
          formData.append('files', img);
          console.log('image', img);
        }
        console.log('formDataplayer:', formData);

        setUploading(true);
        const response = await fetch('/api/players/create', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error('Lỗi khi gửi dữ liệu');
        }

        const data = await response.json();
        console.log('Kết quả:', data);

        toast.success('Cầu thủ đã được thêm thành công!');
        formik.resetForm();
        setImagePreview('');
        setImg(null);
        onClose();
        onAddPlayer(); // Trigger refresh
      } catch (error: any) {
        if (error.message !== 'Lỗi khi gửi dữ liệu') {
          toast.error(
            'Cầu thủ này đã được đăng ký trước đó hoặc đã sử dụng số áo.',
          );
        } else {
          toast.error('Không thể thêm cầu thủ. Vui lòng thử lại.');
        }
        console.error('Lỗi khi thêm cầu thủ:', error);
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
    const avatar = await getProcessedImage(); // Get processed image
    if (avatar) {
      setImg(avatar as File);
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);

          // Extract and store descriptors
          const image = await faceapi.bufferToImage(avatar);
          const detections = await faceapi
            .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detections) {
            setFaceDescriptor(new Float32Array(detections.descriptor));
            formik.setFieldValue(
              'faceDescriptor',
              Array.from(detections.descriptor),
            );

            console.log('Face descriptor new:', detections.descriptor);
          } else {
            // If face data extraction fails
            toast.error(
              'Không thể trích xuất dữ liệu gương mặt. Vui lòng chọn ảnh khác.',
            );
            setImagePreview('');
            setImg(null);
          }
        } else {
          console.error('FileReader result is not a string');
        }
      };
      reader.readAsDataURL(avatar); // Display cropped image
    }
  };

  const handleSelectChange = (value: string) => {
    formik.setFieldValue('position', value);
  };

  return (
    <Dialog size="lg" open={open} handler={onClose}>
      <DialogHeader>
        Thêm cầu thủ
        <IoCloseSharp onClick={onClose} className="ml-auto h-5 w-5" />
      </DialogHeader>
      <DialogBody className="space-y-4 pb-6">
        <div className="flex w-full gap-3 rounded-[20px] bg-white bg-clip-border pt-3 font-dm">
          <div className="h-full w-1/4 flex-none rounded-xl bg-lightPrimary dark:!bg-navy-700">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Hình ảnh xem trước"
                className="h-full w-full rounded object-cover"
                width={300}
                height={150}
              />
            ) : (
              <PlayerUpload
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

          <div className=" -mt-2 grid h-full w-full flex-grow gap-3 space-y-4 overflow-hidden rounded-xl bg-white pb-6 pl-3 dark:!bg-navy-800">
            <form
              onSubmit={formik.handleSubmit}
              className="col-span-12 mt-3 flex"
            >
              <div className="w-full md:w-1/2">
                <div className="mb-4">
                  <Input
                    label="Số áo"
                    name="jerseyNumber"
                    type="number"
                    value={formik.values.jerseyNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.jerseyNumber &&
                      Boolean(formik.errors.jerseyNumber)
                    }
                  />
                  {formik.touched.jerseyNumber &&
                    formik.errors.jerseyNumber && (
                      <p className="mt-1 text-sm text-red-500">
                        {formik.errors.jerseyNumber}
                      </p>
                    )}
                </div>

                <div className="mb-4">
                  <Input
                    label="Họ và tên"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {formik.errors.name}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <Input
                    label="Số điện thoại"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="mt-1 text-sm text-red-500">
                      {formik.errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="ml-3 w-full md:w-1/2">
                <div className="mb-4">
                  <Input
                    label="Tên thi đấu"
                    name="displayName"
                    value={formik.values.displayName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.displayName &&
                      Boolean(formik.errors.displayName)
                    }
                  />
                  {formik.touched.displayName && formik.errors.displayName && (
                    <p className="mt-1 text-sm text-red-500">
                      {formik.errors.displayName}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <Input
                    type="date"
                    label="Ngày sinh"
                    name="dateOfBirth"
                    value={formik.values.dateOfBirth}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.dateOfBirth &&
                      Boolean(formik.errors.dateOfBirth)
                    }
                  />
                  {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-500">
                      {formik.errors.dateOfBirth}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <Select
                    label="Vị trí"
                    name="position"
                    value={formik.values.position}
                    onChange={(value) => handleSelectChange(value)}
                    onBlur={formik.handleBlur}
                  >
                    <Option value="Tiền Đạo">Tiền Đạo</Option>
                    <Option value="Hậu Vệ">Hậu Vệ</Option>
                    <Option value="Thủ Môn">Thủ Môn</Option>
                  </Select>
                  {formik.touched.position && formik.errors.position && (
                    <p className="-mt-4 w-full font-[0.75rem] text-red-500">
                      {formik.errors.position}
                    </p>
                  )}
                </div>
                <div className="flex gap-5">
                  <Button
                    variant="outlined"
                    onClick={handleClose}
                    className="ml-5 bg-navy-700 text-white"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading}
                    className="ml-5 w-full bg-navy-700 text-white"
                  >
                    {uploading ? 'Đang thêm...' : 'Thêm cầu thủ'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
};

export default AddPlayerDialog;
