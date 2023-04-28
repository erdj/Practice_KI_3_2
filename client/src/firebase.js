// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBbivqXvNL52vmEg2pSQdQxI8kEcs6plQo',
  authDomain: 'rock-scissors-paper-e16cb.firebaseapp.com',
  projectId: 'rock-scissors-paper-e16cb',
  storageBucket: 'rock-scissors-paper-e16cb.appspot.com',
  messagingSenderId: '458885232707',
  appId: '1:458885232707:web:081702af4bd81227d53cf6',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
export const auth = getAuth();
export const provider = new GoogleAuthProvider();

export default app;
