import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL + "/api/user";
export const userApi = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        window.location.href = "/auth";
      } else {
        return Promise.reject(error.response.data.error);
      }
    }
    return Promise.reject(error);
  }
);
