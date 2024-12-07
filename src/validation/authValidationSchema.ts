import * as Yup from 'yup';

export const signUpValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(4, 'Tên phải chứa ít nhất 4 ký tự')
    .required('Vui lòng nhập tên đăng nhập'),
  email: Yup.string()
    .required('Vui lòng nhập địa chỉ email')
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'địa chỉ email không hợp lệ'),
  password: Yup.string()
    .required('Vui lòng nhập mật khẩu')
    .min(8, 'Mật khẩu phải chứa ít nhất 8 ký tự')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Mật khẩu phải chứa ít nhất 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
    ),
});

export const signInValidationSchema = Yup.object().shape({
  email: Yup.string()
    .required('Vui lòng nhập email')
    .email('Email không hợp lệ'),
  password: Yup.string().required('Vui lòng nhập mật khẩu'),
});
