'use client';

import { Formik, Form } from 'formik';
import { emailSchema } from '../../validation/profileValidationSchema';
import { useAccountActions } from '../../hooks/useAccountActions';
import InputField from '../../components/FormElements/InputField';
import Button from '../../components/Button/Button';
import GoBackButton from '../../components/Button/GoBackButton';
import { Toaster, toast } from 'sonner';
import { Typography } from '@material-tailwind/react';
import NavLink from 'components/link/NavLink';

export default function Page() {
  const { handleResetPassword } = useAccountActions();

  return (
    <div className="flex w-full justify-center">
      <div className="w-full md:w-80">
        <NavLink href="/auth/sign-in" className="mt-0 w-max lg:pt-10">
          <div className="mx-auto my-5 ml-0 flex h-fit w-fit items-center hover:cursor-pointer">
            <svg
              width="8"
              height="12"
              viewBox="0 0 8 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.70994 2.11997L2.82994 5.99997L6.70994 9.87997C7.09994 10.27 7.09994 10.9 6.70994 11.29C6.31994 11.68 5.68994 11.68 5.29994 11.29L0.709941 6.69997C0.319941 6.30997 0.319941 5.67997 0.709941 5.28997L5.29994 0.699971C5.68994 0.309971 6.31994 0.309971 6.70994 0.699971C7.08994 1.08997 7.09994 1.72997 6.70994 2.11997V2.11997Z"
                fill="#A3AED0"
              />
            </svg>
            <p className="ml-3 text-sm text-gray-600">Go back</p>
          </div>
        </NavLink>

        <Typography variant="h4">Quên mật khẩu!</Typography>

        <Typography variant="small" className="my-5">
          Vui lòng nhập email của bạn để nhận liên kết đặt lại mật khẩu.
        </Typography>

        <Formik
          initialValues={{
            email: '',
          }}
          validationSchema={emailSchema}
          onSubmit={(values, { resetForm }) =>
            handleResetPassword(values, resetForm)
          }
        >
          {(formik) => (
            <Form>
              <InputField
                label="Email"
                name="email"
                type="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                error={formik.touched.email && formik.errors.email}
                placeholder="name@company.com"
                className="mb-6"
              />

              <Button variant="primary" type="submit" size="full">
                Send Link
              </Button>
            </Form>
          )}
        </Formik>

        {/* {toastMessage && <Toast type={toastType}>{toastMessage}</Toast>} */}
      </div>
    </div>
  );
}
