import React from 'react';
import { Box, Typography, Link, Card, Avatar, Grid } from '@mui/material';
import styled from '@mui/material/styles/styled';
import bgImage from '../assets/moon.jpg'; // Adjust the path to your asset

// Create a wrapper for the content that includes a semi-transparent overlay
const OverlayContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1, // Content will appear on top of the overlay
  padding: '3rem',
  minHeight: '100vh',
  textAlign: 'center',
}));

// The background image will be applied here with an overlay effect
const BackgroundContainer = styled(Box)(({ theme }) => ({
  backgroundImage: `url(${bgImage.src})`,
  backgroundColor: '#f4f4f4',
  minHeight: '100vh',
  backgroundSize: 'cover', 
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay (50% opacity)
    zIndex: 0, // Overlay goes beneath content
  },
}));

const ProjectTitle = styled(Typography)(({ theme }) => ({
  fontSize: '3rem',
  fontWeight: 'bold',
  color: '#fff', // Changed color to white for better contrast with background
  marginBottom: '1rem',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Adds shadow for readability
}));

const IntroText = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: '#ddd', // Light color for better readability
  maxWidth: '800px',
  margin: '0 auto 2rem auto',
  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', // Adds shadow for readability
}));

const TeamMemberCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(255, 182, 193, 0.4)',
  padding: '0.75rem',
  margin: '1rem',
  borderRadius: '10px',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  textAlign: 'left',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-10px)', // Slightly raise the card on hover
  },
}));


const TeamAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  margin: '0 auto 0.75rem auto',
}));

const TeamSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  color: '#fff', // Adjusted to white for better contrast
  margin: '2rem 0 1rem 0',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Adds shadow for readability
}));

const About = () => {
  const groupMembers = [
    { name: "Shijun Shao", username: "Halffancyy", github: "https://github.com/Halffancyy", avatar: "https://avatars.githubusercontent.com/u/129271532?s=60&v=4" },
    { name: "Hui-Ling Huang", username: "somni1oquist", github: "https://github.com/somni1oquist", avatar: "https://avatars.githubusercontent.com/u/145635256?s=60&v=4" },
    { name: "Ziqi Chen", username: "ziqichen55555", github: "https://github.com/ziqichen55555", avatar: "https://avatars.githubusercontent.com/u/130896453?s=60&v=4" },
    { name: "Krish Goti", username: "krishgoti2002", github: "https://github.com/krishgoti2002", avatar: "https://avatars.githubusercontent.com/u/77385930?s=60&v=4" },
    { name: "Chung Hei Tse", username: "maxtse25", github: "https://github.com/maxtse25", avatar: "https://avatars.githubusercontent.com/u/98444048?s=60&v=4" },
    { name: "Nitish Raguraman", username: "nitishragu12", github: "https://github.com/nitishragu12", avatar: "https://avatars.githubusercontent.com/u/69626001?s=60&v=4" },
  ];

  return (
    <BackgroundContainer>
      {/* The content with overlay */}
      <OverlayContainer>
        <ProjectTitle>About Our Project</ProjectTitle>
        <IntroText>
          Our project aims to revolutionize the process of literature scanning for road safety research. 
          By automating this time-consuming task, we enable researchers to focus on high-impact work, 
          while saving time and improving accuracy with Large Language Models (LLMs).
        </IntroText>

        {/* Mission Statement */}
        <Typography variant="body1" sx={{ maxWidth: '800px', margin: '2rem auto', color: '#ddd', fontSize: '1rem', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>
          We believe in using technology to enhance safety and quality of life. Our project is guided by principles of
          efficiency, accuracy, and accessibility, ensuring that cutting-edge research can drive impactful change in the world.
        </Typography>

        {/* Team Section */}
        <TeamSectionTitle>Meet the Team</TeamSectionTitle>

        <Grid container spacing={4} justifyContent="center">
          {groupMembers.map((member, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <TeamMemberCard>
                <TeamAvatar src={member.avatar} alt={member.name} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{member.name}</Typography>
                <Link href={member.github} target="_blank" rel="noopener noreferrer" sx={{ color: '#1e88e5', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  {member.username} on GitHub
                </Link>
              </TeamMemberCard>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Box sx={{ marginTop: '3rem' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
            Want to Learn More?
          </Typography>
          <Typography variant="body2" sx={{ color: '#ddd', marginBottom: '1rem', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>
            Follow us on GitHub for more information!
          </Typography>
          <Link href="https://github.com/nitishragu12/Capstone-Project" target="_blank" rel="noopener noreferrer" sx={{
            backgroundColor: 'rgb(220,20,60)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '5px',
            textDecoration: 'none',
            fontSize: '1.1rem',
            transition: 'background 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgb(128,0,0)', // Darken on hover
            },
          }}>
            Visit Our GitHub Page
          </Link>
        </Box>
      </OverlayContainer>
    </BackgroundContainer>
  );
};

export default About;
