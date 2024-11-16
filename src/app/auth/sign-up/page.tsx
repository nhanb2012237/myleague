'use client';
import InputField from 'components/fields/InputField';
import Default from 'components/auth/variants/DefaultAuthLayout';
import { FcGoogle } from 'react-icons/fc';
import Checkbox from 'components/checkbox';
import SignUpForm from 'components/auth/variants/DefaultAuthLayout/sign-up/SignUpForm';
import { LoginPayload } from '../../../models/auth';
import { decodeUrl, getErrorMessage } from '../../../utils';
import { Paper, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import Button from 'components/Button/Button';

function SignUpDefault() {
  const router = useRouter();
  const { handleLoginWithProvider } = useAuth();

  return (
    <Default
      maincard={
        <div className="mb-16 mt-0 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
          {/* Sign in section */}
          <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
            <h3 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
              Đăng ký
            </h3>
            <p className="mb-9 ml-1 text-base text-gray-600">
              Điền thông tin để đăng ký tài khoản!
            </p>
            <div
              className="mb-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-lightPrimary hover:cursor-pointer dark:bg-navy-800 dark:text-white"
              onClick={() => handleLoginWithProvider('google')}
            >
              <div className="rounded-full text-xl">
                <FcGoogle />
              </div>
              <p className="text-sm font-medium text-navy-700 dark:text-white">
                Đăng nhập với Google
              </p>
            </div>
            <div className="mb-6 flex items-center  gap-3">
              <div className="h-px w-full bg-gray-200 dark:!bg-navy-700" />
              <p className="text-base text-gray-600"> or </p>
              <div className="h-px w-full bg-gray-200 dark:!bg-navy-700" />
            </div>

            <SignUpForm />
          </div>
        </div>
      }
    />
  );
}

export default SignUpDefault;
