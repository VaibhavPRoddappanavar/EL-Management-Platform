import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000', // Update to your backend's base URL
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;