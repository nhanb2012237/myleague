// // import React, { useState, ChangeEvent, useRef } from 'react';
// // import { useFormik } from 'formik';
// // import { useImageCropContext } from '../../../providers/ImageCropProvider';
// // import * as Yup from 'yup';
// // import Image from 'next/image';
// // import axios from 'axios';
// // import { Player } from '../../../models/entities';
// // import PlayerDisplay from './AvatarDisplay';
// // import AvatarEditModal from '../../Modal/AvatarEditModal';
// // import { useToggleState } from '../../../hooks/useToggleState';
// // import { readFile } from '../../../helpers/cropImage';
// // import PlayerUpload from './PlayerUpload';

// // import {
// //   Input,
// //   Button,
// //   Dialog,
// //   DialogHeader,
// //   DialogBody,
// //   DialogFooter,
// //   Card,
// //   Typography,
// // } from '@material-tailwind/react';
// // import { toast } from 'sonner';

// // interface AddPlayerDialogProps {
// //   open: boolean;
// //   onClose: () => void;
// //   teamId: string;
// //   userId: string;
// //   onAddPlayer: () => void;
// //   tournamentId: string; // Add this prop to trigger refresh
// // }

// // const AddPlayerDialog: React.FC<AddPlayerDialogProps> = ({
// //   open,
// //   onClose,
// //   teamId,
// //   userId,
// //   onAddPlayer,
// //   tournamentId,
// // }) => {
// //   const [img, setImg] = useState<File | null>(null);
// //   const [imagePreview, setImagePreview] = useState<string>('');
// //   const [uploading, setUploading] = useState(false);
// //   const [player, setPlayer] = useState<Player | null>(null);
// //   const { state: isOpen, toggleState } = useToggleState();
// //   const fileInputRef = useRef<HTMLInputElement>(null);
// //   const { getProcessedImage, setImage, resetStates } = useImageCropContext();

// //   const formik = useFormik({
// //     initialValues: {
// //       name: '',
// //       displayName: '',
// //       email: '',
// //       jerseyNumber: '',
// //       phone: '',
// //       position: '',
// //       dateOfBirth: '',
// //     },
// //     validationSchema: Yup.object({
// //       name: Yup.string()
// //         .required('Tên cầu thủ là bắt buộc')
// //         .min(4, 'Tên cầu thủ phải có ít nhất 4 ký tự'),
// //       email: Yup.string()
// //         .required('Email là bắt buộc')
// //         .email('Email không hợp lệ'),
// //       displayName: Yup.string()
// //         .required('Tên thi đấu là bắt buộc')
// //         .min(4, 'Tên cầu thủ phải có ít nhất 4 ký tự'), // Thêm xác thực cho "Tên thi đấu"
// //       phone: Yup.string()
// //         .required('Số điện thoại là bắt buộc')
// //         .matches(
// //           /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
// //           'Số điện thoại không hợp lệ',
// //         ),
// //       position: Yup.string().required('Vị trí là bắt buộc'),
// //       jerseyNumber: Yup.number().required('Số áo là bắt buộc'),
// //       dateOfBirth: Yup.date().required('Ngày sinh là bắt buộc'),
// //     }),
// //     onSubmit: async (values) => {
// //       const formData = new FormData();
// //       formData.append('playerName', values.name);
// //       formData.append('displayName', values.displayName);
// //       formData.append('email', values.email);
// //       formData.append('phone', values.phone);
// //       formData.append('position', values.position);
// //       formData.append('jerseyNumber', values.jerseyNumber.toString());
// //       formData.append('dateOfBirth', values.dateOfBirth);
// //       formData.append('teamId', teamId);
// //       formData.append('tournamentId', tournamentId);
// //       formData.append('userId', userId);

// //       if (img) {
// //         formData.append('files', img);
// //         console.log('image', img);
// //       }
// //       console.log('formDataplayer:', formData);
// //       try {
// //         setUploading(true);
// //         const response = await fetch('/api/players/create', {
// //           method: 'POST',
// //           body: formData,
// //         });
// //         if (!response.ok) {
// //           throw new Error('Lỗi khi gửi dữ liệu');
// //         }

// //         const data = await response.json();
// //         console.log('Kết quả:', data);

// //         toast.success('Cầu thủ đã được thêm thành công!');
// //         formik.resetForm();
// //         setImagePreview('');
// //         setImg(null);
// //         onClose();
// //         onAddPlayer(); // Call this to trigger refresh
// //       } catch (error) {
// //         toast.error('Không thể thêm cầu thủ. Vui lòng thử lại.');
// //         console.error('Lỗi khi thêm cầu thủ:', error);
// //       } finally {
// //         setUploading(false);
// //       }
// //     },
// //   });

