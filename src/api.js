import axios from 'axios';

// The API sets the session as a cookie, but the API lives on another site
// (onrender.com), and Safari and every browser on iOS block such third-party
// cookies. So the token the API returns at login and sign-up is also kept
// here and sent as an Authorization header.
const TOKEN_KEY = 'kuisanak.sessionToken';

function readToken() {
    try {
        return window.localStorage.getItem(TOKEN_KEY);
    } catch (e) {
        return null;
    }
}

function writeToken(token) {
    try {
        if (token) {
            window.localStorage.setItem(TOKEN_KEY, token);
        } else {
            window.localStorage.removeItem(TOKEN_KEY);
        }
    } catch (e) {
        // storage unavailable (private mode): the cookie still works where allowed
    }
}

export function configureApi() {
    axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    axios.defaults.withCredentials = true;
    axios.defaults.timeout = 30000; // 30 second timeout to accommodate Render server cold starts and email sending

    axios.interceptors.request.use((config) => {
        if (config.url === '/api/logout') {
            writeToken(null);
            return config;
        }
        const token = readToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    axios.interceptors.response.use(
        (response) => {
            // Login and sign-up return the session token.
            if (response.data && typeof response.data.token === 'string') {
                writeToken(response.data.token);
            }
            return response;
        },
        (error) => {
            // Intercept network/CORS errors to prevent TypeError crashes in catch blocks
            if (!error.response) {
                error.response = {
                    status: 503,
                    data: 'Koneksi ke server gagal. Silakan coba beberapa saat lagi.'
                };
            } else if (error.response.status === 401 && error.config && error.config.url === '/api/verifyToken') {
                // The stored token expired or was replaced; forget it.
                writeToken(null);
            }
            return Promise.reject(error);
        }
    );
}
