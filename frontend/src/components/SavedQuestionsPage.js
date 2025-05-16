import React, { useEffect, useState } from 'react';
import '../styles/savedquestions.css';  

const SavedQuestionsPage = ({ userId }) => {
  const [savedQuestions, setSavedQuestions] = useState([]);
  const token = localStorage.getItem('token'); 

  useEffect(() => {
    fetch('http://localhost:5000/api/saves/all', {
      headers: {
        'Authorization': `Bearer ${token}`, 
      }
    })
      .then(res => res.json())
      .then(data => setSavedQuestions(data))
      .catch(err => console.error('Failed to fetch saved questions', err));
  }, [userId, token]);

  return (
    <div className="saved-questions-page">
      <h2 className="saved-questions-title">Saved Questions</h2>
      <ul className="saved-questions-list">
        {savedQuestions.map(q => (
          <li key={q.id} className="saved-question-item">
            <a href={`/questions/${q.id}`} className="saved-question-link">{q.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SavedQuestionsPage;