// //   // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //   //   const file = e.target.files?.[0];
// //   //   setImage(file ?? null);

// //   //   if (file) {
// //   //     const reader = new FileReader();
// //   //     reader.onloadend = () => {
// //   //       if (typeof reader.result === 'string') {
// //   //         setImagePreview(reader.result);
// //   //       } else {
// //   //         console.error('Kết quả FileReader không phải là chuỗi');
// //   //       }
// //   //     };
// //   //     reader.readAsDataURL(file);
// //   //   }
// //   // };

// //   const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
// //     const files = event.target.files;
// //     if (files && files?.length > 0) {
// //       const file = files[0];
// //       if (!file.type.startsWith('image/')) {
// //         toast.error('Invalid file type. Please upload an image file.');
// //         return;
// //       }

// //       const imageDataUrl = await readFile(file);
// //       setImage(imageDataUrl as string);
// //       toggleState();
// //     }

// //     if (fileInputRef.current) {
// //       fileInputRef.current.value = '';
// //     }
// //   };

// //   const handleClose = () => {
// //     // Clear image preview and file
// //     setImagePreview('');
// //     setImage(null);
// //     formik.resetForm();
// //     onClose();
// //   };

// //   const handleDone = async () => {
// //     const avatar = await getProcessedImage(); // Lấy ảnh đã được crop và xử lý
// //     if (avatar) {
// //       setImg(avatar as File);
// //       const reader = new FileReader();
// //       reader.onloadend = () => {
// //         if (typeof reader.result === 'string') {
// //           setImagePreview(reader.result);
// //         } else {
// //           console.error('Kết quả FileReader không phải là chuỗi');
// //         }
// //       };
// //       reader.readAsDataURL(avatar); // Hiển thị ảnh đã crop
// //     }
// //   };

// //   return (
// //     <Dialog size="lg" open={open} handler={onClose}>
// //       <DialogHeader>Thêm cầu thủ</DialogHeader>
// //       <DialogBody className=" space-y-4 pb-6">
// //         {/* <div className="col-span-5 h-full w-full rounded-xl bg-lightPrimary dark:!bg-navy-700 2xl:col-span-6">
// //           <button className="flex h-full w-full flex-col items-center justify-center rounded-xl border-[2px] border-dashed border-gray-200 py-3 dark:!border-navy-700 lg:pb-0">
// //             <MdFileUpload className="text-[80px] text-brand-500 dark:text-white"

// //             />
// //             <h4 className="text-xl font-bold text-brand-500 dark:text-white">
// //               Upload Files
// //             </h4>
// //             <p className="mt-2 text-sm font-medium text-gray-600">
// //               PNG, JPG and GIF files are allowed
// //             </p>
// //           </button>
// //         </div> */}
// //         {/* <div className=" grid w-full grid-cols-5  gap-3 rounded-[20px] bg-white bg-clip-border p-3 font-dm shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none lg:!grid-cols-5">
// //           <div className="col-span-2 h-full w-full rounded-xl bg-lightPrimary dark:!bg-navy-700 2xl:col-span-6">
// //             {imagePreview ? (
// //               <Image
// //                 src={imagePreview}
// //                 alt="Hình ảnh xem trước"
// //                 className="mt-4 h-32 w-32 rounded object-cover"
// //                 width={150}
// //                 height={130}
// //               />
// //             ) : (
// //               <PlayerUpload
// //                 fileInputRef={fileInputRef}
// //                 handleFileChange={handleFileChange}
// //               />
// //             )}

// //             <AvatarEditModal
// //               isOpen={isOpen}
// //               toggleState={toggleState}
// //               handleDone={handleDone}
// //             />
// //           </div>

// //           <div className="col-span-3 flex h-full w-full flex-col justify-center overflow-hidden rounded-xl bg-white pb-4 pl-3 dark:!bg-navy-800">
// //             <form onSubmit={formik.handleSubmit}>
// //               <div className="mb-4">
// //                 <Input
// //                   label="Tên cầu thủ"
// //                   name="name"
// //                   value={formik.values.name}
// //                   onChange={formik.handleChange}
// //                   onBlur={formik.handleBlur}
// //                   error={formik.touched.name && Boolean(formik.errors.name)}
// //                 />
// //               </div>

