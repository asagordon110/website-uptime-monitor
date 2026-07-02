/*frontend/src/api/api.jsx
This file sets up an Axios instance for making API requests to the backend server. 
 You can customize the baseURL to point to your backend API endpoint.*/

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Replace with your backend API URL
});

export default api;