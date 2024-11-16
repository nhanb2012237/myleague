import { MdFileUpload } from 'react-icons/md';
import { Input } from '@material-tailwind/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Team } from '../../../models/entities';
import axios from 'axios';
import Button from 'components/Button/Button';
interface BannerProps {
  teamId: string;
  userId: string;
  tournamentId: string;
}

const Information = ({ teamId, userId, tournamentId }: BannerProps) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [initialValues, setInitialValues] = useState({
    email: '',
    name: '',
    phone: '',
    coach: '',
    address: '',
  });
  const [loading, setLoading] = useState<boolean>(true);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true, // Cập nhật lại giá trị form khi initialValues thay đổi
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Vui lòng nhập tên đội bóng')
        .min(4, 'Tên đội bóng phải có ít nhất 4 ký tự'),
      email: Yup.string()
        .required('Vui lòng nhập email')
        .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Email không hợp lệ'),
      coach: Yup.string()
        .required('vui lòng nhập tên huấn luyện viên')
        .min(4, 'Tên huấn luyện viên phải có ít nhất 4 ký tự'),
      phone: Yup.string()
        .required('vui lòng nhập số điện thoại')
        .matches(
          /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
          ' Số điện thoại không hợp lệ',
        ),
      address: Yup.string().required('vui lòng nhập địa chỉ'),
    }),
    onSubmit: async (values) => {
      // So sánh giá trị form với giá trị ban đầu để tìm các trường đã thay đổi
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
        const response = await axios.put('/api/teams/updateTeam', {
          teamId,
          userId,
          tournamentId,
          ...updatedFields, // Chỉ gửi các trường đã thay đổi
        });

        if (response.status === 200) {
          toast.success('Cập nhật thông tin đội bóng thành công');
          setTeam({
            ...team!,
            ...updatedFields, // Cập nhật state team với dữ liệu mới
          });
        }
      } catch (error: any) {
        console.error('Failed to update team details:', error);
        toast.error('Failed to update team information');
      }
    },
  });

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        if (teamId && userId && tournamentId) {
          const response = await axios.get(`/api/teams/${teamId}`, {
            params: { teamId, userId, tournamentId },
          });
          const teamData = response.data.team;

          if (teamData) {
            setInitialValues({
              name: teamData.teamName,
              email: teamData.email,
              phone: teamData.phone,
              address: teamData.address,
              coach: teamData.coach,
            });
            setTeam(teamData);
          }
        }
      } catch (error) {
        console.error('Failed to fetch team details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId, userId, tournamentId]);

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="grid h-full w-full rounded-3xl border-gray-100 bg-white bg-clip-border p-3 font-dm shadow-2xl shadow-gray-600/10 dark:!bg-navy-800 dark:shadow-none"
    >
      <div className="mt-3 flex gap-5 lg:grid lg:grid-cols-12 2xl:grid-cols-12">
        <div className="col-span-6 h-full w-full">
          {/* name */}
          <div className="mb-1 mt-3 flex flex-col gap-6">
            <Input
              label="Tên đội bóng"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
            {formik.errors.name && (
              <p className="-mt-4 w-full text-sm font-[0.75rem] text-red-500">
                {formik.errors.name}
              </p>
            )}
          </div>

          <div className="mb-1 mt-4 flex flex-col gap-6">
            <Input
              label="Địa chỉ email đại diện"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
            />
            {formik.errors.email && (
              <p className="-mt-4 w-full text-sm font-[0.75rem] text-red-500">
                {formik.errors.email}
              </p>
            )}
          </div>

          {/* phone */}
          <div className="mb-1 mt-4 flex flex-col gap-6">
            <Input
              label="Nhập số điện thoại liêm hệ"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
            />
            {formik.errors.phone && (
              <p className="-mt-4 w-full text-sm font-[0.75rem] text-red-500">
                {formik.errors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="col-span-6 h-full w-full">
          {/* coachname */}
          <div className="mb-1 mt-3 flex flex-col gap-6">
            <Input
              label="Nhập tên huấn luyện viên"
              name="coach"
              value={formik.values.coach}
              onChange={formik.handleChange}
            />
            {formik.errors.coach && (
              <p className="-mt-4 w-full text-sm font-[0.75rem] text-red-500">
                {formik.errors.coach}
              </p>
            )}
          </div>
          <div className="mb-1 mt-4 flex flex-col gap-6">
            <Input
              label="Nhập địa chỉ của bạn"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
            />
            {formik.errors.address && (
              <p className="-mt-4 w-full text-sm font-[0.75rem] text-red-500"></p>
            )}
          </div>
          <Button
            type="submit"
            className="mt-4 w-full bg-navy-800 text-white hover:bg-navy-700"
          >
            Cập nhật thông tin
          </Button>
        </div>
      </div>
      <div></div>
    </form>
  );
};

export default Information;
