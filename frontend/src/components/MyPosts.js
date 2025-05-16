import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function MyPosts() {
  const [myQuestions, setMyQuestions] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const decodedToken = jwtDecode(token);
      const userId = parseInt(decodedToken.sub);
      setLoggedInUserId(userId);

      fetch(`http://localhost:5000/api/questions/my-questions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
        .then(res => {
          
          if (!res.ok) throw new Error("Failed to fetch questions");
          return res.json();
        })
        .then(data => {
          console.log("Response status:", data);
          setMyQuestions(data || []);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Error fetching user's questions:", err);
          setIsLoading(false);
        });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleAskQuestion = () => {
    navigate("/ask");
  };

  if (isLoading) {
    return <p>Loading your posts...</p>;
  }

  return (
    <div className="my-posts-page">
      <h2>My Questions</h2>

      {loggedInUserId && myQuestions.length === 0 ? (
        <div>
          <p>You haven't posted any questions yet.</p>
          <button onClick={handleAskQuestion}>Ask a Question</button>
        </div>
      ) : (
        <ul>
          {myQuestions.map((question) => (
            <li key={question.id}>
              <h3>{question.title}</h3>
              <p>{question.content}</p>
              <button onClick={() => navigate(`/questions/${question.id}`)}>View</button>
                <hr className="divider" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
