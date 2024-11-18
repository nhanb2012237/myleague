'use client';
import { useEffect } from 'react';
import Default from 'components/auth/variants/DefaultAuthLayout';
import Checkbox from 'components/checkbox';
import SignInForm from 'components/auth/variants/DefaultAuthLayout/sign-in/SignInForm';
import { toast } from 'sonner';
import { useAppSelector, useAppStore } from '../../../lib/hooks';
import AuthError from 'components/auth/variants/DefaultAuthLayout/AuthError';
import SignInOAuthButtons from 'components/auth/variants/DefaultAuthLayout/sign-in/SignInOAuthButtons';
import ForgotPasswordLink from 'components/auth/ForgotPasswordLink';
import Userview from 'components/auth/Userview';

function SignInDefault() {
  const error = useAppSelector((state) => state.auth.errors.loginError);
  useEffect(() => {
    if (error) {
      toast.error(<AuthError errorCode={error.code} />);
    }
  }, [error]);
  return (
    <Default
      maincard={
        <div className=" mt-10 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
          {/* Sign in section */}
          <div className="mt-[5vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
            <h3 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
              Đăng nhập
            </h3>
            <p className="mb-5 ml-1 text-base text-gray-600">
              Điền email và mật khẩu để đăng nhập!
            </p>
            {/* <div className="mb-5 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-lightPrimary hover:cursor-pointer dark:bg-navy-800 dark:text-white">
              <div className="rounded-full text-xl">
                <FcGoogle />
              </div>
              <p className="text-sm font-medium text-navy-700 dark:text-white">
                Sign In with Google
              </p>
            </div> */}
            <SignInOAuthButtons />
            <div className="mb-5 mt-5 flex items-center  gap-3">
              <div className="h-px w-full bg-gray-200 dark:!bg-navy-700" />
              <p className="text-base text-gray-600"> or </p>
              <div className="h-px w-full bg-gray-200 dark:!bg-navy-700" />
            </div>

            <SignInForm />

            <div className="mt-5 flex gap-10">
              <div className=" w-full  flex-1 items-start">
                <span className="text-sm font-bold  text-gray-600 dark:text-gray-500">
                  Chưa có tài khoản?
                </span>
                <div>
                  <a
                    href="/auth/sign-up"
                    className=" text-sm font-bold text-brand-500 hover:text-brand-600 dark:text-white"
                  >
                    Tạo tài khoản
                  </a>
                </div>

                <ForgotPasswordLink />
              </div>

              <div className="">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-500">
                  Bạn là đại diện team?
                </span>
                <Userview />
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}

export default SignInDefault;
