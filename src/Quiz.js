import LoggedInNav from './LoggedInNav';
import { useEffect, useState } from 'react';
import Navapp from './Navapp';
import axios from 'axios';
import { Container, Row, Button, Col, Card } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import './Quiz.css';
import Spinner from 'react-bootstrap/Spinner';


// Safe image require helper to prevent crashes on missing database image references
const safeRequire = (imageName) => {
  try {
    return require(`./assets/images/${imageName}.jpg`);
  } catch (err) {
    try {
      return require('./assets/images/binatang-laut1.jpg'); // secure fallback
    } catch (e) {
      return '';
    }
  }
};

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
    const [similarQuiz, setSimilarQuiz] = useState([])
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
                setUsername(response.data.authorizedData.username)
            }
            else{
                navigate('/verify', { replace: true })
            }
        })
        .catch(function (error) {
            navigate('/login', { replace: true })
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
            return response.data
        })
        .then(function(data){
            axios.post('/api/fetchSimilarQuiz', {
                quizName: data.title, category: data.category
            })
            .then(function (response) {
                /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
                if (response.status === 200){
                    let responseArr = response.data;
                    shuffle(responseArr)
                    responseArr = responseArr.slice(0, 3)
                    setSimilarQuiz(responseArr)
                }
            })
            .catch(function (error) {
                console.log(error.response.status);
            });
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

    function LoggedInRender({isLoggedIn}){
        if (isLoggedIn){
            return (<div className='bg-warning'>  
            <LoggedInNav />
            <Container className='mt-3'>
                <Row>
                <div className='col-12 col-sm-12 col-lg-2'>
                    <Link to='/quiz' className='text-decoration-none back-button'><Button variant='danger' className='mb-3'><i className="bi bi-arrow-left-short"></i>Daftar Kuis</Button></Link>
                </div>
                
                    <div className='col-12 col-sm-12 col-lg-10 col-xl-8 quiz-container'>
                        {!quizStarted? 
                        <div className='text-center mt-3'>
                            {quizProperty && quizImage? 
                            <>
                                <h1 className='mb-3'>Quiz {quizProperty}</h1>
                                <img width={300} height={300} src={safeRequire(quizImage)} /><br/><br/>
                                <Button variant='primary' className='mb-4 fs-3' onClick={startQuiz}>Mulai</Button>
                            </> 
                            : 
                            <><Spinner animation="border" role="status" variant="dark" className='mt-5 mb-5'>
                                <span className="visually-hidden">Loading...</span>
                            </Spinner></>}
                    </div>
                    :
                    (!quizEnded? <>
                        {quizList? <><h3>Q{currentQuestion}: {quizList[currentQuestion-1].question}</h3>
                        {quizList[currentQuestion-1].imagesrc? <><img className='mb-3 questionImage' src={safeRequire(quizList[currentQuestion-1].imagesrc)} alt="Logo" /></> : null}
                        {!clickedNext? quizList[currentQuestion-1].options.map((option, index) =>
                        <div className="form-check radio-toolbar" key={index}>
                            <Row className="g-4 quiz-options-width col-10 col-sm-7 col-md-6 col-lg-5">
                        <input className="form-check-input fs-5" type="radio" name="flexRadioDefault" id={`flexRadioDefault${index}`} value={option} checked={answer === option} onChange={onOptionChange} />
                        <label className="form-check-label fs-5 py-1 px-3" htmlFor={`flexRadioDefault${index}`}>
                            {option}
                        </label>
                        </Row>
                        </div>
                        ) : null}</> : null}
                        {currentQuestion>=10 ? <Button variant='primary' className='fs-5 mt-3 mb-3 w-50' onClick={handleFinishQuiz}>Finish</Button> : (!clickedNext?<Button variant='success' onClick={handleNext} className='mb-3 mt-3 fs-5 w-50'>Next</Button> : null)}
                        {clickedNext? <>{isCorrect==='Benar'? <p className='fs-4 correctanswer'><i class="bi bi-check"></i>{isCorrect}!</p> : <p className='fs-4 wronganswer'><i className="bi bi-x"></i>{isCorrect}! jawaban yang benar adalah "{quizList[currentQuestion-1].answer}"</p>}<br/><br/><br/><br/><br/><br/><br/><Button variant='primary' className='mb-3 mt-4 fs-5 w-50 next-question' onClick={handleMoveNextQ}>Next Question</Button></> : null}
                    </>
                    : 
                    <>
                        <h1 className='text-center mt-3 mb-0'>Skor Total: <br/><b>{score}/10</b></h1><br/><br/>
                        <h3 className='text-center'>Coba juga:</h3>
                        <Row xs={1} sm={2} md={3} className="g-4 mb-3 mx-auto">
                            {similarQuiz.map((item, idx) => (
                                    <Col key={idx} className='quiz-col-end'>
                                    <Card>
                                        <Card.Img variant="top" src={safeRequire(item.quizImage)} className='img-card' />
                                        <Card.Body>
                                        <Card.Title>{item.title}</Card.Title>
                                        <Button variant="primary" onClick={()=>{navigate(`/quiz/${item.name}`); window.location.reload()}}>Mulai!</Button>
                                        </Card.Body>
                                    </Card>
                                    </Col>
                            ))}
                        </Row><br/>
                    </>)}
                </div>
                <Link to='/quiz' className='text-decoration-none back-button-bottom mt-3'><Button variant='danger' className='fs-5'><i className="bi bi-arrow-left-short"></i>Daftar Kuis</Button></Link>
                </Row>
            </Container><br/>
            <Footer />
            </div>)
        }
        return <Spinner animation="border" role="status" variant="success">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    }

    useEffect(()=>{verifyToken(); fetchQuiz();}, [])

    return(
        <>
            <LoggedInRender isLoggedIn={isLoggedIn} />
        </>
    );
}

export default Quiz;
