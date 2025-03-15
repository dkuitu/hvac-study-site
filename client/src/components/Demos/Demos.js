import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Demos.css';

const Demos = () => {
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDemos = async () => {
      try {
        const response = await axios.get('/api/demos');
        setDemos(response.data.demos);
        setLoading(false);
      } catch (err) {
        setError('Failed to load interactive demos');
        setLoading(false);
      }
    };
    
    fetchDemos();
  }, []);
  
  if (loading) return <div>Loading interactive demos...</div>;
  if (error) return <div>{error}</div>;
  
  return (
    <div className="demos-container">
      <h1>HVAC Interactive Demos</h1>
      
      {demos.length === 0 ? (
        <p>No interactive demos available yet. Check back soon!</p>
      ) : (
        <div className="demos-list">
          {demos.map(demo => (
            <div key={demo.id} className="demo-item">
              <h2>{demo.title}</h2>
              <p>{demo.description}</p>
              <button>Launch Demo</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Demos;
