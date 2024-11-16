// 'use client';
// import React, { useState, useEffect } from 'react';
// import { Invoice } from '../../../lib/types';
// import InvoiceForm from './InvoiceForm';
// import Button from '../../../components/Button/Button';
// import PlusIcon from '../../../components/icons/PlusIcon';
// import { useToggleState } from '../../../hooks/useToggleState';
// import CreateTournamentDialog from './TournamentForm1';
// import { auth } from '../../../../config/firebaseconfig'; // Đường dẫn tương ứng
// import { onAuthStateChanged } from 'firebase/auth';
// import ImageCropProvider from 'providers/ImageCropProvider';

// interface InvoiceFormWrapperProps {
//   initialValues: Invoice;
//   action: 'new' | 'edit';
//   onTournamentsReload: () => void; // Thêm hàm này để tải lại danh sách giải đấu
// }

// export default function InvoiceFormWrapper({
//   initialValues,
//   action,
//   onTournamentsReload, // Nhận hàm này từ props
// }: InvoiceFormWrapperProps) {
//   const { state: isOpen, toggleState } = useToggleState();
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [tournamentId, setTournamentId] = useState<string | null>(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUserId(user.uid);
//       } else {
//         setUserId(null);
//       }
//     });
//     return () => unsubscribe();
//   }, []);
//   // console.log('userId', userId);
//   return (
//     <>
//       <Button
//         variant="primary"
//         icon={<PlusIcon />}
//         onClick={() => setDialogOpen(true)}
//         className="mt-5"
//       >
//         TẠO<span className="hidden md:inline"> GIẢI ĐẤU MỚI</span>
//       </Button>
//       <div>
//         <ImageCropProvider>
//           <CreateTournamentDialog
//             onTournamentCreated={(id) => {
//               setTournamentId(id);
//               onTournamentsReload();
//               // Gọi hàm tải lại danh sách giải đấu
//             }}
//             open={dialogOpen}
//             onClose={() => setDialogOpen(false)}
//             userId={userId ? userId.toString() : ''}
//             onTournamentsReload={onTournamentsReload}
//           />
//         </ImageCropProvider>
//       </div>
//     </>
//   );
// }
import React, { useState, useEffect } from 'react';
import { Invoice } from '../../../lib/types';
import InvoiceForm from './InvoiceForm';
import Button from '../../../components/Button/Button';
import PlusIcon from '../../../components/icons/PlusIcon';
import { useToggleState } from '../../../hooks/useToggleState';
import CreateTournamentDialog from './TournamentForm1';
import { auth } from '../../../../config/firebaseconfig'; // Đường dẫn tương ứng
import { onAuthStateChanged } from 'firebase/auth';
import ImageCropProvider from 'providers/ImageCropProvider';

interface InvoiceFormWrapperProps {
  initialValues: Invoice;
  action: 'new' | 'edit';
  onTournamentsReload: () => void; // Thêm hàm này để tải lại danh sách giải đấu
}

export default function InvoiceFormWrapper({
  initialValues,
  action,
  onTournamentsReload, // Nhận hàm này từ props
}: InvoiceFormWrapperProps) {
  const { state: isOpen, toggleState } = useToggleState();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [tournamentId, setTournamentId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Button
        variant="primary"
        icon={<PlusIcon />}
        onClick={() => setDialogOpen(true)}
        className="mt-5"
      >
        TẠO<span className="hidden md:inline"> GIẢI ĐẤU MỚI</span>
      </Button>

      <div>
        <ImageCropProvider>
          <CreateTournamentDialog
            onTournamentCreated={(id) => {
              setTournamentId(id);
              onTournamentsReload();
              // Gọi hàm tải lại danh sách giải đấu
            }}
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            userId={userId ? userId.toString() : ''}
            onTournamentsReload={onTournamentsReload}
          />
        </ImageCropProvider>
      </div>
    </>
  );
}
