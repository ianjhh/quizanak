import axios from 'axios';
import { configureApi } from './api';

// Answers every request without touching the network and records what was sent.
function fakeServer(respond) {
    const requests = [];
    const adapter = async (config) => {
        requests.push(config);
        const [status, data] = respond(config);
        const response = { status, data, headers: {}, config, statusText: String(status) };
        if (status >= 400) {
            const error = new Error(`Request failed with status code ${status}`);
            error.config = config;
            error.response = response;
            throw error;
        }
        return response;
    };
    return { adapter, requests };
}

beforeAll(() => configureApi());
beforeEach(() => window.localStorage.clear());

test('keeps the token from a login response and sends it on later requests', async () => {
    const server = fakeServer((config) => (config.url === '/api/login' ? [200, { verified: true, token: 'abc.def.ghi' }] : [200, {}]));

    await axios.post('/api/login', { username: 'budi', password: 'rahasia123' }, { adapter: server.adapter });
    await axios.get('/api/verifyToken', { adapter: server.adapter });

    expect(server.requests[0].headers.Authorization).toBeUndefined();
    expect(server.requests[1].headers.Authorization).toBe('Bearer abc.def.ghi');
});

test('forgets the token on logout', async () => {
    window.localStorage.setItem('kuisanak.sessionToken', 'abc.def.ghi');
    const server = fakeServer(() => [202, 'cookie cleared']);

    await axios.get('/api/logout', { adapter: server.adapter });
    await axios.get('/api/fetchAnimalQuiz', { adapter: server.adapter });

    expect(server.requests[0].headers.Authorization).toBeUndefined();
    expect(server.requests[1].headers.Authorization).toBeUndefined();
});

test('forgets a token the API no longer accepts', async () => {
    window.localStorage.setItem('kuisanak.sessionToken', 'expired');
    const server = fakeServer(() => [401, 'Sesi tidak valid']);

    await expect(axios.get('/api/verifyToken', { adapter: server.adapter })).rejects.toThrow();
    expect(window.localStorage.getItem('kuisanak.sessionToken')).toBeNull();
});

test('turns a network failure into a readable 503 error', async () => {
    const adapter = async () => {
        throw new Error('Network Error');
    };
    await expect(axios.get('/api/fetchAnimalQuiz', { adapter })).rejects.toMatchObject({
        response: { status: 503, data: 'Koneksi ke server gagal. Silakan coba beberapa saat lagi.' },
    });
});