// //               <div className="mb-4">
// //                 <Input
// //                   label="Email"
// //                   name="email"
// //                   value={formik.values.email}
// //                   onChange={formik.handleChange}
// //                   onBlur={formik.handleBlur}
// //                   error={formik.touched.email && Boolean(formik.errors.email)}
// //                 />
// //               </div>

// //               <div className="mb-4">
// //                 <Input
// //                   label="Số điện thoại"
// //                   name="phone"
// //                   value={formik.values.phone}
// //                   onChange={formik.handleChange}
// //                   onBlur={formik.handleBlur}
// //                   error={formik.touched.phone && Boolean(formik.errors.phone)}
// //                 />
// //               </div>

// //               <div className="mb-4">
// //                 <Input
// //                   label="Vị trí"
// //                   name="position"
// //                   value={formik.values.position}
// //                   onChange={formik.handleChange}
// //                   onBlur={formik.handleBlur}
// //                   error={
// //                     formik.touched.position && Boolean(formik.errors.position)
// //                   }
// //                 />
// //               </div>
// //             </form>
// //           </div>

// //         </div> */}

// //         <div className=" flex w-full gap-3 rounded-[20px] bg-white bg-clip-border pt-3 font-dm ">
// //           <div className=" h-full w-1/4 flex-none rounded-xl bg-lightPrimary dark:!bg-navy-700">
// //             {imagePreview ? (
// //               <Image
// //                 src={imagePreview}
// //                 alt="Hình ảnh xem trước"
// //                 className=" h-full w-full rounded object-cover"
// //                 width={300}
// //                 height={150}
// //               />
// //             ) : (
// //               <PlayerUpload
// //                 fileInputRef={fileInputRef}
// //                 handleFileChange={handleFileChange}
// //               />
// //             )}

// //             <AvatarEditModal
// //               isOpen={isOpen}
// //               toggleState={toggleState}
// //               handleDone={handleDone}
// //             />
// //           </div>

// //           <div className="  -mt-2 grid h-full w-full flex-grow gap-3 space-y-4 overflow-hidden   rounded-xl bg-white pb-4 pb-6 pl-3 dark:!bg-navy-800">
// //             <form
// //               onSubmit={formik.handleSubmit}
// //               className="col-span-12 mt-3 flex"
// //             >
// //               <div className="w-full md:w-1/2 ">
// //                 <div className="mb-4">
// //                   <Input
// //                     label="Số áo"
// //                     name="jerseyNumber"
// //                     value={formik.values.jerseyNumber}
// //                     onChange={formik.handleChange}
// //                     onBlur={formik.handleBlur}
// //                     error={
// //                       formik.touched.jerseyNumber &&
// //                       Boolean(formik.errors.jerseyNumber)
// //                     }
// //                   />
// //                 </div>

// //                 <div className="mb-4">
// //                   <Input
// //                     label="Họ và tên"
// //                     name="name"
// //                     value={formik.values.name}
// //                     onChange={formik.handleChange}
// //                     onBlur={formik.handleBlur}
// //                     error={formik.touched.name && Boolean(formik.errors.name)}
// //                   />
// //                 </div>

// //                 <div className="mb-4">
// //                   <Input
// //                     label="email"
// //                     name="email"
// //                     value={formik.values.email}
// //                     onChange={formik.handleChange}
// //                     onBlur={formik.handleBlur}
// //                     error={formik.touched.email && Boolean(formik.errors.email)}
// //                   />
// //                 </div>

// //                 <div className="mb-4">
// //                   <Input
// //                     label="Số điện thoại"
// //                     name="phone"
// //                     value={formik.values.phone}
// //                     onChange={formik.handleChange}
// //                     onBlur={formik.handleBlur}
// //                     error={formik.touched.phone && Boolean(formik.errors.phone)}
// //                   />
// //                 </div>
// //               </div>

