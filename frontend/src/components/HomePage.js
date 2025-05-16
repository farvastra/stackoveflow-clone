import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TopicFilter from './TopicFilter'; 
import '../styles/homepage.css';

export default function HomePage() {
  const [questions, setQuestions] = useState([]); 
  const [matchedQuestions, setMatchedQuestions] = useState(null); 
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/questions')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch questions');
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setQuestions(data);
        } else {
          setError('Unexpected data format');
        }
      })
      .catch((err) => {
        setError(err.message); 
      });
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home">
      <div className="home-header">
            <h1>Browse Questions</h1>
        <Link to="/ask">
          <button className="ask-question-btn">Ask Question</button>
        </Link>
      </div>

    
      <div style={{ marginBottom: '2rem' }}>
   
  <TopicFilter setQuestions={setMatchedQuestions} />

        {matchedQuestions !== null && (
          <>
            <h3>Matching Questions</h3>
            {matchedQuestions.length > 0 ? (
              <ul>
                {matchedQuestions.map(q => (
                  <li key={q.id}>
                    <Link to={`/questions/${q.id}`}>{q.title}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No matching questions found.</p>
            )}
          </>
        )}
      </div>

      <h2>Top Questions</h2>
      {questions.length > 0 ? (
        questions.map((q) => (
          <div key={q.id} className="question-card">
            <Link to={`/questions/${q.id}`}>
              <h3>{q.title}</h3>
            </Link>
            <p>{q.content.slice(0, 150)}...</p>
          </div>
        ))
      ) : (
        <p>No questions available.</p>
      )}
    </div>
  );
}
