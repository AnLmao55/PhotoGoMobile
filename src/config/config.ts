
import axios, { AxiosError } from 'axios';
import { SercuseService } from '../helpers/secureStorage';
import { decodeToken } from '../utils/decode';
import Constants from 'expo-constants';

// Get API URL from environment variables or Constants
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.photogo.id.vn/api/v1';

console.log('Using API URL:', API_URL);

const axiosClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const axiosPrivate = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Interceptors cho axiosPrivate
axiosPrivate.interceptors.request.use(
    async (config) => {
        // ********** Example **********
        //! lấy token & userRole từ redux store

        const token = await SercuseService.get("accessToken")
        // const userRole = decodeToken().role;

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // if (userRole) {
        //     config.headers['X-User-Role'] = userRole; // Gửi role trong header (tuỳ backend có cần hay không)
        // }
        // if (userRole) {
        //     config.headers['X-User-Role'] = userRole;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

axiosPrivate.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Xử lý khi bị unauthorized
            console.error('Unauthorized! Redirecting to login...');
        }
        return Promise.reject(error);
    },
);

// Xử lý lỗi toàn cục
const handleError = (error: AxiosError) => {
    if (error.response) {
        console.error('Server Error:', error.response.data);
    } else if (error.request) {
        console.error('No Response:', error.request);
    } else {
        console.error('Error:', error.message);
    }
    return Promise.reject(error);
};

axiosClient.interceptors.response.use((response) => response, handleError);
axiosPrivate.interceptors.response.use((response) => response, handleError);

export { axiosClient, axiosPrivate };