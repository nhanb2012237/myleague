'use client';
import InputField from 'components/fields/InputField';
import Default from 'components/auth/variants/DefaultAuthLayout';
import TournamentsList from '../../components/admin/tournament/TournamentsList';
import { auth } from '../../../config/firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';
import { newInvoice } from '../../components/admin/tournament/initialValues';
import NoTournament from '../../components/admin/tournament/NoTournament';
import InvoiceFormWrapper from '../../components/admin//tournament/InvoiceFormWrapper';
import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from 'components/Loader/Spinner';
import { getAuth } from 'firebase/auth';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { Tournament } from '../../models/entities';
import LogoutButton from '../../components/Button/GoBackButton';
import ArrowIcon from '../../components/icons/ArrowIcon';
import { logout } from '../../lib/features/auth/authOperations';
import Button from 'components/Button/Button';
import PlusIcon from '../../components/icons/PlusIcon';
import Dropdown from 'components/dropdown';
import UserAvatar from '../../components/navbar/UserAvatar';
import Avatar from '../../components/icons/Avatar';

function SignInDefault() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Set loading mặc định là true

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        console.log('User authenticated, ID:', user.uid);
      } else {
        setUserId(null);
        setLoading(false); // Dừng loading khi không có user
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tournament/get`, {
        params: { userId },
      });
      setTournaments(response.data.tournaments);
      setLoading(false);
      console.log('response', response.data.tournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTournaments();
    }
  }, [userId]);

  const content = (
    <div className="mb-6 flex items-center gap-6 md:mb-[31px]">
      <div className="rotate-90">
        <ArrowIcon />
      </div>
    </div>
  );

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Đăng xuất thành công');
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  // console.log('tournaments', tournaments);

  return (
    <Default
      maincard={
        <div className="mb-16 mt-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
          {/* Sign in section */}
          <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[600px]">
            <div className=" mb-3 flex items-center justify-between md:mb-[55px] lg:mb-[60px] ">
              <div className=" relative col-span-8  flex  gap-5 md:gap-0">
                <Button
                  variant="primary"
                  icon={<PlusIcon />}
                  onClick={() => handleLogout()}
                  className="mt-5"
                >
                  Đăng <span className="hidden md:inline"> Xuất</span>
                </Button>
              </div>

              <div className=" relative col-span-8 ml-auto flex items-center gap-5 md:gap-0">
                <InvoiceFormWrapper
                  initialValues={newInvoice}
                  action="new"
                  onTournamentsReload={fetchTournaments}
                />
              </div>
            </div>

            <div className=" items-center justify-between ">
              {tournaments.length === 0 ? (
                <NoTournament />
              ) : (
                <TournamentsList
                  userId={userId}
                  setLoading={setLoading}
                  tournaments={tournaments}
                />
              )}
            </div>

            <div className="mb-6 flex items-center  gap-3"></div>
          </div>
        </div>
      }
    />
  );
}

export default SignInDefault;