// //               <div className="ml-3 w-full md:w-1/2 ">
// //                 <div className="mb-4">
// //                   <Input
// //                     label="Tên thi đấu"
// //                     name="displayName"
// //                     value={formik.values.displayName}
// //                     onChange={formik.handleChange}
// //                     onBlur={formik.handleBlur}
// //                     error={
// //                       formik.touched.displayName &&
// //                       Boolean(formik.errors.displayName)
// //                     }
// //                   />
// //                 </div>
// //                 <div className="mb-4">
// //                   <Input
// //                     type={'date'}
// //                     label="Ngày sinh"
// //                     name="dateOfBirth"
// //                     value={formik.values.dateOfBirth}
// //                     onChange={formik.handleChange}
// //                     onBlur={formik.handleBlur}
// //                     error={
// //                       formik.touched.dateOfBirth &&
// //                       Boolean(formik.errors.dateOfBirth)
// //                     }
// //                   />
// //                 </div>
// //                 <div className="mb-4">
// //                   <Input
// //                     label="Vị trí"
// //                     name="position"
// //                     value={formik.values.position}
// //                     onChange={formik.handleChange}
// //                     onBlur={formik.handleBlur}
// //                     error={
// //                       formik.touched.position && Boolean(formik.errors.position)
// //                     }
// //                   />
// //                 </div>
// //                 <div>
// //                   <Button
// //                     variant="outlined"
// //                     onClick={handleClose}
// //                     className="gap-5 bg-brand-500 text-white"
// //                   >
// //                     Hủy
// //                   </Button>
// //                   <Button
// //                     type="submit"
// //                     disabled={uploading}
// //                     className="ml-5 bg-brand-500 text-white"
// //                   >
// //                     {uploading ? 'Đang thêm...' : 'Thêm cầu thủ'}
// //                   </Button>
// //                 </div>
// //               </div>
// //             </form>
// //           </div>
// //         </div>
// //       </DialogBody>
// //       {/* <DialogFooter className="flex"></DialogFooter> */}
// //     </Dialog>
// //   );
// // };

// // export default AddPlayerDialog;
// import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
// import { useFormik } from 'formik';
// import { useImageCropContext } from '../../../providers/ImageCropProvider';
// import * as Yup from 'yup';
// import Image from 'next/image';
// import axios from 'axios';
// import { Player } from '../../../models/entities';
// import PlayerDisplay from './AvatarDisplay';
// import AvatarEditModal from '../../Modal/AvatarEditModal';
// import { useToggleState } from '../../../hooks/useToggleState';
// import { readFile } from '../../../helpers/cropImage';
// import PlayerUpload from './PlayerUpload';
// import * as faceapi from 'face-api.js';
// import { db } from '../../../../config/firebaseconfig';
// import { collection, addDoc } from 'firebase/firestore';

// import {
//   Input,
//   Button,
//   Dialog,
//   DialogHeader,
//   DialogBody,
//   DialogFooter,
//   Card,
//   Typography,
// } from '@material-tailwind/react';
// import { toast } from 'sonner';

// interface AddPlayerDialogProps {
//   open: boolean;
//   onClose: () => void;
//   teamId: string;
//   userId: string;
//   onAddPlayer: () => void;
//   tournamentId: string; // Add this prop to trigger refresh
// }

// const AddPlayerDialog: React.FC<AddPlayerDialogProps> = ({
//   open,
//   onClose,
//   teamId,
//   userId,
//   onAddPlayer,
//   tournamentId,
// }) => {
//   const [img, setImg] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string>('');
//   const [uploading, setUploading] = useState(false);
//   const { state: isOpen, toggleState } = useToggleState();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const { getProcessedImage, setImage, resetStates } = useImageCropContext();

//   useEffect(() => {
//     // Load the TinyFaceDetector model
//     const loadModels = async () => {
//       await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
//       await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
//       await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
//     };
//     loadModels();
//   }, []);

//   const formik = useFormik({
//     initialValues: {
//       name: '',
//       displayName: '',
//       email: '',
//       jerseyNumber: '',
//       phone: '',
//       position: '',
//       dateOfBirth: '',
//       faceDescriptor: [],
//     },
//     validationSchema: Yup.object({
//       name: Yup.string()
//         .required('Tên cầu thủ là bắt buộc')
//         .min(4, 'Tên cầu thủ phải có ít nhất 4 ký tự'),
//       email: Yup.string()
//         .required('Email là bắt buộc')
//         .email('Email không hợp lệ'),
//       displayName: Yup.string()
//         .required('Tên thi đấu là bắt buộc')
//         .min(4, 'Tên cầu thủ phải có ít nhất 4 ký tự'), // Thêm xác thực cho "Tên thi đấu"
//       phone: Yup.string()
//         .required('Số điện thoại là bắt buộc')
//         .matches(
//           /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
//           'Số điện thoại không hợp lệ',
//         ),
//       position: Yup.string().required('Vị trí là bắt buộc'),
//       jerseyNumber: Yup.number().required('Số áo là bắt buộc'),
//       dateOfBirth: Yup.date().required('Ngày sinh là bắt buộc'),
//     }),
//     onSubmit: async (values) => {
//       const formData = new FormData();
//       formData.append('playerName', values.name);
//       formData.append('displayName', values.displayName);
//       formData.append('email', values.email);
//       formData.append('phone', values.phone);
//       formData.append('position', values.position);
//       formData.append('jerseyNumber', values.jerseyNumber.toString());
//       formData.append('dateOfBirth', values.dateOfBirth);
//       formData.append('teamId', teamId);
//       formData.append('tournamentId', tournamentId);
//       formData.append('userId', userId);
//       formData.append('faceDescriptor', JSON.stringify(values.faceDescriptor));

