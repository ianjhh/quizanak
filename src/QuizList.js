import './QuizList.css';
import Navapp from './Navapp';
import LoggedInNav from './LoggedInNav';
import Footer from './Footer';
import { Fragment } from 'react';
import { Row, Container, Button, Card, Col } from 'react-bootstrap';
import { Link } from "react-router-dom";
import { imageFor } from './images';
import { useSession } from './useSession';
import { QUIZ_CATEGORIES, useQuizCategories } from './quizCategories';

function QuizList(props){
    const { status } = useSession('public');
    const isLoggedIn = status === 'verified';
    const quizzes = useQuizCategories();

    return(
        <>
            <div className="glow-blob-1"></div>
            <div className="glow-blob-2"></div>
            {isLoggedIn ? <LoggedInNav /> : <Navapp />}
            <div className='main-content-wrapper'>
                <Container>
                    <Link to='/' className='text-decoration-none'>
                        <Button className='btn-primary-glow mb-4'>
                            <i className="bi bi-arrow-left-short"></i> Kembali
                        </Button>
                    </Link>

                    {QUIZ_CATEGORIES.map((category) => (
                        <Fragment key={category.key}>
                            <h3 className='section-title'>{category.title}</h3>
                            <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4 quiz-grid-custom">
                                {(quizzes[category.key] || []).map((item, idx) => (
                                    <Col key={idx} className='quiz-col-list'>
                                        <Link to={`/quiz/${item.name}`} className='text-decoration-none'>
                                            <Card className='glass-panel glass-panel-hover quiz-card-list'>
                                                <Card.Img variant="top" src={imageFor(item.quizImage)} className='img-card-list' />
                                                <Card.Body className='card-body-list'>
                                                    <Card.Title className="card-title-list">{item.title}</Card.Title>
                                                    <Card.Text className='card-description-list'>
                                                        {item.description}
                                                    </Card.Text>
                                                </Card.Body>
                                            </Card>
                                        </Link>
                                    </Col>
                                ))}
                            </Row>
                        </Fragment>
                    ))}
                </Container>
            </div>
            <Footer />
        </>
    );
}

export default QuizList;
