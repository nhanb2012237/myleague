import { Input } from '@material-tailwind/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Player } from '../../../models/entities';
import Button from 'components/Button/Button';
import { Select, Option } from '@material-tailwind/react';

interface InformationProps {
  player: Player;
  playerId: string;
  tournamentId: string;
  userId: string;
  teamId: string;
}

const Information: React.FC<InformationProps> = ({
  player,
  playerId,
  tournamentId,
  userId,
  teamId,
}: InformationProps) => {
  console.log('player2', player);
  const [values, setValues] = useState(player.position);
  const [initialValues, setInitialValues] = useState({
    name: player?.playerName || '',
    displayName: player?.displayName || '',
    email: player?.email || '',
    phone: player?.phone || '',
    position: player?.position || '',
    jerseyNumber: player?.jerseyNumber.toString() || '',
    dateOfBirth:
      player?.dateOfBirth instanceof Date
        ? player.dateOfBirth.toISOString().split('T')[0]
        : new Date(player?.dateOfBirth.seconds * 1000)
            .toISOString()
            .split('T')[0],
  });

  useEffect(() => {
    setInitialValues({
      name: player?.playerName || '',
      displayName: player?.displayName || '',
      email: player?.email || '',
      phone: player?.phone || '',
      position: player?.position || '',
      jerseyNumber: player?.jerseyNumber.toString() || '',
      dateOfBirth:
        player?.dateOfBirth instanceof Date
          ? player.dateOfBirth.toISOString().split('T')[0]
          : new Date(player?.dateOfBirth.seconds * 1000)
              .toISOString()
              .split('T')[0],
    });
  }, [player]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true, // Cập nhật lại giá trị form khi initialValues thay đổi
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
      jerseyNumber: Yup.number().required('Số áo là bắt buộc'),
      dateOfBirth: Yup.date()
        .required('Ngày sinh là bắt buộc')
        .typeError('Ngày sinh không hợp lệ'),
    }),
    onSubmit: async (values) => {
      const updatedFields: any = {};
      Object.keys(values).forEach((key) => {
        if (values[key] !== initialValues[key as keyof typeof values]) {
          updatedFields[key] = values[key];
        }
      });

      if (Object.keys(updatedFields).length === 0) {
        toast.info('No changes to update.');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('playerId', player.playerId);
        formData.append('displayName', values.displayName);
        formData.append('email', values.email);
        formData.append('phone', values.phone.toString());
        formData.append('position', values.position);
        formData.append('jerseyNumber', values.jerseyNumber);
        formData.append('dateOfBirth', values.dateOfBirth);
        formData.append('name', values.name);

        const response = await axios.put(`/api/players/update`, {
          teamId,
          userId,
          playerId,
          tournamentId,
          ...updatedFields,
        });

        if (response.status === 200) {
          toast.success('Thông tin cầu thủ đã được cập nhật thành công!');
        }
      } catch (error: any) {
        console.error('Lỗi khi cập nhật thông tin cầu thủ:', error);
        toast.error('Không thể cập nhật thông tin cầu thủ. Vui lòng thử lại.');
      }
    },
  });

  const handleSelectChange = (value: string) => {
    setValues(value);
    formik.setFieldValue('position', value);
  };

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="grid h-full w-full rounded-3xl border-gray-100 bg-white bg-clip-border p-3 font-dm shadow-2xl shadow-gray-600/10 dark:!bg-navy-800 dark:shadow-none"
    >
      <div className="flex gap-3 lg:grid lg:grid-cols-12 2xl:grid-cols-12">
        <div className="col-span-6 h-full w-full">
          {/* name */}
          <div className="mb-1 mt-3 flex flex-col gap-6">
            <Input
              label="Tên cầu thủ"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
            />
            {formik.errors.name && (
              <p className="-mt-4 w-full font-[0.75rem] text-red-500">
                {formik.errors.name}
              </p>
            )}
          </div>

          {/* jerseyNumber */}
          <div className="mb-1 mt-3 flex flex-col gap-6">
            <Input
              label="Số áo"
              name="jerseyNumber"
              value={formik.values.jerseyNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.jerseyNumber &&
                Boolean(formik.errors.jerseyNumber)
              }
            />
            {formik.errors.jerseyNumber && (
              <p className="-mt-4 w-full font-[0.75rem] text-red-500">
                {formik.errors.jerseyNumber}
              </p>
            )}
          </div>

          <div className="mb-1 mt-3 flex flex-col gap-6">
            <Input
              label="Email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
            />
            {formik.errors.email && (
              <p className="-mt-4 w-full font-[0.75rem] text-red-500">
                {formik.errors.email}
              </p>
            )}
          </div>

          {/* phone */}
          <div className="mb-1 mt-3 flex flex-col gap-6">
            <Input
              label="Số điện thoại"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
            />
            {formik.errors.phone && (
              <p className="-mt-4 w-full font-[0.75rem] text-red-500">
                {formik.errors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="col-span-6 h-full w-full">
          {/* displayName */}
          <div className="mb-1 mt-3 flex flex-col gap-6">
            <Input
              label="Tên thi đấu"
              name="displayName"
              value={formik.values.displayName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.displayName && Boolean(formik.errors.displayName)
              }
            />
            {formik.errors.displayName && (
              <p className="-mt-4 w-full font-[0.75rem] text-red-500">
                {formik.errors.displayName}
              </p>
            )}
          </div>

          {/* dateOfBirth */}
          <div className="mb-1 mt-3 flex flex-col gap-6">
            <Input
              type="date"
              label="Ngày sinh"
              name="dateOfBirth"
              value={formik.values.dateOfBirth}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)
              }
            />
            {formik.errors.dateOfBirth && (
              <p className="-mt-4 w-full font-[0.75rem] text-red-500">
                {formik.errors.dateOfBirth}
              </p>
            )}
          </div>

          {/* position */}
          <div className="mb-1 mt-3 flex flex-col gap-6">
            <Select
              label="Vị trí thi đấu"
              name="position"
              value={formik.values.position}
              onChange={(value) => handleSelectChange(value)}
              onBlur={formik.handleBlur}
            >
              <Option value="Tiền Đạo">Tiền Đạo</Option>
              <Option value="Hậu Vệ">Hậu Vệ</Option>
              <Option value="Thủ Môn ">Thủ Môn</Option>
            </Select>
            {formik.errors.position && (
              <p className="-mt-4 w-full font-[0.75rem] text-red-500">
                {formik.errors.position}
              </p>
            )}
          </div>

          <div>
            <Button
              type="submit"
              className="linear mt-4 flex w-full items-center justify-center  bg-navy-700 px-2 py-2 text-base font-bold text-white transition duration-200 hover:text-navy-800  "
            >
              lưu cập nhật
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Information;