//       if (img) {
//         formData.append('files', img);
//         console.log('image', img);
//       }
//       console.log('formDataplayer:', formData);
//       try {
//         setUploading(true);
//         const response = await fetch('/api/players/create', {
//           method: 'POST',
//           body: formData,
//         });
//         if (!response.ok) {
//           throw new Error('Lỗi khi gửi dữ liệu');
//         }

//         const data = await response.json();
//         console.log('Kết quả:', data);

//         toast.success('Cầu thủ đã được thêm thành công!');
//         formik.resetForm();
//         setImagePreview('');
//         setImg(null);
//         onClose();
//         onAddPlayer(); // Call this to trigger refresh
//       } catch (error) {
//         toast.error('Không thể thêm cầu thủ. Vui lòng thử lại.');
//         console.error('Lỗi khi thêm cầu thủ:', error);
//       } finally {
//         setUploading(false);
//       }
//     },
//   });

//   const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (files && files?.length > 0) {
//       const file = files[0];
//       if (!file.type.startsWith('image/')) {
//         toast.error('Invalid file type. Please upload an image file.');
//         return;
//       }

//       const imageDataUrl = await readFile(file);
//       setImage(imageDataUrl as string);
//       toggleState();
//     }

//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const handleClose = () => {
//     // Clear image preview and file
//     setImagePreview('');
//     setImage(null);
//     formik.resetForm();
//     onClose();
//   };

//   const handleDone = async () => {
//     const avatar = await getProcessedImage(); // Lấy ảnh đã được crop và xử lý
//     if (avatar) {
//       setImg(avatar as File);
//       const reader = new FileReader();
//       reader.onloadend = async () => {
//         if (typeof reader.result === 'string') {
//           setImagePreview(reader.result);

//           // Trích xuất và lưu trữ descriptors
//           const image = await faceapi.bufferToImage(avatar);
//           const detections = await faceapi
//             .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
//             .withFaceLandmarks()
//             .withFaceDescriptor();

//           if (detections) {
//             const descriptor = detections.descriptor;
//             formik.setFieldValue('faceDescriptor', Array.from(descriptor));
//           }
//         } else {
//           console.error('Kết quả FileReader không phải là chuỗi');
//         }
//       };
//       reader.readAsDataURL(avatar); // Hiển thị ảnh đã crop
//     }
//   };

//   return (
//     <Dialog size="lg" open={open} handler={onClose}>
//       <DialogHeader>Thêm cầu thủ</DialogHeader>
//       <DialogBody className=" space-y-4 pb-6">
//         <div className=" flex w-full gap-3 rounded-[20px] bg-white bg-clip-border pt-3 font-dm ">
//           <div className=" h-full w-1/4 flex-none rounded-xl bg-lightPrimary dark:!bg-navy-700">
//             {imagePreview ? (
//               <Image
//                 src={imagePreview}
//                 alt="Hình ảnh xem trước"
//                 className=" h-full w-full rounded object-cover"
//                 width={300}
//                 height={150}
//               />
//             ) : (
//               <PlayerUpload
//                 fileInputRef={fileInputRef}
//                 handleFileChange={handleFileChange}
//               />
//             )}

//             <AvatarEditModal
//               isOpen={isOpen}
//               toggleState={toggleState}
//               handleDone={handleDone}
//             />
//           </div>

//           <div className="  -mt-2 grid h-full w-full flex-grow gap-3 space-y-4 overflow-hidden   rounded-xl bg-white pb-4 pb-6 pl-3 dark:!bg-navy-800">
//             <form
//               onSubmit={formik.handleSubmit}
//               className="col-span-12 mt-3 flex"
//             >
//               <div className="w-full md:w-1/2 ">
//                 <div className="mb-4">
//                   <Input
//                     label="Số áo"
//                     name="jerseyNumber"
//                     value={formik.values.jerseyNumber}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     error={
//                       formik.touched.jerseyNumber &&
//                       Boolean(formik.errors.jerseyNumber)
//                     }
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <Input
//                     label="Họ và tên"
//                     name="name"
//                     value={formik.values.name}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     error={formik.touched.name && Boolean(formik.errors.name)}
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <Input
//                     label="email"
//                     name="email"
//                     value={formik.values.email}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     error={formik.touched.email && Boolean(formik.errors.email)}
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <Input
//                     label="Số điện thoại"
//                     name="phone"
//                     value={formik.values.phone}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     error={formik.touched.phone && Boolean(formik.errors.phone)}
//                   />
//                 </div>
//               </div>

