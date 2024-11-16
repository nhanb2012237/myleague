import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../lib/hooks';
import {
  loginWithProvider,
  signIn,
  signUp,
} from '../lib/features/auth/authOperations';
import { toast } from 'sonner';

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await dispatch(signIn(values)).unwrap();
      toast.success('Đăng nhập thành công!');
      router.push('/tournament');
    } catch (error) {
      console.error('Error signing in');
    }
  };

  const handleLoginWithProvider = async (provider: 'google' | 'facebook') => {
    try {
      await dispatch(loginWithProvider({ provider })).unwrap();
      toast.success('Đăng nhập thành công!');
      router.push('/tournament');
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    }
  };

  const handleSignUp = async (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    const { name, email, password } = values;
    try {
      await dispatch(signUp({ email, password, displayName: name })).unwrap();
      toast.success('Đăng nhập thành công!');
      router.push('/tournament');
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  return { handleLogin, handleLoginWithProvider, handleSignUp };
}
