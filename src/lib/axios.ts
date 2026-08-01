import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor request để tự động nhét token nếu có
apiClient.interceptors.request.use(
  (config) => {
    // Có thể lấy token từ cookie/localStorage hoặc session ở đây nếu cần
    // Ví dụ: 
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor response để xử lý lỗi global (ví dụ 401 thì logout)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Xử lý lỗi (Toast error, v.v.)
    return Promise.reject(error);
  }
);
