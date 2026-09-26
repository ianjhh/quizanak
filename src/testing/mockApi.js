import axios from 'axios';

// Replaces axios' network adapter for a test. `routes` maps "METHOD /path" to
// a function returning [status, body]; unknown routes answer 404. Returns the
// list of requests made, each with its parsed JSON body.
export function mockApi(routes) {
    const requests = [];
    const original = axios.defaults.adapter;

    axios.defaults.adapter = async (config) => {
        const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        const request = { method: config.method.toUpperCase(), url: config.url, body, headers: config.headers };
        requests.push(request);

        const handler = routes[`${request.method} ${request.url}`];
        const [status, data] = handler ? handler(request) : [404, 'Not found'];
        const response = { status, data, headers: {}, config, statusText: String(status) };
        if (status >= 400) {
            const error = new Error(`Request failed with status code ${status}`);
            error.config = config;
            error.response = response;
            throw error;
        }
        return response;
    };

    requests.restore = () => {
        axios.defaults.adapter = original;
    };
    return requests;
}
