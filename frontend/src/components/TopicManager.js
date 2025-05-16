
import React, { useEffect, useState } from 'react';
import '../styles/topicmanager.css';

const TopicManager = ({ questionId }) => {
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);

  // Fetch all topics
  const fetchTopics = async () => {
    const res = await fetch('http://localhost:5000/api/topics/all-topics');
    if (!res.ok) throw new Error('Failed to fetch topics');
    return res.json();
  };

  // Add topic to a question
  const addTopicToQuestion = async (questionId, topicId) => {
    const res = await fetch(`http://localhost:5000/api/topics/${questionId}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`, 
      },
      body: JSON.stringify({ topic_id: topicId }),
    });
    if (!res.ok) throw new Error('Failed to add topic');
    return res.json();
  };

  // Remove topic from a question
  const removeTopicFromQuestion = async (questionId, topicId) => {
    const res = await fetch(`http://localhost:5000/api/topics/${questionId}/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ topic_id: topicId }),
    });
    if (!res.ok) throw new Error('Failed to remove topic');
    return res.json();
  };

  useEffect(() => {
    fetchTopics()
      .then(setTopics)
      .catch(err => console.error('Failed to fetch topics', err));

    fetch(`http://localhost:5000/api/topics/${questionId}`)
      .then(res => res.json())
      .then(data => setSelectedTopics(data.map(topic => topic.id)))
      .catch(err => console.error('Failed to fetch question topics', err));
  }, [questionId]);

  const handleTopicToggle = (topicId) => {
    if (selectedTopics.includes(topicId)) {
      removeTopicFromQuestion(questionId, topicId)
        .then(() => {
          setSelectedTopics(prev => prev.filter(id => id !== topicId));
        })
        .catch(err => console.error('Failed to remove topic', err));
    } else {
      addTopicToQuestion(questionId, topicId)
        .then(() => {
          setSelectedTopics(prev => [...prev, topicId]);
        })
        .catch(err => console.error('Failed to add topic', err));
    }
  };

  return (
    <div className="topic-manager">
      <h3>Select Topics for This Question</h3>
      <div className="topic-list">
        {topics.map(topic => (
          <span
            key={topic.id}
            className={`topic-badge ${selectedTopics.includes(topic.id) ? 'selected' : ''}`}
            onClick={() => handleTopicToggle(topic.id)}
          >
            {topic.name}
          </span>
        ))}
      </div>
      <button onClick={() => alert('Topics updated')}>Save Topics</button>
    </div>
  );
};

export default TopicManager;


