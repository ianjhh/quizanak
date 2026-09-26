import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Verify from './Verify';
import { mockApi } from './testing/mockApi';

describe('Verify', () => {
    let alertSpy;
    let requests;

    const renderWith = (routes) => {
        requests = mockApi({
            'GET /api/verifyToken': () => [200, { verified: false, authorizedData: { username: 'dewi' } }],
            ...routes,
        });
        render(
            <MemoryRouter>
                <Verify />
            </MemoryRouter>
        );
    };

    beforeEach(() => {
        alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        alertSpy.mockRestore();
        requests.restore();
    });

    test('submits only the digits of the code and confirms the account', async () => {
        renderWith({ 'POST /api/setVerified': () => [200, { verified: true }] });

        fireEvent.change(screen.getByLabelText('Kode Verifikasi'), { target: { value: '12 34-56' } });
        fireEvent.click(screen.getByText('Verifikasi!'));

        await waitFor(() => expect(screen.getByText(/Akun telah diverifikasi/)).toBeInTheDocument());
        expect(requests.find((r) => r.url === '/api/setVerified').body).toEqual({ verificationCode: '123456' });
    });

    test("shows the server's reason for a rejected code", async () => {
        renderWith({ 'POST /api/setVerified': () => [400, 'Kode verifikasi salah!'] });

        fireEvent.change(screen.getByLabelText('Kode Verifikasi'), { target: { value: '000000' } });
        fireEvent.click(screen.getByText('Verifikasi!'));

        await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Kode verifikasi salah!'));
    });

    test('asks for a new code right away, without waiting for the page to load a username', async () => {
        renderWith({ 'POST /api/resendCode': () => [429, 'Tunggu 42 detik sebelum meminta kode baru.'] });

        fireEvent.click(screen.getByText('Kirim Ulang Kode'));

        await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Tunggu 42 detik sebelum meminta kode baru.'));
        expect(requests.find((r) => r.url === '/api/resendCode').body).toBeUndefined();
    });
});
