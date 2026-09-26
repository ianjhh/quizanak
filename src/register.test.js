import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import Register from './Register';
import { BrowserRouter } from "react-router-dom";
import { mockApi } from './testing/mockApi';

const mockUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUsedNavigate,
}));

describe("Register", ()=>{
    let alertSpy;
    let requests;

    // Renders the page against a fake API; `register` answers the sign-up request.
    const renderWith = (register) => {
        requests = mockApi({
            'GET /api/verifyToken': () => [401, 'Sesi tidak valid'],
            'POST /api/validateEmail': () => [200, 'Email does not exist!'],
            'POST /api/register': register,
        });
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );
    };

    beforeEach(() => {
        mockUsedNavigate.mockClear();
        alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        alertSpy.mockRestore();
        requests.restore();
    });

    const fillForm = () => {
        fireEvent.change(screen.getByLabelText('Username'), {target: {value: 'dewi'}});
        fireEvent.change(screen.getByLabelText('Kata Sandi'), {target: {value: 'rahasia123'}});
        fireEvent.change(screen.getByLabelText('Ketik Ulang Kata Sandi'), {target: {value: 'rahasia123'}});
        fireEvent.change(screen.getByLabelText('Email'), {target: {value: 'dewi@example.com'}});
        fireEvent.click(screen.getByText('Daftar Sekarang'));
    };

    test("Shows validation errors when username is under 3 and password is under 8 characters", async () =>{
        renderWith(() => [500, 'unused']);
        /* username and password field test */
        const usernameInput = screen.getByLabelText('Username');
        const passwordInput = screen.getByLabelText('Kata Sandi');

        /* validation runs on blur, so each field must be changed then blurred */
        fireEvent.change(usernameInput, {target: {value: 'a'}});
        fireEvent.blur(usernameInput);
        fireEvent.change(passwordInput, {target: {value: 'a'}});
        fireEvent.blur(passwordInput);

        await waitFor(() =>
            expect(screen.getByText('Panjang username tidak boleh kurang dari 3!')).toBeInTheDocument()
        );
        await waitFor(() =>
            expect(screen.getByText('Panjang kata sandi tidak boleh kurang dari 8!')).toBeInTheDocument()
        );
    })

    test("Sends only the username, password and email, then opens the verify page", async () =>{
        renderWith(() => [200, { message: 'Successful!', token: 'token', emailSent: true }]);
        fillForm();

        await waitFor(() => expect(mockUsedNavigate).toHaveBeenCalledWith('/verify', { replace: true }));
        /* the server hashes the password and decides the account's other fields */
        const signUp = requests.find((r) => r.url === '/api/register');
        expect(signUp.body).toEqual({ username: 'dewi', password: 'rahasia123', email: 'dewi@example.com' });
        expect(alertSpy).toHaveBeenCalledWith('Kode verifikasi telah dikirim ke email anda!');
    })

    test("Explains when the account was created but the email could not be sent", async () =>{
        renderWith(() => [200, { message: 'Successful!', token: 'token', emailSent: false }]);
        fillForm();

        await waitFor(() => expect(mockUsedNavigate).toHaveBeenCalledWith('/verify', { replace: true }));
        expect(alertSpy.mock.calls[0][0]).toMatch(/email verifikasi gagal dikirim/);
    })

    test("Shows the server's reason when the username is taken", async () =>{
        renderWith(() => [409, 'Username sudah dipakai!']);
        fillForm();

        await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Username sudah dipakai!'));
        expect(mockUsedNavigate).not.toHaveBeenCalled();
    })
})