//               <div className="ml-3 w-full md:w-1/2 ">
//                 <div className="mb-4">
//                   <Input
//                     label="Tên thi đấu"
//                     name="displayName"
//                     value={formik.values.displayName}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     error={
//                       formik.touched.displayName &&
//                       Boolean(formik.errors.displayName)
//                     }
//                   />
//                 </div>
//                 <div className="mb-4">
//                   <Input
//                     type={'date'}
//                     label="Ngày sinh"
//                     name="dateOfBirth"
//                     value={formik.values.dateOfBirth}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     error={
//                       formik.touched.dateOfBirth &&
//                       Boolean(formik.errors.dateOfBirth)
//                     }
//                   />
//                 </div>
//                 <div className="mb-4">
//                   <Input
//                     label="Vị trí"
//                     name="position"
//                     value={formik.values.position}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     error={
//                       formik.touched.position && Boolean(formik.errors.position)
//                     }
//                   />
//                 </div>
//                 <div>
//                   <Button
//                     variant="outlined"
//                     onClick={handleClose}
//                     className="gap-5 bg-brand-500 text-white"
//                   >
//                     Hủy
//                   </Button>
//                   <Button
//                     type="submit"
//                     disabled={uploading}
//                     className="ml-5 bg-brand-500 text-white"
//                   >
//                     {uploading ? 'Đang thêm...' : 'Thêm cầu thủ'}
//                   </Button>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       </DialogBody>
//     </Dialog>
//   );
// };

// export default AddPlayerDialog;

import React, { useState, useEffect, ChangeEvent, useRef, use } from 'react';
import { useFormik } from 'formik';
import { useImageCropContext } from '../../../providers/ImageCropProvider';
import * as Yup from 'yup';
import Image from 'next/image';
import axios from 'axios';
import { Player } from '../../../models/entities';
import PlayerDisplay from './AvatarDisplay';
import AvatarEditModal from '../../Modal/AvatarEditModal';
import { useToggleState } from '../../../hooks/useToggleState';
import { readFile } from '../../../helpers/cropImage';
import PlayerUpload from './PlayerUpload';
import * as faceapi from 'face-api.js';
import { db } from '../../../../config/firebaseconfig';
import { collection, addDoc } from 'firebase/firestore';

import {
  Input,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Card,
  Typography,
  Select,
  Option,
} from '@material-tailwind/react';
import { toast } from 'sonner';
import { set } from 'date-fns';

interface AddPlayerDialogProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
  userId: string;
  onAddPlayer: () => void;
  tournamentId: string; // Add this prop to trigger refresh
}

