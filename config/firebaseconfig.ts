import { initializeApp } from 'firebase/app';
import { getFirestore, writeBatch, doc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Cấu hình Firebase
const firebaseConfig = {
  // apiKey: 'AIzaSyDe5mtVMbTOW0EB16UFxv089SdMF8ZA_uY',
  // authDomain: 'myleague-d2c2f.firebaseapp.com',
  // projectId: 'myleague-d2c2f',
  // storageBucket: 'myleague-d2c2f.appspot.com',
  // messagingSenderId: '1095076922395',
  // appId: '1:1095076922395:web:ce8a360e0c1d249ee2a4be',
  // measurementId: 'G-QKNRK4Q7M0',

  apiKey: 'AIzaSyCOVnqf0_x-AYXhK1zKIv-8UeuR_b0sDVo',
  authDomain: 'webbanquanao-49c27.firebaseapp.com',
  projectId: 'webbanquanao-49c27',
  storageBucket: 'webbanquanao-49c27.appspot.com',
  messagingSenderId: '977646655389',
  appId: '1:977646655389:web:b39caa028eb644d0114174',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Tạo một batch
const batch = writeBatch(db);

// Ví dụ về cách sử dụng batch
const teamRef = doc(db, 'teams', 'teamId');
batch.set(teamRef, { name: 'Team Name', members: [] });

// Commit batch
batch
  .commit()
  .then(() => {
    console.log('Batch committed successfully');
  })
  .catch((error) => {
    console.error('Error committing batch: ', error);
  });

export { db };
export const auth = getAuth(app);
export const storage = getStorage(app);
