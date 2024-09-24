"use client";
import React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { Box, Typography } from "@mui/material";
import style from "../page.module.css"; // Assuming your CSS module file
import Lottie from 'lottie-react';
import animationData from '../assets/book-animation.json'; // Import the Lottie animation

export default function HomePage() {
  return (
    <Grid
      container
      spacing={1}
      justifyContent="center" // Center horizontally
      alignItems="center" // Center vertically
      sx={{ height: "100vh", padding: "2rem" }} // Full height + padding
      className={style['home-container']} // Ensure the container has background
    >
      {/* Title Section */}
      <Grid xs={12} md={6} textAlign="center">
        <Box display="flex" alignItems="center" justifyContent="center"> {/* Flex container for title and animation */}
          <Typography
            variant="h1"
            sx={{
              fontSize: "3rem", // Large font size for the title
              fontWeight: "bold",
              color: "#333", // Dark color for contrast
            }}
          >
            PaperMate
          </Typography>
          <Lottie animationData={animationData} style={{ width: "14%", height: "auto" }} />
        </Box>
        <Typography
          variant="subtitle1"
          sx={{
            fontSize: "1.25rem", // Medium-sized subtitle text
            color: "#555", // Lighter color for description
            marginTop: "1rem", // Space between title and description
          }}
        >
          Your Gateway to Streamlined Research – Search, Analyse, and Excel in One Click.
        </Typography>
      </Grid>
    </Grid>
  );
}
