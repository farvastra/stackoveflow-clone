import React, { useState, useEffect } from 'react';
import '../styles/savebutton.css';

const SaveButton = ({ userId, questionId }) => {
  const [isSaved, setIsSaved] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!userId || !questionId) return;

   
    const savedState = localStorage.getItem(`question_${questionId}_saved`);
    if (savedState !== null) {
      setIsSaved(JSON.parse(savedState));
    } else {

      fetch('http://localhost:5000/api/saves/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((savedQuestions) => {
          const isAlreadySaved = savedQuestions.some((q) => q.id === questionId);
          setIsSaved(isAlreadySaved);
        
          localStorage.setItem(`question_${questionId}_saved`, JSON.stringify(isAlreadySaved));
        })
        .catch((error) => console.error('Error fetching saved questions:', error));
    }
  }, [userId, questionId, token]);


  const handleSave = () => {
    fetch('http://localhost:5000/api/saves/save-q', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId, question_id: questionId }),
    })
      .then((res) => {
        if (res.ok) {
          setIsSaved(true);
          localStorage.setItem(`question_${questionId}_saved`, JSON.stringify(true)); 
          console.log('Question saved');
        } else {
          console.error('Failed to save question');
        }
      })
      .catch((error) => console.error('Error saving question:', error));
  };

  const handleUnsave = () => {
    fetch('http://localhost:5000/api/saves/unsave', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId, question_id: questionId }),
    })
      .then((res) => {
        if (res.ok) {
          setIsSaved(false);
          localStorage.setItem(`question_${questionId}_saved`, JSON.stringify(false)); 
          console.log('Question unsaved');
        } else {
          console.error('Failed to unsave question');
        }
      })
      .catch((error) => console.error('Error unsaving question:', error));
  };

  return (
    <button className="save-button" id="saveBtn" onClick={isSaved ? handleUnsave : handleSave}>
      {isSaved ? 'Unsave' : 'Save Question'}
    </button>
  );
};

export default SaveButton;
