import React from 'react';
import TopicManager from './TopicManager';

const TopicsPage = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Explore Questions by Topic</h2>
      <TopicManager />
    </div>
  );
};

export default TopicsPage;
