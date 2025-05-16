import React, { useEffect, useState } from 'react';

const TopicFilter = ({ setQuestions }) => {
  const [topics, setTopics] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetch('https://stackoveflow-clone.onrender.com/api/topics/all-topics')
      .then(res => res.json())
      .then(setTopics);
  }, []);

  const toggleTopic = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const fetchFilteredQuestions = () => {
    fetch('https://stackoveflow-clone.onrender.com/api/topics/questions-by-topics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic_ids: selected }),
    })
      .then(res => res.json())
      .then(setQuestions)
      .catch(console.error);
  };

  return (
    <div>
      <h3>Filter by Topics</h3>
      <div className="topic-checkboxes">
        {topics.map(topic => (
          <label key={topic.id} style={{ marginRight: '1rem' }}>
            <input
              type="checkbox"
              value={topic.id}
              checked={selected.includes(topic.id)}
              onChange={() => toggleTopic(topic.id)}
            />
            {topic.name}
          </label>
        ))}
      </div>
      <button onClick={fetchFilteredQuestions} style={{ marginTop: '1rem' }} id="search-topic">
        Search
      </button>
    </div>
  );
};

export default TopicFilter;
