import { Formik, Form } from 'formik';
import { CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { Box } from '@mui/system';
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';
import { signInValidationSchema } from '../../../../../validation/authValidationSchema';
import { useAuth } from '../../../../../hooks/useAuth';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import InputField from 'components/FormElements/InputField';
import Button from 'components/Button/Button';

export default function SignInForm() {
  const { handleLogin } = useAuth();

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
      }}
      validationSchema={signInValidationSchema}
      validateOnChange={false}
      onSubmit={handleLogin}
    >
      {(formik) => (
        <Form>
          <div className="flex flex-col gap-6">
            <InputField
              label="Email"
              name="email"
              type="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              error={formik.touched.email && formik.errors.email}
              placeholder="name@company.com"
            />
            {/* {formik.errors.email && (
              <p className="-mt-4 w-full font-[0.75rem] text-red-500">
                {' '}
                {formik.errors.email}{' '}
              </p>
            )} */}

            <InputField
              label="Password"
              name="password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              error={formik.touched.password && formik.errors.password}
              placeholder="•••••••••••••"
            />
            {/* {formik.errors.password && (
              <p className="-mt-4 w-full font-[0.75rem] text-red-500">
                {' '}
                {formik.errors.password}{' '}
              </p>
            )} */}
          </div>

          {/* <ForgotPasswordLink /> */}
          <Button
            variant="primary"
            type="submit"
            size="full"
            className=" linear mt-7 w-full rounded-xl bg-brand-500 py-3 text-base font-bold  text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            Đăng nhập
          </Button>
        </Form>
      )}
    </Formik>
  );
}

// import { Formik, Form } from 'formik';
// import { CircularProgress, IconButton, InputAdornment } from '@mui/material';
// import { Box } from '@mui/system';
// import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';
// import { signUpValidationSchema } from '../../../../../validation/authValidationSchema';
// import { useAuth } from '../../../../../hooks/useAuth';
// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import * as yup from 'yup';
// import InputField from 'components/FormElements/InputField';
// import Button from 'components/Button/Button';

// export default function SignUpForm() {
//   const { handleSignUp } = useAuth();

//   return (
//     <Formik
//       initialValues={{
//         name: '',
//         email: '',
//         password: '',
//       }}
//       validationSchema={signUpValidationSchema}
//       validateOnChange={false}
//       onSubmit={handleSignUp}
//     >
//       {(formik) => (
//         <Form className="flex flex-col gap-5">
//           <InputField
//             label="Tên đăng nhập"
//             name="name"
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             value={formik.values.name}
//             error={formik.touched.name && formik.errors.name}
//             placeholder="Tên đăng nhập"
//           />

//           <InputField
//             label="Email"
//             name="email"
//             type="email"
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             value={formik.values.email}
//             error={formik.touched.email && formik.errors.email}
//             placeholder="example@mail.com"
//           />

//           <InputField
//             label="Password"
//             name="password"
//             type="password"
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             value={formik.values.password}
//             error={formik.touched.password && formik.errors.password}
//             placeholder="Password"
//           />

//           <Button
//             variant="primary"
//             type="submit"
//             size="full"
//             className=" linear mt-5 w-full rounded-xl bg-brand-500 py-3 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
//           >
//             Đăng ký
//           </Button>
//         </Form>
//       )}
//     </Formik>
//   );
// }
