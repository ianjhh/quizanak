import LoggedInNav from './LoggedInNav';
import { useEffect, useState } from 'react';
import Navapp from './Navapp';
import axios from 'axios';
import { Container, Row, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import './Quiz.css';

function Quiz(props){
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [score, setScore] = useState(0);
    const [quizList, setQuizList] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(1)
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizEnded, setQuizEnded] = useState(false);
    const [answer, setAnswer] = useState("");
    const [clickedNext, setClickedNext] = useState(false);
    const [quizProperty, setQuizProperty] = useState();
    const [isCorrect, setIsCorrect] = useState();
    const [quizImage, setQuizImage] = useState();
    const [username, setUsername] = useState('');
    const location = useLocation();
    const quizName = location.pathname.split('/')[2];
    const navigate = useNavigate();

    function shuffle(array) {
        let currentIndex = array.length;
      
        // While there remain elements to shuffle...
        while (currentIndex !== 0) {
      
          // Pick a remaining element...
          let randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
    }

    const verifyToken = () =>{
        axios.get('/api/verifyToken', { withCredentials: true })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.data.verified === true){
                setIsLoggedIn(true)
            }
            else{
                navigate('/verify')
            }
        })
        .catch(function (error) {
            navigate('/login')
            console.log(error.response.status)
        });
}

    const fetchQuiz = () =>{
        axios.post('/api/fetchQuiz', {
            name: quizName
        })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                let arr = response.data.array;
                shuffle(arr)
                setQuizList(arr);
                setQuizProperty(response.data.title)
                setQuizImage(response.data.quizImage)
            }
        })
        .catch(function (error) {
            console.log(error.response.status);
        });
    }

    const startQuiz = () => {
        setQuizStarted(true);
    };

    const handleNext = () => {
        /* set answerArr[currentQuestion-1] === answer */
        setClickedNext(true);
        setAnswer('');
        
        /* handle score adding */
        if (quizList[currentQuestion-1].answer === answer){
            setScore(score+1)
            setIsCorrect('Benar')
        }
        else{
            setIsCorrect('Salah')
        }
    };

    const handleMoveNextQ = () => {
        setClickedNext(false);
        setCurrentQuestion(currentQuestion+1);
    }

    const handleFinishQuiz = () => {
        setCurrentQuestion(currentQuestion+1);
        if (quizList[currentQuestion-1].answer === answer){
            setScore(score+1)
        }
        setQuizEnded(true)

        /* store quiz result for user */
        axios.post('/api/quizHistory', {
            username: username,
            quizname: quizName,
            score: score
        })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                
            }
        })
        .catch(function (error) {
            console.log(error.response.status);
        });
    };

    const onOptionChange = e => {
        setAnswer(e.target.value)
    }

    useEffect(()=>{verifyToken(); fetchQuiz();}, [])

    return(
        <div className='bg-warning'>  
            {isLoggedIn? <LoggedInNav /> : <Navapp />}
            <Container className='mt-4'>
                <Row>
                <div className='col-2'>
                    <Link to='/quiz' className='text-decoration-none'><Button variant='primary'><i className="bi bi-arrow-left-short"></i>Daftar Kuis</Button></Link>
                </div>
                
                <div className='col-8 rounded quiz-container'>
                    {!quizStarted? 
                    <div className='text-center mt-3'>
                        {quizProperty && quizImage? <><h1 className='mb-3'>Kuis {quizProperty}</h1><img width={300} height={300} src={require(`./${quizImage}.jpg`)} /></> : null}<br/><br/>
                        <Button variant='primary' className='mb-4 fs-3'
                        onClick={startQuiz}>
                        Mulai
                        </Button>
                    </div>
                    :
                    (!quizEnded? <>
                        {quizList? <><h3>Q{currentQuestion}: {quizList[currentQuestion-1].question}</h3>
                        {quizList[currentQuestion-1].imagesrc? <><img className='mb-3' src={require(`./${quizList[currentQuestion-1].imagesrc}.jpg`)} alt="Logo" height={300} /></> : null}
                        {!clickedNext? quizList[currentQuestion-1].options.map((option, index) =>
                        <div className="form-check radio-toolbar" key={index}>
                            <Row xs={2} md={2} className="g-4">
                        <input className="form-check-input fs-5" type="radio" name="flexRadioDefault" id={`flexRadioDefault${index}`} value={option} checked={answer === option} onChange={onOptionChange} />
                        <label className="form-check-label fs-5" htmlFor={`flexRadioDefault${index}`}>
                            {option}
                        </label>
                        </Row>
                        </div>
                        ) : null}</> : null}
                        {currentQuestion>=10 ? <Button variant='primary' className='fs-5 mt-3 mb-3' onClick={handleFinishQuiz}>Finish</Button> : (!clickedNext?<Button variant='success' onClick={handleNext} className='mb-3 mt-3 fs-5'>Next</Button> : null)}
                        {clickedNext? <>{isCorrect==='Benar'? <p className='fs-5 correctanswer'><i class="bi bi-check"></i>{isCorrect}!</p> : <p className='fs-5 wronganswer'><i className="bi bi-x"></i>{isCorrect}! jawaban yang benar adalah "{quizList[currentQuestion-1].answer}"</p>}<br/><br/><br/><br/><br/><br/><br/><Button variant='primary' className='mb-3 mt-4 fs-5' onClick={handleMoveNextQ}>Next Question</Button></> : null}
                    </>
                    : 
                    <h1 className='text-center'>Skor Total: <br/>{score}/10</h1>)}
                </div>
                </Row>
            </Container><br/><br/>
            <Footer />
        </div>
    );
}

export default Quiz;
