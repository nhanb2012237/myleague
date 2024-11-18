import { storage } from '../../config/firebaseconfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAppDispatch, useAppSelector } from '../../src/lib/hooks';
import {
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  sendlVerificationEmail,
  resetUserPassword,
} from '../../src/lib/features/auth/authOperations';
import { toast } from 'sonner';

export const useAccountActions = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleSaveName = async (values: any, toggleEdit: () => void) => {
    try {
      await dispatch(
        updateUserProfile({ displayName: values.displayName }),
      ).unwrap();
      toggleEdit();
      if (user && user.displayName !== values.displayName) {
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    }
  };

  const handleUpdateEmail = async (values: any, toggleEdit: () => void) => {
    try {
      await dispatch(updateUserEmail({ email: values.email })).unwrap();
      toggleEdit();
      if (user && user.email !== values.email) {
        toast.success('Email successfully updated!');
      }
    } catch (error) {
      console.error('Error updating email:', error);
      toast.error('Error updating email');
    }
  };

  const handleSendVerificationEmail = async () => {
    try {
      await dispatch(sendlVerificationEmail());
      toast.success('Verification email sent successfully!');
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Error sending verification email');
    }
  };

  const handleUpdatePassword = async (values: any, toggleEdit: () => void) => {
    try {
      await dispatch(
        updateUserPassword({ newPassword: values.newPassword }),
      ).unwrap();
      toggleEdit();
      toast.success('Password successfully updated!');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Error updating password');
    }
  };

  const handleResetPassword = async (values: any, resetForm: () => void) => {
    try {
      await dispatch(resetUserPassword({ email: values.email })).unwrap();
      toast.success('Vui lòng kiểm tra email để đặt lại mật khẩu.');
      resetForm();
    } catch (error) {
      console.log('Error sending password reset link:', error);
      toast.error('Error sending password reset link. Please try again.');
    }
  };

  const handleAvatarUpload = async (file: File, userId: string) => {
    try {
      const storageRef = ref(storage, `avatars/${userId}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      await dispatch(updateUserProfile({ photoURL: downloadURL })).unwrap();
      toast.success('Avatar updated successfully!');
      return downloadURL;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error uploading avatar');
      return null;
    }
  };

  return {
    user,
    handleSaveName,
    handleUpdateEmail,
    handleSendVerificationEmail,
    handleUpdatePassword,
    handleResetPassword,
    handleAvatarUpload,
  };
};
