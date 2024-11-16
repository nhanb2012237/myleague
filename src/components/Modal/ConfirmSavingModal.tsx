import Modal from './Modal';

export default function ConfirmSavingModal({
  handleConfirm,
  id,
}: {
  handleConfirm: () => void;
  id: string;
}) {
  return (
    <Modal handleConfirm={handleConfirm} trigger="Xác nhận">
      <Modal.Header>Xác nhận lưu</Modal.Header>
      <Modal.Body>
        Bạn có chắc chắn lưu ? Hành động này không thể hoàn tác.
      </Modal.Body>

      <div className="flex justify-end gap-2">
        <Modal.DiscardBtn>Thoát</Modal.DiscardBtn>
        <Modal.ConfirmBtn>Xác nhận</Modal.ConfirmBtn>
      </div>
    </Modal>
  );
}
