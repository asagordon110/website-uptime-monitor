// Groups all site-related API calls in one file.
import api from "./api";

// Gets dashboard stat totals.
export const getDashboardStats = () => api.get("/sites/dashboard/stats");

// Gets all monitored sites.
export const getSites = () => api.get("/sites");

// Adds a new website.
export const addSite = (siteData) => api.post("/sites", siteData);

// Deletes a website by id.
export const deleteSite = (id) => api.delete(`/sites/${id}`);

// Manually checks one website.
export const checkSite = (id) => api.post(`/sites/${id}/check`);

// Gets check history for one website.
export const getCheckHistory = (id) => api.get(`/sites/${id}/checks`);