const AddPlayerDialog: React.FC<AddPlayerDialogProps> = ({
  open,
  onClose,
  teamId,
  userId,
  onAddPlayer,
  tournamentId,
}) => {
  const [img, setImg] = useState<File | null>(null);
  const [savedDescriptor, setSavedDescriptor] = useState<Float32Array[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const { state: isOpen, toggleState } = useToggleState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getProcessedImage, setImage, resetStates } = useImageCropContext();
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(
    null,
  );
  useEffect(() => {
    // Load the TinyFaceDetector model
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    };
    loadModels();
  }, []);

  useEffect(() => {
    const fetchFaceDescriptors = async () => {
      try {
        console.log('Loading face descriptors...', userId, tournamentId);
        const response = await axios.get('/api/players/allPlayers', {
          params: {
            userId,
            tournamentId,
          },
        });

        const players = response.data.players;
        console.log('Players:', players);
        const descriptors = players
          .map((player: any) => {
            if (!player.faceDescriptor) {
              console.warn(
                `Player ${player.playerName} does not have faceDescriptor`,
              );
              return null;
            }
            return player.faceDescriptor.map(
              (desc: string) => new Float32Array(JSON.parse(desc)),
            );
          })
          .flat()
          .filter(Boolean);
        console.log('Faceed descriptors:', descriptors);

        setSavedDescriptor(descriptors);
      } catch (error) {
        console.error('Error loading face descriptors:', error);
        toast.error('Failed to load face descriptors');
      }
    };

    if (userId && tournamentId) {
      fetchFaceDescriptors();
    }
  }, [userId, tournamentId]);

  const formik = useFormik({
    initialValues: {
      name: '',
      displayName: '',
      email: '',
      jerseyNumber: '',
      phone: '',
      position: '',
      dateOfBirth: '',
      faceDescriptor: [],
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Tên cầu thủ là bắt buộc')
        .min(4, 'Tên cầu thủ phải có ít nhất 4 ký tự'),
      email: Yup.string()
        .required('Email là bắt buộc')
        .email('Email không hợp lệ'),
      displayName: Yup.string()
        .required('Tên thi đấu là bắt buộc')
        .min(4, 'Tên cầu thủ phải có ít nhất 4 ký tự'), // Thêm xác thực cho "Tên thi đấu"
      phone: Yup.string()
        .required('Số điện thoại là bắt buộc')
        .matches(
          /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
          'Số điện thoại không hợp lệ',
        ),
      position: Yup.string().required('Vị trí là bắt buộc'),
      jerseyNumber: Yup.number().required('Số áo là bắt buộc'),
      dateOfBirth: Yup.date().required('Ngày sinh là bắt buộc'),
    }),
    onSubmit: async (values) => {
      try {
        if (!faceDescriptor) {
          toast.error('Vui lòng tải lên ảnh để trích xuất dữ liệu gương mặt.');
          return;
        }

        // Kiểm tra descriptor mới với danh sách descriptor đã đăng ký
        let isRegistered = false;
        if (savedDescriptor) {
          console.log('faceDescriptor:', faceDescriptor);
          for (let i = 0; i < savedDescriptor?.length; i++) {
            console.log('savedDescriptor:', savedDescriptor[i]);

            const distance = faceapi.euclideanDistance(
              faceDescriptor,
              savedDescriptor[i],
            );
            if (distance < 0.6) {
              isRegistered = true;
              break;
            }
          }
        }
        if (isRegistered) {
          toast.error('Cầu thủ này đã được đăng ký trước đó.');
          setImagePreview('');
          setImg(null);
          return;
        }

        const formData = new FormData();
        formData.append('playerName', values.name);
        formData.append('displayName', values.displayName);
        formData.append('email', values.email);
        formData.append('phone', values.phone);
        formData.append('position', values.position);
        formData.append('jerseyNumber', values.jerseyNumber.toString());
        formData.append('dateOfBirth', values.dateOfBirth);
        formData.append('teamId', teamId);
        formData.append('tournamentId', tournamentId);
        formData.append('userId', userId);
        formData.append(
          'faceDescriptor',
          JSON.stringify(values.faceDescriptor),
        );

        if (img) {
          formData.append('files', img);
          console.log('image', img);
        }
        console.log('formDataplayer:', formData);

        setUploading(true);
        const response = await fetch('/api/players/create', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error('Lỗi khi gửi dữ liệu');
        }

        const data = await response.json();
        console.log('Kết quả:', data);

        toast.success('Cầu thủ đã được thêm thành công!');
        formik.resetForm();
        setImagePreview('');
        setImg(null);
        onClose();
        onAddPlayer(); // Call this to trigger refresh
      } catch (error) {
        toast.error('Không thể thêm cầu thủ. Vui lòng thử lại.');
        console.error('Lỗi khi thêm cầu thủ:', error);
      } finally {
        setUploading(false);
      }
    },
  });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files?.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid file type. Please upload an image file.');
        return;
      }

      const imageDataUrl = await readFile(file);
      setImage(imageDataUrl as string);
      toggleState();
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    // Clear image preview and file
    setImagePreview('');
    setImage(null);
    formik.resetForm();
    onClose();
  };

  // const handleDone = async () => {
  //   const avatar = await getProcessedImage(); // Lấy ảnh đã được crop và xử lý
  //   if (avatar) {
  //     setImg(avatar as File);
  //     const reader = new FileReader();
  //     reader.onloadend = async () => {
  //       if (typeof reader.result === 'string') {
  //         setImagePreview(reader.result);

  //         // Trích xuất và lưu trữ descriptors
  //         const image = await faceapi.bufferToImage(avatar);
  //         const detections = await faceapi
  //           .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
  //           .withFaceLandmarks()
  //           .withFaceDescriptor();

  //         if (detections) {
  //           const descriptor = detections.descriptor;
  //           formik.setFieldValue('faceDescriptor', Array.from(descriptor));
  //         } else {
  //           // Nếu không trích xuất được dữ liệu gương mặt
  //           toast.error(
  //             'Không thể trích xuất dữ liệu gương mặt. Vui lòng chọn ảnh khác.',
  //           );
  //           setImagePreview('');
  //           setImg(null);
  //         }
  //       } else {
  //         console.error('Kết quả FileReader không phải là chuỗi');
  //       }
  //     };
  //     reader.readAsDataURL(avatar); // Hiển thị ảnh đã crop
  //   }
  // };

  const handleDone = async () => {
    const avatar = await getProcessedImage(); // Lấy ảnh đã được crop và xử lý
    if (avatar) {
      setImg(avatar as File);
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);

          // Trích xuất và lưu trữ descriptors
          const image = await faceapi.bufferToImage(avatar);
          const detections = await faceapi
            .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detections) {
            setFaceDescriptor(new Float32Array(detections.descriptor));
            formik.setFieldValue(
              'faceDescriptor',
              Array.from(detections.descriptor),
            );

            console.log('Face descriptornew:', faceDescriptor);

            // const descriptor = detections.descriptor;
            // formik.setFieldValue('faceDescriptor', Array.from(descriptor));
          } else {
            // Nếu không trích xuất được dữ liệu gương mặt
            toast.error(
              'Không thể trích xuất dữ liệu gương mặt. Vui lòng chọn ảnh khác.',
            );
            setImagePreview('');
            setImg(null);
          }
        } else {
          console.error('Kết quả FileReader không phải là chuỗi');
        }
      };
      reader.readAsDataURL(avatar); // Hiển thị ảnh đã crop
    }
  };

  const handleSelectChange = (value: string) => {
    formik.setFieldValue('position', value);
  };

  return (
    <Dialog size="lg" open={open} handler={onClose}>
      <DialogHeader>Thêm cầu thủ</DialogHeader>
      <DialogBody className=" space-y-4 pb-6">
        <div className=" flex w-full gap-3 rounded-[20px] bg-white bg-clip-border pt-3 font-dm ">
          <div className=" h-full w-1/4 flex-none rounded-xl bg-lightPrimary dark:!bg-navy-700">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Hình ảnh xem trước"
                className=" h-full w-full rounded object-cover"
                width={300}
                height={150}
              />
            ) : (
              <PlayerUpload
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
              />
            )}

            <AvatarEditModal
              isOpen={isOpen}
              toggleState={toggleState}
              handleDone={handleDone}
            />
          </div>

          <div className="  -mt-2 grid h-full w-full flex-grow gap-3 space-y-4 overflow-hidden   rounded-xl bg-white pb-4 pb-6 pl-3 dark:!bg-navy-800">
            <form
              onSubmit={formik.handleSubmit}
              className="col-span-12 mt-3 flex"
            >
              <div className="w-full md:w-1/2 ">
                <div className="mb-4">
                  <Input
                    label="Số áo"
                    name="jerseyNumber"
                    value={formik.values.jerseyNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.jerseyNumber &&
                      Boolean(formik.errors.jerseyNumber)
                    }
                  />
                </div>

                <div className="mb-4">
                  <Input
                    label="Họ và tên"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                  />
                </div>

                <div className="mb-4">
                  <Input
                    label="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                  />
                </div>

                <div className="mb-4">
                  <Input
                    label="Số điện thoại"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                  />
                </div>
              </div>

              <div className="ml-3 w-full md:w-1/2 ">
                <div className="mb-4">
                  <Input
                    label="Tên thi đấu"
                    name="displayName"
                    value={formik.values.displayName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.displayName &&
                      Boolean(formik.errors.displayName)
                    }
                  />
                </div>
                <div className="mb-4">
                  <Input
                    type={'date'}
                    label="Ngày sinh"
                    name="dateOfBirth"
                    value={formik.values.dateOfBirth}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.dateOfBirth &&
                      Boolean(formik.errors.dateOfBirth)
                    }
                  />
                </div>
                <div className="mb-4">
                  <Select
                    label="Vị trí"
                    name="position"
                    value={formik.values.position}
                    onChange={(value) => handleSelectChange(value)}
                    onBlur={formik.handleBlur}
                  >
                    <Option value="Tiền Đạo">Tiền Đạo</Option>
                    <Option value="Hậu Vệ">Hậu Vệ</Option>
                    <Option value="Thủ Môn">Thủ Môn</Option>
                  </Select>
                  {formik.errors.position && (
                    <p className="-mt-4 w-full font-[0.75rem] text-red-500">
                      {formik.errors.position}
                    </p>
                  )}
                </div>
                <div>
                  <Button
                    variant="outlined"
                    onClick={handleClose}
                    className="gap-5 bg-brand-500 text-white"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading}
                    className="ml-5 bg-brand-500 text-white"
                  >
                    {uploading ? 'Đang thêm...' : 'Thêm cầu thủ'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
};

export default AddPlayerDialog;
