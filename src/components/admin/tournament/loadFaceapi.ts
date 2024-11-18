// components/loadFaceapi.js
import * as faceapi from '@vladmandic/face-api';

export const loadModels = async () => {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  ]);
};

export const detectFaces = async (
  video,
  faceMatcher,
  labeledFaceDescriptors,
) => {
  const detections = await faceapi
    .detectSingleFace(
      video,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 160,
        scoreThreshold: 0.5,
      }),
    )
    .withFaceLandmarks()
    .withFaceExpressions()
    .withFaceDescriptor();

  if (detections) {
    const resizedDetections = faceapi.resizeResults(detections, {
      width: video.offsetWidth,
      height: video.offsetHeight,
    });
    return resizedDetections;
  }
  return null;
};

export default faceapi;
