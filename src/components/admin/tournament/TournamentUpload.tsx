'use client';
import { ChangeEvent, RefObject } from 'react';
import { MdFileUpload } from 'react-icons/md';

export default function TournamentUpload({
  fileInputRef,
  handleFileChange,
}: {
  fileInputRef: RefObject<HTMLInputElement>;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}): JSX.Element {
  return (
    <button
      type="button"
      className="mt-2 flex h-full w-full flex-col items-center justify-center rounded-xl border-[2px] border-dashed border-gray-200 py-3 dark:!border-navy-700 lg:pb-0"
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
        onChange={handleFileChange}
      />
    </button>
  );
}
