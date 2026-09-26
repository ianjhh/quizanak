import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Where each kind of page sends a visitor, by session status:
//   public   anyone may stay; unverified accounts go to /verify first
//   members  verified users only; guests go to /login, unverified to /verify
//   guests   login and sign-up; signed-in users go home or to /verify
//   verify   the verify page; guests go to /login, verified users go home
const REDIRECTS = {
    public: { unverified: '/verify' },
    members: { guest: '/login', unverified: '/verify' },
    guests: { verified: '/', unverified: '/verify' },
    verify: { guest: '/login', verified: '/' },
};

// Asks the API who is signed in and redirects as the page's access rule says.
// `status` is 'loading', 'guest', 'unverified' or 'verified'; call refresh()
// to check again, for example right after logging in.
export function useSession(access = 'public') {
    const [session, setSession] = useState({ status: 'loading', username: '' });
    const [checks, setChecks] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;
        const settle = (status, username = '') => {
            if (!active) {
                return;
            }
            const target = REDIRECTS[access][status];
            if (target) {
                navigate(target, { replace: true });
            }
            setSession({ status, username });
        };

        axios.get('/api/verifyToken')
            .then(({ data }) => settle(data.verified === true ? 'verified' : 'unverified', data.authorizedData.username))
            .catch(() => settle('guest'));

        return () => {
            active = false;
        };
    }, [access, navigate, checks]);

    const refresh = useCallback(() => setChecks((count) => count + 1), []);
    return { ...session, refresh };
}
