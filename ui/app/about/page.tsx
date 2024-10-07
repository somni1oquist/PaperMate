"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Link, Card, Avatar, Grid, Button, Chip } from '@mui/material';
import bgImage from '../assets/sea.jpg';
import './about.css'; 

const About = () => {
  const [activeTab, setActiveTab] = useState('project'); // Default tab is 'project'
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const bottomReached = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;
      setShowButton(bottomReached);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const groupMembers = [
    { name: "Shijun Shao", username: "Halffancyy", github: "https://github.com/Halffancyy", avatar: "https://avatars.githubusercontent.com/u/129271532?s=60&v=4", team: "Backend Team" },
    { name: "Hui-Ling Huang", username: "somni1oquist", github: "https://github.com/somni1oquist", avatar: "https://avatars.githubusercontent.com/u/145635256?s=60&v=4", team: "Backend Team" },
    { name: "Ziqi Chen", username: "ziqichen55555", github: "https://github.com/ziqichen55555", avatar: "https://avatars.githubusercontent.com/u/130896453?s=60&v=4", team: "Backend Team" },
    { name: "Krish Goti", username: "krishgoti2002", github: "https://github.com/krishgoti2002", avatar: "https://avatars.githubusercontent.com/u/77385930?s=60&v=4", team: "Frontend Team" },
    { name: "Chung Hei Tse", username: "maxtse25", github: "https://github.com/maxtse25", avatar: "https://avatars.githubusercontent.com/u/98444048?s=60&v=4", team: "Frontend Team" },
    { name: "Nitish Raguraman", username: "nitishragu12", github: "https://github.com/nitishragu12", avatar: "https://avatars.githubusercontent.com/u/69626001?s=60&v=4", team: "Frontend Team" },
  ];

  return (
    <Box className="background-container" sx={{ backgroundImage: `url(${bgImage.src})` }}>
      <Box className="overlay-container" sx={{ paddingLeft: '5rem', paddingRight: '5rem' }}>
        <Typography className="project-title">
          About Our Project
        </Typography>

        {/* Custom Switch for Tabs */}
        <Box className="tab-switch">
          <Button
            className={`tab-button ${activeTab === 'project' ? 'active' : ''}`}
            onClick={() => setActiveTab('project')}
          >
            PROJECT
          </Button>
          <Button
            className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            TEAM
          </Button>
        </Box>

        {/* Conditionally rendering project description or team section */}
        {activeTab === 'project' ? (
          <Box className="paper-background">
            <Typography 
              className="intro-text" 
              sx={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#fff', textAlign: 'left', textShadow: '1px 2px 6px rgba(0, 0, 0, 0.5)' }}
            >
              CITS5206 Capstone Project - University of Western Australia (Master of Information Technology)
            </Typography>

            <Typography className="intro-text">
              As students of the Master of Information Technology at the University of Western Australia, we aim to leverage the knowledge and skills gained from our past units to develop a transformative solution for road safety research. Our capstone project seeks to automate the manual and time-intensive process of literature scanning, enabling researchers to focus on higher-impact work by utilizing the power of Large Language Models (LLMs).
            </Typography>

            <Typography className="intro-text">
              By streamlining the analysis of road safety literature, we aim to enhance both accuracy and efficiency, reducing the burden on researchers while improving the quality of data insights. Through this innovative use of technology, we aspire to contribute to safer roads and ultimately a better quality of life. Our project is driven by core principles of efficiency, accuracy, and accessibility, ensuring that cutting-edge research can continue to influence and drive meaningful change in the world.
            </Typography>

            <Typography className="intro-text">
              We would also like to express our gratitude to Matt Albrecht, our client, whose advice and guidance have been invaluable in shaping the direction of this application.
            </Typography>
          </Box>
        ) : (
          <Box className="team-wrapper" sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
            {groupMembers.map((member, index) => (
              <Card className="team-member-card" key={index}>
                <Avatar src={member.avatar} alt={member.name} className="team-avatar" />
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>{member.name}</Typography>
                <Box sx={{ marginTop: '0.5rem' }}>
                  <Chip label={member.team} variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                </Box>
                <Link href={member.github} target="_blank" rel="noopener noreferrer" sx={{ color: '#90caf9', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  {member.username} on GitHub
                </Link>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {showButton && (
        <a href="https://github.com/nitishragu12/Capstone-Project" target="_blank" rel="noopener noreferrer">
          <Button className="floating-button">Visit Our GitHub Page</Button>
        </a>
      )}
    </Box>
  );
};

export default About;
