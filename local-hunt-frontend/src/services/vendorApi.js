// src/services/vendorApi.js
import axios from 'axios';
import { getCurrentIdToken } from './authApi';

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const registerVendor = async (formData) => {
  try {
    const idToken = await getCurrentIdToken();
    if (!idToken) {
      throw new Error('No authentication token found. Please log in.');
    }
    const response = await axios.post(`${API_URL}/vendors/register`, formData, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getAllVendors = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/vendors`, { params });
    return response.data.vendors;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getVendorById = async (vendorId) => {
  try {
    const response = await axios.get(`${API_URL}/vendors/${vendorId}`);
    return response.data.vendor;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// New: Get the authenticated vendor's own profile
export const getVendorProfileForOwner = async () => {
  try {
    const idToken = await getCurrentIdToken();
    if (!idToken) {
      throw new Error('No authentication token found. Please log in.');
    }
    const response = await axios.get(`${API_URL}/vendors/me`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data.vendor; // Backend sends { vendor: {...} }
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// New: Update the authenticated vendor's own profile
export const updateVendorProfile = async (formData) => {
  try {
    const idToken = await getCurrentIdToken();
    if (!idToken) {
      throw new Error('No authentication token found. Please log in.');
    }
    const response = await axios.put(`${API_URL}/vendors/me`, formData, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'multipart/form-data', // Crucial for sending files
      },
    });
    return response.data; // Backend sends { message, vendor }
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// New: Increment vendor profile view count
export const incrementProfileView = async (vendorId) => {
  try {
    // No auth token needed as this can be called by any user/guest
    await axios.post(`${API_URL}/vendors/${vendorId}/increment-view`);
    // console.log(`Incremented view for vendor ${vendorId}`); // For debugging
  } catch (error) {
    console.error(`Failed to increment view for vendor ${vendorId}:`, error.message);
  }
};

// New: Increment vendor search impression count
export const incrementSearchImpression = async (vendorId) => {
  try {
    // No auth token needed
    await axios.post(`${API_URL}/vendors/${vendorId}/increment-impression`);
    // console.log(`Incremented impression for vendor ${vendorId}`); // For debugging
  } catch (error) {
    console.error(`Failed to increment impression for vendor ${vendorId}:`, error.message);
  }
};