
const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const rota = endpoint.startsWith("/")
        ? endpoint
        : `/${endpoint}`;

    return fetch(`${API_URL}${rota}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
};

export default apiFetch;
