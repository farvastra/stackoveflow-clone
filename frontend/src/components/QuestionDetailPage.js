import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { jwtDecode } from 'jwt-decode'; 
import SaveButton from './SaveButton'; 
import TopicManager from './TopicManager';
import '../styles/questiondetailpage.css';

export default function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [commentBody, setCommentBody] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentBody, setEditedCommentBody] = useState("");


   const fetchQuestionAndAnswers = useCallback( () => {
  fetch(`https://stackoverflow-clone-l1zd.onrender.com/api/questions/${id}`)
    .then((res) => res.json())
    .then((data) => {
      console.log("Fetched question data:", data);

      setQuestion({
        title: data.title,
        content: data.content,
        user_id: data.user_id,
        id: data.id,
        topics: data.topics || [], 
      });
      setAnswers(data.comments);
    })
    .catch((error) => console.error('Error fetching question details:', error));
}, [id]);

  useEffect(() => {
    console.log("URL param id:", id);

    const token = localStorage.getItem('token');
    console.log("Token:", token);
    if (token) {
      setIsLoggedIn(true);
      const decodedToken = jwtDecode(token); 
      setLoggedInUserId(parseInt(decodedToken.sub));
    }
    fetchQuestionAndAnswers();
  }, [id, fetchQuestionAndAnswers]);

   const handlePostAnswer = () => {
    if (!commentBody) {
      alert("Answer cannot be empty.");
      return;
    }

    fetch(`https://stackoverflow-clone-l1zd.onrender.com/api/questions/${id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ body: commentBody }),
    })
      .then(() => {
        setCommentBody("");
        fetchQuestionAndAnswers();
      })
      .catch((error) => console.error('Error posting answer:', error));
  };

  const handleEditQuestion = () => {
    if (!editedTitle.trim() || !editedContent.trim()) {
      alert("Title and content cannot be empty.");
      return;
    }

    fetch(`https://stackoverflow-clone-l1zd.onrender.com/api/questions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        title: editedTitle,
        content: editedContent,
      }),
    })
      .then(() => {
        setQuestion((prev) => ({
          ...prev,
          title: editedTitle,
          content: editedContent,
        }));
        setIsEditing(false);
        setEditedTitle("");
        setEditedContent(""); 
      })
      .catch((error) => console.error('Error updating question:', error));
  };

  const handleDeleteQuestion = () => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      fetch(`https://stackoverflow-clone-l1zd.onrender.com/api/questions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then(() => {
          navigate("/"); 
        })
        .catch((error) => console.error('Error deleting question:', error));
    }
  };

  const handleEditComment = (commentId, body) => {
    setEditingCommentId(commentId);
    setEditedCommentBody(body);
  };

  const handleSaveEditedComment = (commentId) => {
    fetch(`https://stackoverflow-clone-l1zd.onrender.com/api/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ body: editedCommentBody }),
    })
      .then(() => {
        setEditingCommentId(null);
        setEditedCommentBody("");
        fetchQuestionAndAnswers();
      })
      .catch((error) => console.error('Error updating comment:', error));
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Delete this answer?")) {
      fetch(`https://stackoverflow-clone-l1zd.onrender.com/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then(() => {
          setAnswers((prev) => prev.filter((comment) => comment.id !== commentId));
        })
        .catch((error) => console.error('Error deleting comment:', error));
    }
  };

  const enterEditMode = () => {
    setEditedTitle(question.title);
    setEditedContent(question.content);
    setIsEditing(true);
  };

  if (!question) {
    return <div>Loading question...</div>; 
  }

  return (
    <div className="question-detail">
      {isEditing ? (
        <div className="edit-form">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Edit title..."
          />
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="Edit your question..."
          />
          <button onClick={handleEditQuestion} id="save-btn">Save Changes</button>
        </div>
      ) : (
        <>
        <h1>{question.title}</h1>
        <p>{question.content}</p>
      
      
        <div className="topics">
          <strong>Tags:</strong>
          {question.topics && question.topics.length > 0 ? (
            question.topics.map((topic) => (
              <span key={topic.id} className="tag">
                #{topic.name}
              </span>
            ))
          ) : (
            <span> None</span>
          )}
        </div>
      
        {isLoggedIn && question.user_id === loggedInUserId && (
          <TopicManager questionId={question.id} />
        )}
  
      </>)}
        
      {isLoggedIn && (
        <div className="question-controls">
          <div className="left-control">
  <SaveButton userId={loggedInUserId} questionId={question.id} />
</div>


          {question.user_id === loggedInUserId && (
            <div className="edit-buttons">
              <button onClick={enterEditMode} id="edit-btn" className='modify-btn'>Edit</button>
              <button onClick={handleDeleteQuestion} id="delete-btn" className='modify-btn'>Delete</button>
            </div>
          )}
        </div>
      )}

      <hr />
      <h3>Related Answers</h3>
      {answers.length === 0 ? (
        <p>No answers yet. Be the first to answer!</p>
      ) : (
        answers.map((answer) => {
          const isOwner = loggedInUserId === answer.user_id;

          return (
            <div key={answer.id} className="answer-card">
              {editingCommentId === answer.id ? (
                <>
                  <textarea
                    value={editedCommentBody}
                    onChange={(e) => setEditedCommentBody(e.target.value)}
                  />
                  <button onClick={() => handleSaveEditedComment(answer.id)} className='modify-btn' id="save-update-btn">Save</button>
                  <button onClick={() => setEditingCommentId(null)} className='modify-btn' id="cancel-update-btn">Cancel</button>
                </>
              ) : (
                <>
                  <p>{answer.body}</p>
                  {isOwner && (
                    <div className="comment-buttons">
                      <button onClick={() => handleEditComment(answer.id, answer.body)} id="edit-comment-btn" className='modify-btn'>Edit</button>
                      <button onClick={() => handleDeleteComment(answer.id)} id="delete-comment-btn" className='modify-btn'>Delete</button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })
      )}

      {isLoggedIn ? (
        <div className="answer-form">
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Type your answer here..."
          />
          <button onClick={handlePostAnswer} id="post-answer">Post Answer</button>
        </div>
      ) : (
        <p>You must be logged in to post an answer.</p>
      )}
    </div>
  );
}
