import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { mockApi } from './testing/mockApi';

const card = (name, title) => ({ name, title, description: `Deskripsi ${title}`, quizImage: name });

describe('quiz list and sitemap', () => {
    let requests;

    const renderAt = (path) => {
        requests = mockApi({
            'GET /api/verifyToken': () => [401, 'Sesi tidak valid'],
            'GET /api/fetchAnimalQuiz': () => [200, [card('binatang-laut', 'Binatang Laut')]],
            'GET /api/fetchMathQuiz': () => [200, [card('penjumlahan', 'Penjumlahan'), card('pengurangan', 'Pengurangan')]],
            'GET /api/fetchLanguageQuiz': () => [200, [card('kata-inggris', 'Kata Bahasa Inggris')]],
            'GET /api/fetchMiscellaneousQuiz': () => [200, [card('warna', 'Warna')]],
        });
        render(
            <MemoryRouter initialEntries={[path]}>
                <App />
            </MemoryRouter>
        );
    };

    afterEach(() => requests.restore());

    test('the quiz list shows every category in order, each with its own quizzes', async () => {
        renderAt('/quiz');
        await screen.findByText('Warna');

        const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
        expect(headings).toEqual(['Kuis Binatang', 'Kuis Matematika', 'Kuis Bahasa', 'Kuis Lain']);
        expect(screen.getByText('Penjumlahan').closest('a')).toHaveAttribute('href', '/quiz/penjumlahan');
        expect(screen.getByText('Deskripsi Binatang Laut')).toBeInTheDocument();
    });

    test('the sitemap links to every quiz under its category', async () => {
        renderAt('/sitemap');
        await screen.findByText('Warna');

        const math = screen.getByText('Kuis Matematika').nextElementSibling;
        expect(within(math).getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual(['/quiz/penjumlahan', '/quiz/pengurangan']);
    });
});
