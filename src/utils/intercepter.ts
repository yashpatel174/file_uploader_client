import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      const { data } = await api.post("/auth/refresh", {
        refreshToken,
      });
      localStorage.setItem("accessToken", data.result.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.result.accessToken}`;
      return axios(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default api;
