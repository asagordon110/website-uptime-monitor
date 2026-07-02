console.log("API URL:", import.meta.env.VITE_API_URL);

// Axios backend connection

import axios from 'axios';

// Create an Axios instance with the base URL of the backend API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL // Replace with your backend API URL
});

export default api;