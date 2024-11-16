import Image from 'next/image';
import avatar from '/public/img/avatars/avatar11.png';
import React, { useState, ChangeEvent } from 'react';
import { MdFileUpload } from 'react-icons/md';

export default function PlayerDisplay({}: { photoURL: string | null }) {
  const [imagePreview, setImagePreview] = useState<string>('');
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="col-span-5 h-full w-full rounded-xl bg-lightPrimary dark:!bg-navy-700 2xl:col-span-6">
      {imagePreview ? (
        <Image
          src={imagePreview}
          alt="Hình ảnh xem trước"
          className="mt-4 h-32 w-32 rounded object-cover"
          width={150}
          height={130}
        />
      ) : (
        <button
          type="button"
          className="flex h-full w-full flex-col items-center justify-center rounded-xl border-[2px] border-dashed border-gray-200 py-3 dark:!border-navy-700 lg:pb-0"
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <MdFileUpload className="text-[80px] text-brand-500 dark:text-white" />
          <h4 className="text-xl font-bold text-brand-500 dark:text-white">
            Upload Files
          </h4>
          <p className="mt-2 text-sm font-medium text-gray-600">
            PNG, JPG and GIF files are allowed
          </p>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </button>
      )}
    </div>
  );
}
