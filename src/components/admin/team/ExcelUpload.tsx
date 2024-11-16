import React, { useState, ChangeEvent } from 'react';
import { Button, Input, Typography } from '@material-tailwind/react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import axios from 'axios';
import * as faceapi from 'face-api.js';

interface ExcelUploadProps {
  teamId: string;
  userId: string;
  tournamentId: string;
  onAddPlayer: () => void;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({
  teamId,
  userId,
  tournamentId,
  onAddPlayer,
}) => {
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Load the TinyFaceDetector model
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    };
    loadModels();
  }, []);

  const handleExcelUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const players = XLSX.utils.sheet_to_json(sheet);

        try {
          setUploading(true);
          for (const player of players) {
            const imageUrl = player.avatarUrl;
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

            const image = await faceapi.bufferToImage(file);
            const detections = await faceapi
              .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (detections) {
              const { x, y, width, height } = detections.detection.box;
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.width = width;
              canvas.height = height;
              context.drawImage(
                image,
                x,
                y,
                width,
                height,
                0,
                0,
                width,
                height,
              );
              const croppedImage = canvas.toDataURL('image/jpeg');

              const formData = new FormData();
              formData.append('playerName', player.playerName);
              formData.append('displayName', player.displayName);
              formData.append('email', player.email);
              formData.append('phone', player.phone);
              formData.append('position', player.position);
              formData.append('jerseyNumber', player.jerseyNumber.toString());
              formData.append('dateOfBirth', player.dateOfBirth);
              formData.append('teamId', teamId);
              formData.append('tournamentId', tournamentId);
              formData.append('userId', userId);
              formData.append('files', croppedImage);

              const response = await fetch('/api/players/create', {
                method: 'POST',
                body: formData,
              });
              if (!response.ok) {
                throw new Error('Lỗi khi gửi dữ liệu');
              }
            } else {
              toast.error(
                `Không thể nhận diện gương mặt cho cầu thủ ${player.playerName}.`,
              );
            }
          }

          toast.success('Cầu thủ đã được thêm thành công!');
          onAddPlayer(); // Call this to trigger refresh
        } catch (error) {
          toast.error('Không thể thêm cầu thủ. Vui lòng thử lại.');
          console.error('Lỗi khi thêm cầu thủ:', error);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <Typography variant="h6" color="blue-gray">
        Thêm cầu thủ từ file Excel
      </Typography>
      <Input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} />
      <Button onClick={() => {}} className="mt-4">
        Đóng
      </Button>
    </div>
  );
};

export default ExcelUpload;
