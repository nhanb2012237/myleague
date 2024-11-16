import Modal from './Modal';
import { FaRegTrashAlt } from 'react-icons/fa';

export default function ConfirmDeletionModal({
  handleConfirm,
  id,
}: {
  handleConfirm: () => void;
  id: string;
}) {
  return (
    <Modal
      handleConfirm={handleConfirm}
      trigger="Xoá"
    >
      <Modal.Header>Xác nhận xóa</Modal.Header>
      <Modal.Body>
        Bạn có chắc chắn xóa ? Hành động này không thể hoàn tác.
      </Modal.Body>

      <div className="flex justify-end gap-2">
        <Modal.DiscardBtn>Thoát</Modal.DiscardBtn>
        <Modal.ConfirmBtn>Xác nhận</Modal.ConfirmBtn>
      </div>
    </Modal>
  );
}
