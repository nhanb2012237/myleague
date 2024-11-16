'use client';

import React, { useEffect, createContext, useContext, ReactNode } from 'react';
import { useToggleState } from '../../hooks/useToggleState';
import Button from '../Button/Button';
import { IoMdClose } from 'react-icons/io';
import { Typography } from '@material-tailwind/react';
import { FaRegTrashAlt } from 'react-icons/fa';

interface ModalContextProps {
  closeModal: () => void;
  handleConfirm: () => void;
}

const ModalContext = createContext<ModalContextProps>({
  closeModal: () => {},
  handleConfirm: () => {},
});

interface ModalProps {
  handleConfirm: () => void;
  children: ReactNode;
  trigger?: ReactNode | string | null;
  shouldCloseOnConfirm?: boolean;
  isOpen?: boolean;
  toggleState?: () => void;
}

function Modal({
  handleConfirm,
  children,
  trigger,
  shouldCloseOnConfirm = true,
  isOpen: externalIsOpen,
  toggleState: externalToggleState,
}: ModalProps) {
  const { state: internalIsOpen, toggleState: internalToggleState } =
    useToggleState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const toggleState = externalToggleState || internalToggleState;

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      toggleState();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      toggleState();
    }
  };

  const handleConfirmAction = () => {
    handleConfirm();
    if (shouldCloseOnConfirm) {
      toggleState();
    }
  };

  const renderTrigger = () => {
    if (typeof trigger === 'string') {
      return (
        <Button variant="primary" onClick={toggleState} className="w-full px-5">
          {trigger}
        </Button>
      );
    } else if (React.isValidElement(trigger)) {
      return React.cloneElement(trigger as React.ReactElement, {
        onClick: toggleState,
        className: `${trigger.props.className || ''} cursor-pointer`,
      });
    } else {
      return null;
    }
  };

  return (
    <ModalContext.Provider
      value={{ closeModal: toggleState, handleConfirm: handleConfirmAction }}
    >
      <>
        {renderTrigger()}

        {isOpen && (
          <div
            onClick={handleBackdropClick}
            className="bg-dark-darkest/50 fixed left-0 right-0 top-0 z-50 flex h-full max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0"
          >
            <div className="relative max-h-full w-80 md:w-[480px]">
              <div className="dark:bg-dark-light relative rounded-lg bg-white p-8 shadow-item md:p-12">
                <button
                  type="button"
                  onClick={toggleState}
                  className="stroke-dark-darkest dark:stroke-gray-light absolute right-6 top-6"
                >
                  <IoMdClose />
                  <span className="sr-only">Close modal</span>
                </button>

                {children}
              </div>
            </div>
          </div>
        )}
      </>
    </ModalContext.Provider>
  );
}

function Header({ children }: { children: ReactNode }) {
  return (
    <Typography variant="h3" className="text-heading-m mb-3">
      {children}
    </Typography>
  );
}

function Body({ children }: { children: ReactNode }) {
  return (
    <Typography
      variant="small"
      className="text-body-variant text-gray-medium mb-[14px]"
    >
      {children}
    </Typography>
  );
}

function Message({ children }: { children: ReactNode }) {
  return (
    <Typography variant="small" className="text-body text-gray-medium">
      {children}
    </Typography>
  );
}

function DiscardBtn({ children }: { children: ReactNode }) {
  const { closeModal } = useContext(ModalContext);

  return <Button onClick={closeModal}>{children}</Button>;
}

function ConfirmBtn({
  children,
  variant = 'red',
}: {
  children: ReactNode;
  variant?:
    | 'red'
    | 'primary'
    | 'default'
    | 'white'
    | 'dark'
    | 'icon'
    | 'facebook';
}) {
  const { handleConfirm } = useContext(ModalContext);

  return (
    <Button variant={variant} type="submit" onClick={handleConfirm}>
      {children}
    </Button>
  );
}

function ConfirmICon({
  children,
  variant = 'red',
}: {
  children: ReactNode;
  variant?:
    | 'red'
    | 'primary'
    | 'default'
    | 'white'
    | 'dark'
    | 'icon'
    | 'facebook';
}) {
  const { handleConfirm } = useContext(ModalContext);

  return (
    <FaRegTrashAlt type="submit" onClick={handleConfirm}>
      {children}
    </FaRegTrashAlt>
  );
}

Modal.Header = Header;
Modal.Body = Body;
Modal.Message = Message;
Modal.DiscardBtn = DiscardBtn;
Modal.ConfirmBtn = ConfirmBtn;
Modal.ConfirmICon = ConfirmICon;

export default Modal;
