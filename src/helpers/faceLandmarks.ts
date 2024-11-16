import * as faceapi from 'face-api.js';

interface MessageData {
  type: string;
  payload?: any;
}

self.onmessage = async (event: MessageEvent<MessageData>) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'loadModels':
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      ]);
      postMessage({ type: 'modelsLoaded' });
      break;

    case 'detectFace':
      const { videoElement, faceMatcher } = payload;
      const detections = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptor();

      if (detections && faceMatcher) {
        const bestMatch = faceMatcher.findBestMatch(detections.descriptor);
        postMessage({ type: 'faceDetected', payload: bestMatch });
      } else {
        postMessage({ type: 'noFaceDetected' });
      }
      break;

    default:
      console.warn('Unknown message type:', type);
  }
};
