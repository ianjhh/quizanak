import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { mockApi } from './testing/mockApi';

const signedIn = () => [200, { verified: true, authorizedData: { username: 'budi' } }];
const guest = () => [401, 'Sesi tidak valid'];

describe('fact pages', () => {
    let requests;

    const renderAt = (path, verifyToken) => {
        requests = mockApi({
            'GET /api/verifyToken': verifyToken,
            'GET /api/fetchAnimalFacts': () => [200, [{ link_name: 'fakta-kucing', title: 'Fakta Kucing', image: 'faktakucing' }]],
            'GET /api/fetchSpaceFacts': () => [200, [{ link_name: 'fakta-mars', title: 'Fakta Mars', image: 'mars' }]],
            'POST /api/fetchAnimalFact': () => [200, { title: 'Fakta Kucing', factsarr: [['Kucing tidur sekitar 12 sampai 16 jam setiap hari.', '']] }],
            'GET /api/fetchAnimalQuiz': () => [200, []],
            'GET /api/fetchMathQuiz': () => [200, []],
            'GET /api/fetchLanguageQuiz': () => [200, []],
            'GET /api/fetchMiscellaneousQuiz': () => [200, []],
        });
        render(
            <MemoryRouter initialEntries={[path]}>
                <App />
            </MemoryRouter>
        );
    };

    afterEach(() => requests.restore());

    test('lists a category and loads the next one when switching categories', async () => {
        renderAt('/fakta-binatang', guest);
        expect(await screen.findByText('Fakta Kucing')).toBeInTheDocument();
        expect(screen.getByText('Fakta-Fakta Binatang')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Angkasa'));

        expect(await screen.findByText('Fakta Mars')).toBeInTheDocument();
        expect(screen.getByText('Fakta-Fakta Angkasa')).toBeInTheDocument();
        expect(screen.queryByText('Fakta Kucing')).not.toBeInTheDocument();
    });

    test('shows an article to a verified user', async () => {
        renderAt('/fakta-binatang/fakta-kucing', signedIn);
        expect(await screen.findByText('Kucing tidur sekitar 12 sampai 16 jam setiap hari.')).toBeInTheDocument();
        expect(requests.find((r) => r.url === '/api/fetchAnimalFact').body).toEqual({ link_name: 'fakta-kucing' });
    });

    test('sends guests who open an article to the login page', async () => {
        renderAt('/fakta-binatang/fakta-kucing', guest);
        await waitFor(() => expect(screen.getByText('Masuk')).toBeInTheDocument());
        expect(screen.queryByText('Kucing tidur sekitar 12 sampai 16 jam setiap hari.')).not.toBeInTheDocument();
    });
});
