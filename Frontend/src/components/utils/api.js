
const API_URL = import.meta.env.VITE_API_URL;

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
};

export default apiFetch;
