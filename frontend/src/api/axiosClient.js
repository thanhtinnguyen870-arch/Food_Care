import axios from 'axios';

const axiosClient = axios.create({

  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 35000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const isNetworkOrTimeout = !error.response || ['ERR_NETWORK', 'ECONNABORTED', 'ECONNREFUSED'].includes(error.code);
    const isServerWakingUp = [502, 503, 504].includes(error.response?.status);

    if (config && (isNetworkOrTimeout || isServerWakingUp)) {
      config.__retryCount = config.__retryCount || 0;
      const maxRetries = isServerWakingUp ? 4 : 2;
      if (config.__retryCount < maxRetries) {
        config.__retryCount += 1;
        const delay = isServerWakingUp ? config.__retryCount * 2500 : config.__retryCount * 600;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return axiosClient(config);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

