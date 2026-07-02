// Axios backend connection

import axios from 'axios';

// Create an Axios instance with the base URL of the backend API
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Replace with your backend API URL
});

export default api;