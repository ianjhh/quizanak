import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { mockApi } from './testing/mockApi';

const quiz = (name, title, questionCount) => ({
    name,
    title,
    category: 'math',
    quizImage: name,
    array: Array.from({ length: questionCount }, (_, i) => ({ question: `${title} soal ${i + 1}`, options: ['A', 'B'] })),
});

const QUIZZES = {
    penjumlahan: quiz('penjumlahan', 'Penjumlahan', 3),
    pengurangan: quiz('pengurangan', 'Pengurangan', 3),
};

describe('Quiz', () => {
    let requests;

    const renderAt = (path) => {
        requests = mockApi({
            'GET /api/verifyToken': () => [200, { verified: true, authorizedData: { username: 'budi' } }],
            'POST /api/fetchQuiz': ({ body }) => [200, QUIZZES[body.name] ? JSON.parse(JSON.stringify(QUIZZES[body.name])) : null],
            'POST /api/fetchSimilarQuiz': () => [200, [{ name: 'pengurangan', title: 'Pengurangan', quizImage: 'pengurangan' }]],
            'POST /api/checkAnswer': ({ body }) => [200, { correct: body.answer === 'A', answer: 'A' }],
            'POST /api/submitQuiz': () => [200, { score: 2, total: 3 }],
        });
        render(
            <MemoryRouter initialEntries={[path]}>
                <App />
            </MemoryRouter>
        );
    };

    afterEach(() => requests.restore());

    const progressText = (text) => (_, element) => element.tagName === 'P' && element.textContent === text;

    test('plays a quiz with fewer than 10 questions and lets the server score it', async () => {
        renderAt('/quiz/penjumlahan');
        fireEvent.click(await screen.findByText('Mulai Kuis'));

        for (let number = 1; number <= 3; number++) {
            expect(screen.getByText(progressText(`Pertanyaan ${number} dari 3`))).toBeInTheDocument();
            fireEvent.click(screen.getByLabelText(number === 3 ? 'B' : 'A'));
            fireEvent.click(screen.getByText('Kirim Jawaban'));
            await screen.findByText(number === 3 ? /Salah!/ : /Benar!/);
            fireEvent.click(screen.getByText(number === 3 ? 'Lihat Hasil Skor' : 'Pertanyaan Selanjutnya'));
        }

        expect(await screen.findByText('2 / 3')).toBeInTheDocument();
        const submitted = requests.find((r) => r.url === '/api/submitQuiz').body;
        expect(submitted.name).toBe('penjumlahan');
        expect(submitted.answers).toHaveLength(3);
    });

    test('asks for suggestions that exclude the current quiz by name', async () => {
        renderAt('/quiz/penjumlahan');
        await screen.findByText('Mulai Kuis');
        expect(requests.find((r) => r.url === '/api/fetchSimilarQuiz').body).toEqual({ quizName: 'penjumlahan', category: 'math' });
    });

    test('opening a suggested quiz starts it fresh without reloading the page', async () => {
        renderAt('/quiz/penjumlahan');
        fireEvent.click(await screen.findByText('Mulai Kuis'));
        for (let number = 1; number <= 3; number++) {
            fireEvent.click(screen.getByLabelText('A'));
            fireEvent.click(screen.getByText('Kirim Jawaban'));
            await screen.findByText(/Benar!/);
            fireEvent.click(screen.getByText(number === 3 ? 'Lihat Hasil Skor' : 'Pertanyaan Selanjutnya'));
        }

        fireEvent.click(await screen.findByText('Mulai!'));

        expect(await screen.findByText('Kuis Pengurangan')).toBeInTheDocument();
        expect(screen.getByText('Mulai Kuis')).toBeInTheDocument();
        expect(screen.queryByText('Hasil Akhir')).not.toBeInTheDocument();
    });

    test('says so when the quiz does not exist', async () => {
        renderAt('/quiz/tidak-ada');
        expect(await screen.findByText(/tidak ditemukan/)).toBeInTheDocument();
    });
});
