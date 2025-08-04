// src/services/authApi.js
import axios from 'axios';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

const API_URL = import.meta.env.VITE_BACKEND_API_URL; // e.g., http://localhost:5000/api

// Function to register user profile in Firestore via backend after Firebase Auth signup
export const registerUserProfileInBackend = async (uid, email, name, role) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register-profile`, { // This path is correct
      uid,
      email,
      name,
      role,
    });
    return response.data.user;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// Function to get authenticated user's profile from the backend
export const getAuthenticatedUserProfile = async (idToken) => {
  try {
    // Corrected URL: Now targets the /api/users/me endpoint
    const response = await axios.get(`${API_URL}/users/me`, { // <--- CHANGE THIS LINE
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data.user; // Backend now returns { message, user } or just { user }
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// --- Firebase Client-Side Auth Functions (for direct client interaction) ---

export const signupWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error.message;
  }
};

export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error.message;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error.message;
  }
};

export const getCurrentIdToken = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  } catch (error) {
    console.error("Error getting ID token:", error);
    return null;
  }
};