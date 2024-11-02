import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import Home from './Home';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';

const server = setupServer(
    /* mocks the /login endpoint */
        http.post('/login', async ({request}) => {
        const info = await request.formData();
        const username = info.get('username');
        const password = info.get('password');
        
        /* check if user credential matches one in database */
        if (username === 'a' && password === 'a'){
            return HttpResponse.status(200);
        }
        else{
            return HttpResponse.status(400);
        }
    }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("Home", ()=>{

    test("Expect username field to set value as user input", async () =>{
        const handleSubmit = jest.fn();
        /* if Home is successfully rendered, handleSubmit will be called */
        render (
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Home onSubmit={handleSubmit} />} />
                </Routes>
            </BrowserRouter>
        );

        const usernameInput = screen.getByLabelText('Username');
        await waitFor(() =>expect(usernameInput.value).toBe(''));
        /* mock input of value 'a'*/
        fireEvent.change(usernameInput, {target: {value: 'a'}});
        await waitFor(() =>expect(usernameInput.value).toBe('a'));
    });

    test("Handles server error", async () =>{
        server.use(
            http.post('/login', ({request}) =>{
                return new HttpResponse(null, {status: 400})
            })
        )

        render(
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Home />} />
                </Routes>
            </BrowserRouter>
        )
       
        fireEvent.change(screen.getByLabelText("Username"), { target: { value: 'b' } })
        fireEvent.change(screen.getByLabelText("Kata Sandi"), { target: { value: 'b' } })
        fireEvent.click(screen.getByText('Masuk'))
        await waitFor(() =>expect(screen.getByLabelText('Username')).toHaveValue('b'));
        await waitFor(() =>expect(screen.getByLabelText('Kata Sandi')).toHaveValue('b'));
        await waitFor(() =>expect(screen.getByText('Masuk')).not.toBeDisabled())
    })
})