import { useAuth } from '../../../../../hooks/useAuth';
import Button from '../../../../../components/Button/Button';
import GoogleIcon from '../../../../../components/icons/GoogleIcon';
import FacebookIcon from '../../../../../components/icons/FacebookIcon';

export default function SignInOAuthButtons() {
  const { handleLoginWithProvider } = useAuth();

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="white"
        size="full"
        icon={<GoogleIcon />}
        onClick={() => handleLoginWithProvider('google')}
      >
        Sign In with Google
      </Button>
      {/* 
        <Button
          variant="facebook"
          size="full"
          icon={<FacebookIcon />}
          onClick={() => handleLoginWithProvider('facebook')}
        >
          Sign In with Facebook
        </Button> */}
    </div>
  );
}
