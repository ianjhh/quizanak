import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from './Home';
import { mockApi } from './testing/mockApi';

describe("Home", ()=>{
    let alertSpy;
    let requests;
    let signedIn;

    beforeEach(() => {
        signedIn = false;
        alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
        requests = mockApi({
            'GET /api/verifyToken': () => (signedIn
                ? [200, { verified: true, authorizedData: { username: 'budi' } }]
                : [401, 'Sesi tidak valid']),
            'POST /api/login': ({ body }) => {
                if (body.password !== 'rahasia123') {
                    return [404, 'Username atau kata sandi salah!'];
                }
                signedIn = true;
                return [200, { verified: true, token: 'token' }];
            },
            'POST /api/fetchHistory': () => [200, [['penjumlahan', 8], ['warna', 10]]],
        });
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
    });

    afterEach(() => {
        alertSpy.mockRestore();
        requests.restore();
    });

    const logIn = (password) => {
        fireEvent.change(screen.getByLabelText("Username"), { target: { value: 'budi' } });
        fireEvent.change(screen.getByLabelText("Kata Sandi"), { target: { value: password } });
        fireEvent.click(screen.getByText('Masuk'));
    };

    test("Expect username field to set value as user input", async () =>{
        const usernameInput = screen.getByLabelText('Username');
        expect(usernameInput.value).toBe('');
        fireEvent.change(usernameInput, {target: {value: 'a'}});
        expect(usernameInput.value).toBe('a');
    });

    test("Shows the server's message when the login fails", async () =>{
        logIn('salah');

        await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Username atau kata sandi salah!'));
        expect(screen.getByLabelText('Username')).toHaveValue('budi');
        expect(screen.getByText('Masuk')).not.toBeDisabled();
    });

    test("Shows the user's name and recent scores after logging in, without reloading", async () =>{
        logIn('rahasia123');

        expect(await screen.findByText('budi')).toBeInTheDocument();
        await screen.findByText('warna');
        /* newest first */
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('warna10');
        expect(rows[2]).toHaveTextContent('penjumlahan8');
        expect(screen.queryByText('Masuk')).not.toBeInTheDocument();
    });
})
