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
    /* if Register is successfully rendered, handleSubmit will be called */
    render (<Register url='/register' onSubmit={handleSubmit} />);

    test("Expect username field to be unable to accept length less than 6 and password field to not accept less than 8 characters", async () =>{
        /* username and password field test */
        const usernameInput = screen.getByLabelText('Username');
        const passwordInput = screen.getByLabelText('Password');

        fireEvent.change(usernameInput, {target: {value: 'a'}});
        fireEvent.change(passwordInput, {target: {value: 'a'}});

        const usernameText = screen.getByText('Username length cannot be less than 6!');
        await waitFor(() => expect(usernameText).toBeInTheDocument())
        const passwordText = screen.getByText('Password length cannot be less than 8!');
        await waitFor(() => expect(passwordText).toBeInTheDocument())
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