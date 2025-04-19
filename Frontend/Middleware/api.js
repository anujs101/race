import axios from "axios";

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://10.10.40.85:5001/api', // Adjust this to your backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token in all requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Generic API request function for all CRUD operations
 * @param {string} method - HTTP method (get, post, put, delete)
 * @param {string} url - API endpoint
 * @param {object} data - Request body (for POST, PUT)
 * @param {object} headers - Custom headers (optional)
 * @returns {Promise} - Response data or error
 */
const apiRequest = async (method, url, data = null, headers = {}) => {
    try {
        const config = {
            method,
            url,
            headers: { ...api.defaults.headers, ...headers }
        };
        
        // Only add data for non-GET requests and when data is provided
        if (method.toLowerCase() !== 'get' && data !== null) {
            config.data = data;
        }
        
        const response = await api(config);
        return response.data;
    } catch (error) {
        // Format error response
        const errorResponse = {
            success: false,
            error: error.response?.data?.error || error.message || 'Unknown error occurred',
            status: error.response?.status,
        };
        throw errorResponse;
    }
};

/**
 * Special function for DELETE requests to avoid sending body data
 * @param {string} url - API endpoint
 * @param {object} headers - Custom headers (optional)
 * @returns {Promise} - Response data or error
 */
const apiDelete = async (url, headers = {}) => {
    try {
        const response = await api({
            method: 'delete',
            url,
            headers: { ...api.defaults.headers, ...headers }
        });
        return response.data;
    } catch (error) {
        const errorResponse = {
            success: false,
            error: error.response?.data?.error || error.message || 'Unknown error occurred',
            status: error.response?.status,
        };
        throw errorResponse;
    }
};

// Export the API request functions
export default apiRequest;
export { apiDelete };