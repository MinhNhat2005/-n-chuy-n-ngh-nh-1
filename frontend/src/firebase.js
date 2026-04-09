import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDJT6kuSUooor31h5PuTOBwFWJl_dAofBo",
  authDomain: "face-attendance-system-46029.firebaseapp.com",
  projectId: "face-attendance-system-46029",
  storageBucket: "face-attendance-system-46029.firebasestorage.app",
  messagingSenderId: "802220598326",
  appId: "1:802220598326:web:ad896b3c5bccde1ce8a497",
  measurementId: "G-HCCVMWPWKQ"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)