import { useImageCropContext } from 'providers/ImageCropProvider';
import { IoMdAdd } from 'react-icons/io';
import { MdOutlineCancel } from 'react-icons/md';
import { MdOutlineRotateLeft } from 'react-icons/md';
import { MdOutlineRotateRight } from 'react-icons/md';

export const ZoomSlider = () => {
  const {
    zoom,
    setZoom,
    handleZoomIn,
    handleZoomOut,
    max_zoom,
    min_zoom,
    zoom_step,
  } = useImageCropContext();

  return (
    <div className="flex items-center justify-center gap-2">
      <button className="p-1" onClick={handleZoomOut}>
        <span className="sr-only">Zoom Out</span>
        <MdOutlineCancel />
      </button>
      <input
        type="range"
        name="volju"
        min={min_zoom}
        max={max_zoom}
        step={zoom_step}
        value={zoom}
        onChange={(e) => {
          setZoom(Number(e.target.value));
        }}
        className="bg-gray-light dark:bg-light appearance-facebook h-2 rounded-full accent-facebook"
      />
      <button className="p-1" onClick={handleZoomIn}>
        <span className="sr-only">Zoom In</span>
        <IoMdAdd />
      </button>
    </div>
  );
};

export const RotationSlider = () => {
  const {
    rotation,
    setRotation,
    max_rotation,
    min_rotation,
    rotation_step,
    handleRotateAntiCw,
    handleRotateCw,
  } = useImageCropContext();

  return (
    <div className="flex items-center justify-center gap-2">
      <button className="p-1" onClick={handleRotateAntiCw}>
        <span className="sr-only">Rotate Left</span>
        <MdOutlineRotateLeft />
      </button>
      <input
        type="range"
        name="volju"
        min={min_rotation}
        max={max_rotation}
        step={rotation_step}
        value={rotation}
        onChange={(e) => {
          setRotation(Number(e.target.value));
        }}
        className="bg-gray-light dark:bg-light appearance-facebook h-2 rounded-full accent-facebook"
      />
      <button className="p-1" onClick={handleRotateCw}>
        <span className="sr-only">Rotate Right</span>
        <MdOutlineRotateRight />
      </button>
    </div>
  );
};
