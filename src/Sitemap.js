import Navapp from './Navapp';
import LoggedInNav from './LoggedInNav';
import Footer from './Footer';
import { Fragment } from 'react';
import { Row, Container, Col } from 'react-bootstrap';
import { Link } from "react-router-dom";
import { useSession } from './useSession';
import { QUIZ_CATEGORIES, useQuizCategories } from './quizCategories';

function Sitemap(){
    const { status } = useSession('public');
    const isLoggedIn = status === 'verified';
    const quizzes = useQuizCategories();

    return(
        <>
        <div className="glow-blob-1"></div>
        <div className="glow-blob-2"></div>
        {isLoggedIn ? <LoggedInNav /> : <Navapp />}
        <div className="main-content-wrapper">
            <Container>
                <div className="glass-panel p-4 p-md-5 mx-auto" style={{maxWidth: '800px'}}>
                    <h3 className="fw-bold mb-4" style={{background: 'linear-gradient(135deg, #fff, var(--color-warning))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block'}}>
                        Peta Situs (Sitemap)
                    </h3>

                    {QUIZ_CATEGORIES.map((category) => (
                        <Fragment key={category.key}>
                            <h5 className="fw-bold text-white mt-4 mb-3 border-bottom pb-2 border-secondary">{category.title}</h5>
                            <Row xs={1} md={2} className="g-3 mb-4">
                                {(quizzes[category.key] || []).map((item, idx) => (
                                    <Col key={idx}>
                                        <Link to={`/quiz/${item.name}`} className='text-decoration-none text-info fw-semibold hover-opacity'>
                                            <i className="bi bi-chevron-right me-2 small"></i>{item.title}
                                        </Link>
                                    </Col>
                                ))}
                            </Row>
                        </Fragment>
                    ))}
                </div>
            </Container>
            <br/><br/>
            <Footer />
        </div>
        </>
    );
}

export default Sitemap;
