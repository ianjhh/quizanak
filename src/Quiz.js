import LoggedInNav from './LoggedInNav';
import { useEffect, useState } from 'react';
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
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizEnded, setQuizEnded] = useState(false);
    const [answer, setAnswer] = useState("");
    const [clickedNext, setClickedNext] = useState(false);
    const [quizProperty, setQuizProperty] = useState();
    const [isCorrect, setIsCorrect] = useState();
    const [quizImage, setQuizImage] = useState();
    const [username, setUsername] = useState('');
    const [similarQuiz, setSimilarQuiz] = useState([]);
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
            console.log(error.response ? error.response.status : error)
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
                console.log(error.response ? error.response.status : error);
            });
        })
        .catch(function (error) {
            console.log(error.response ? error.response.status : error);
        });
    }

    const startQuiz = () => {
        setQuizStarted(true);
    };

    const handleNext = () => {
        setClickedNext(true);
        
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
        setAnswer('');
        setCurrentQuestion(currentQuestion+1);
    }

    const handleFinishQuiz = () => {
        if (quizList[currentQuestion-1].answer === answer){
            setScore(score+1)
        }
        setQuizEnded(true)

        /* store quiz result for user */
        axios.post('/api/quizHistory', {
            username: username,
            quizname: quizName,
            score: score + (quizList[currentQuestion-1].answer === answer ? 1 : 0)
        })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
        })
        .catch(function (error) {
            console.log(error.response ? error.response.status : error);
        });
    };

    const onOptionChange = e => {
        setAnswer(e.target.value)
    }

    function LoggedInRender({isLoggedIn}){
        if (isLoggedIn){
            return (
                <div className="position-relative">
                    <div className="glow-blob-1"></div>
                    <div className="glow-blob-2"></div>
                    <LoggedInNav />
                    <Container className='mt-4 position-relative' style={{zIndex: 2}}>
                        <Row>
                            <Col xs={12} lg={2} className="mb-3">
                                <Link to='/quiz' className='text-decoration-none back-button'>
                                    <Button className='btn-danger-glow back-btn-custom w-100'>
                                        <i className="bi bi-arrow-left-short"></i> Daftar Kuis
                                    </Button>
                                </Link>
                            </Col>
                            
                            <Col xs={12} lg={8} className="mx-auto">
                                <div className='glass-panel quiz-container-custom'>
                                    {!quizStarted ? (
                                        <div className='text-center py-4'>
                                            {quizProperty && quizImage ? (
                                                <>
                                                    <h1 className='quiz-title-main'>Kuis {quizProperty}</h1>
                                                    <img 
                                                        width={300} 
                                                        height={300} 
                                                        src={safeRequire(quizImage)} 
                                                        className="img-fluid rounded-4 mb-4 shadow"
                                                        style={{objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)'}}
                                                        alt="Cover Kuis"
                                                    />
                                                    <br/>
                                                    <Button className='btn-primary-glow px-5 py-3 fs-4' onClick={startQuiz}>
                                                        Mulai Kuis
                                                    </Button>
                                                </> 
                                            ) : (
                                                <div className="py-5">
                                                    <Spinner animation="border" role="status" variant="light">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </Spinner>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        !quizEnded ? (
                                            <>
                                                {quizList.length > 0 && (
                                                    <>
                                                        <div className="progress-container">
                                                            <div 
                                                                className="progress-bar-fill" 
                                                                style={{ width: `${(currentQuestion - 1) * 10}%` }}
                                                            ></div>
                                                        </div>
                                                        <p className="text-white-50 text-center mb-4">
                                                            Pertanyaan <strong>{currentQuestion}</strong> dari 10
                                                        </p>

                                                        <div className="question-box mb-4">
                                                            <h3 className="question-text">
                                                                {quizList[currentQuestion-1].question}
                                                            </h3>
                                                        </div>

                                                        {quizList[currentQuestion-1].imagesrc && (
                                                            <div className="text-center mb-4">
                                                                <img 
                                                                    className='questionImage img-fluid shadow-lg' 
                                                                    src={safeRequire(quizList[currentQuestion-1].imagesrc)} 
                                                                    alt="Pertanyaan" 
                                                                />
                                                            </div>
                                                        )}

                                                        {!clickedNext ? (
                                                            <div className="options-grid radio-toolbar">
                                                                {quizList[currentQuestion-1].options.map((option, index) => (
                                                                    <div key={index}>
                                                                        <input 
                                                                            type="radio" 
                                                                            name="quizOptions" 
                                                                            id={`option${index}`} 
                                                                            value={option} 
                                                                            checked={answer === option} 
                                                                            onChange={onOptionChange} 
                                                                        />
                                                                        <label htmlFor={`option${index}`}>
                                                                            {option}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                {isCorrect === 'Benar' ? (
                                                                    <div className="correct-alert">
                                                                        <i className="bi bi-check-circle-fill me-2"></i> Benar! Jawaban kamu tepat.
                                                                    </div>
                                                                ) : (
                                                                    <div className="wrong-alert">
                                                                        <i className="bi bi-x-circle-fill me-2"></i> Salah! Jawaban yang benar adalah: <strong>"{quizList[currentQuestion-1].answer}"</strong>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {!clickedNext ? (
                                                    <Button 
                                                        className="btn-success-glow w-100 py-3 fs-5 mt-2" 
                                                        onClick={handleNext}
                                                        disabled={!answer}
                                                    >
                                                        Kirim Jawaban
                                                    </Button>
                                                ) : (
                                                    currentQuestion >= 10 ? (
                                                        <Button 
                                                            className="btn-primary-glow w-100 py-3 fs-5 mt-2" 
                                                            onClick={handleFinishQuiz}
                                                        >
                                                            Lihat Hasil Skor
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            className="btn-primary-glow w-100 py-3 fs-5 mt-2" 
                                                            onClick={handleMoveNextQ}
                                                        >
                                                            Pertanyaan Selanjutnya
                                                        </Button>
                                                    )
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-4">
                                                <h4 className="text-white-50 uppercase mb-2">Hasil Akhir</h4>
                                                <h1 className="quiz-score-display">{score} / 10</h1>
                                                <p className="text-white-50 mb-5">Kerja bagus! Teruslah berlatih kuis agar semakin pintar.</p>

                                                <h4 className="text-start border-bottom pb-2 mb-3 border-secondary">Coba Kuis Lainnya:</h4>
                                                <Row xs={1} sm={2} md={3} className="g-4 mb-4">
                                                    {similarQuiz.map((item, idx) => (
                                                        <Col key={idx}>
                                                            <Card className="glass-panel glass-panel-hover quiz-card-custom text-start border-0">
                                                                <Card.Img variant="top" src={safeRequire(item.quizImage)} className='img-card' />
                                                                <Card.Body className="d-flex flex-column justify-content-between p-3">
                                                                    <Card.Title className="fs-6 fw-semibold text-white mb-3">{item.title}</Card.Title>
                                                                    <Button 
                                                                        className="btn-primary-glow py-2 w-100" 
                                                                        onClick={()=>{navigate(`/quiz/${item.name}`); window.location.reload()}}
                                                                    >
                                                                        Mulai!
                                                                    </Button>
                                                                </Card.Body>
                                                            </Card>
                                                        </Col>
                                                    ))}
                                                </Row>
                                                <Link to='/quiz' className='text-decoration-none'>
                                                    <Button className='btn-danger-glow back-btn-custom px-4 py-2 mt-2'>
                                                        <i className="bi bi-arrow-left-short"></i> Daftar Kuis
                                                    </Button>
                                                </Link>
                                            </div>
                                        )
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Container>
                    <br/>
                    <Footer />
                </div>
            )
        }
        return (
            <div className="d-flex justify-content-center align-items-center" style={{minHeight: '100vh', backgroundColor: 'var(--bg-main)'}}>
                <Spinner animation="border" role="status" variant="light">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        )
    }

    useEffect(()=>{verifyToken(); fetchQuiz();}, [])

    return(
        <>
            <LoggedInRender isLoggedIn={isLoggedIn} />
        </>
    );
}

export default Quiz;
