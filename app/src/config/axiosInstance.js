import axios from 'axios';

const env = import.meta.env.VITE_ENV || 'dev';
const appenv = import.meta.env.VITE_APP_ENV || 'quality';

const baseUrl = {
    dev: {
        quality: import.meta.env.VITE_API_URL_DEVQ,
        production: import.meta.env.VITE_API_URL_DEVP,
    },
    live: {
        quality: import.meta.env.VITE_API_URL_QAS,
        production: import.meta.env.VITE_API_URL_PRD,
    }
};

const basicAuthHeader = 'Basic ' + btoa(`${import.meta.env.VITE_API_USR}:${import.meta.env.VITE_API_PSS}`);

const axiosInstance = axios.create({
    baseURL: baseUrl[env][appenv],
    withCredentials: true, // ✅ crucial for cookies
});

export const setupInterceptors = (store) => {
    // ✅ Request Interceptor
    axiosInstance.interceptors.request.use(
        (config) => {
            // ❗ DO NOT override Content-Type for FormData
            if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
            config.headers['Accept'] = 'application/json';
            config.headers['X-Requested-With'] = 'X';
            }

            if (config.url?.startsWith('/auth')) {
                const { accessToken } = store.getState().auth; // 🔹 Get from Redux
                if (accessToken) {
                    config.headers['Authorization'] = `Bearer ${accessToken}`;
                }
            } else {
                config.headers['Authorization'] = basicAuthHeader;
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    // ✅ Response Interceptor (auto-refresh)
    axiosInstance.interceptors.response.use(
        res => res,
        async (error) => {
            const originalRequest = error.config;

            if (originalRequest.url?.includes('/auth/refresh')) {
                return Promise.reject(error);
            }

            const excludedEndpoints = ['/auth/login', '/auth/register'];
            const isExcluded = excludedEndpoints.some(path => originalRequest.url?.includes(path));

            if (
                error.response?.status === 401 &&
                !originalRequest._retry &&
                !isExcluded
            ) {
                originalRequest._retry = true;

                try {
                    const res = await axiosInstance.post('/auth/refresh');
                    const newToken = res.data.accessToken;

                    // 🔹 Update Redux store only
                    store.dispatch({ type: 'auth/setAccessToken', payload: newToken });

                    // Retry original request with new token
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                } catch (refreshErr) {
                    store.dispatch({ type: 'auth/logout' });
                    return Promise.reject(refreshErr);
                }
            }

            return Promise.reject(error);
        }
    );
};

export default axiosInstance;
