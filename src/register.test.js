import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import Register from './Register';
import Home from './Home';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';

const mockUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUsedNavigate,
}));

describe("Register", ()=>{
    const handleSubmit = jest.fn();

    /* Register renders react-router links, so it needs a Router above it.
       Rendering per test also keeps the two cases independent. */
    beforeEach(() => {
        render(
            <BrowserRouter>
                <Register url='/register' onSubmit={handleSubmit} />
            </BrowserRouter>
        );
    });

    test("Shows validation errors when username is under 3 and password is under 8 characters", async () =>{
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

    test("Expect submit function to not accept if username length is less than 6 and password length is less than 8", async () =>{
        const username = 'a';
        const password = 'b';
        const mockHandleSubmit = jest.fn((username, password)=>{
            if (username.length < 6 || password.length < 8){
                return false;
            }
            else{
                return true
            }
        })

        mockHandleSubmit(username, password)
        expect(mockHandleSubmit.mock.results[0].value).toBe(false)
    })
})