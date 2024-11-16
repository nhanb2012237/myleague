import Modal from './Modal';
import Cropper from '../Cropper/Cropper';
import { ZoomSlider, RotationSlider } from '../Cropper/Sliders';

export default function AvatarEditModal({
  isOpen,
  toggleState,
  handleDone,
}: {
  isOpen: boolean;
  toggleState: () => void;
  handleDone: () => void;
}) {
  return (
    <Modal
      handleConfirm={handleDone}
      trigger={null}
      isOpen={isOpen}
      toggleState={toggleState}
    >
      <Modal.Header>Edit profile picture</Modal.Header>
      <Modal.Body>
        <div className="flex justify-center pt-4">
          <div className="bg-dark relative mb-4 h-60 w-60 rounded-lg">
            <Cropper />
          </div>
        </div>
        <ZoomSlider />
        <RotationSlider />
      </Modal.Body>

      <div className="flex justify-center gap-2">
        <Modal.DiscardBtn>Cancel</Modal.DiscardBtn>
        <Modal.ConfirmBtn variant="primary">Done & Save</Modal.ConfirmBtn>
      </div>
    </Modal>
  );
}
