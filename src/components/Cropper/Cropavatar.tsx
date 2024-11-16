import React from 'react';
import EasyCropper from 'react-easy-crop';
import { useImageCropContext } from 'providers/ImageCropProvider';

const CropAvatar: React.FC = () => {
  const { image, zoom, setZoom, rotation, crop, setCrop, onCropComplete } =
    useImageCropContext();

  return (
    <div className="relative h-40 w-40">
      <EasyCropper
        image={image || undefined}
        crop={crop}
        zoom={zoom}
        rotation={rotation}
        cropShape="rect" // Cắt ảnh thành hình chữ nhật
        aspect={1} // Đặt tỷ lệ thành 1:1 cho hình vuông
        onCropChange={(point) => setCrop((prev) => ({ ...prev, ...point }))}
        onCropComplete={onCropComplete}
        onZoomChange={setZoom}
        showGrid={false}
        cropSize={{ width: 160, height: 160 }} // Kích thước khung cắt hình vuông
        style={{
          containerStyle: {
            borderRadius: 0,
            overflow: 'hidden',
          },
        }}
      />
    </div>
  );
};

export default CropAvatar;
