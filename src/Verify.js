import { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';
import { useSearchParams } from 'react-router-dom';
import CryptoJS from 'crypto-js';

function Verify(props){
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(false);
    const [searchParams] = useSearchParams();
    let queryparam = searchParams.get("q");

    var key = CryptoJS.enc.Utf8.parse('b75524255a7f54d2726a951bb39204df');
    var iv  = CryptoJS.enc.Utf8.parse('1583288699248111');

    let decrypted = CryptoJS.AES.decrypt(queryparam, key, {iv: iv});
    decrypted = decrypted.toString(CryptoJS.enc.Utf8)

    const verifyToken = () =>{
        axios.post('/api/setVerified', {username: decrypted})
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if(response.status===200){
                setVerified(true)
        }})
        .catch(function (error) {
            setError(true)
            console.log(error);
        });
    }

    useEffect(()=>{verifyToken()}, [])
    
    return(
        <>
            {!verified && !error? <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
            </Spinner> : (verified && !error? <h2>Account Verified!</h2> : <h2>ERROR</h2>)}
        </>
    )
}

export default Verify;
