// app/about.tsx (or pages/about.tsx based on your structure)

"use client"; // Ensure this page can use client components
import React from 'react';
import { Box, Typography, Link, Grid } from '@mui/material';

const About = () => {
  const groupMembers = [
    { id: "23856227", name: "Ziqi Chen", github: "https://github.com/ziqichen55555" },
    { id: "24139368", name: "Krish Goti", github: "https://github.com/krishgoti2002" },
    { id: "23740534", name: "Chung Hei Tse", github: "https://github.com/maxtse25" },
    { id: "23926903", name: "Shijun Shao", github: "https://github.com/Halffancyy" },
    { id: "23799876", name: "Hui-Ling Huang", github: "https://github.com/somni1oquist" },
    { id: "23689789", name: "Nitish Raguraman", github: "https://github.com/nitishragu12" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        About Our Project
      </Typography>
      
      <Typography variant="body1" paragraph>
        Welcome to the Information Technology Capstone Project. This project showcases our skills and knowledge in technology and collaboration. 
        Below are the group members who contributed to the development and implementation of this project.
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        Group Members
      </Typography>

      <Grid container spacing={2} justifyContent="center">
        {groupMembers.map((member) => (
          <Grid item xs={6} sm={4} key={member.id}>
            <Typography variant="body2">
              {member.id} - {member.name} - <Link href={member.github} target="_blank" rel="noopener noreferrer">{member.github}</Link>
            </Typography>
          </Grid>
        ))}
      </Grid>
      
      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        &copy; 2024 PaperMate. All rights reserved.
      </Typography>
    </Box>
  );
};

export default About;
