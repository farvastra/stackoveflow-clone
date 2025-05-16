import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/askquestionpage.css';

export default function AskQuestionPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !content) {
      setError('Both fields are required.');
      return;
    }

    setError('');
    setLoading(true);

    fetch('https://stackoverflow-clone-l1zd.onrender.com/api/questions/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ title, content }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        navigate(`/questions/${data.question_id}`);
      })
      .catch((error) => {
        setLoading(false);
        setError('Something went wrong. Please try again later.');
      });
  };

  return (
    <div className="ask-question">
      <h1>Ask a Question</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Question Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your question title"
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Question Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your problem in detail"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Question'}
        </button>
      </form>
    </div>
  );
}
