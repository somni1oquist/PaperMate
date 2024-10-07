"use client";
import React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { Box, Typography, Button } from "@mui/material";
import Image from 'next/image'; // Import Next.js Image component
import bookImage from '../assets/book.jpg'; // Import the image from assets

export default function HomePage() {
  return (
    <Grid
      container
      sx={{
        height: "100vh",
        padding: "6rem 4rem", // Increased padding on top and left-right for better centering
        backgroundColor: "#f9f9f9", // Light background color
      }}
      alignItems="center" // Aligns the items vertically
      justifyContent="space-between" // Space between text and image sections
    >
      {/* Left Section - Text and Animation */}
      <Grid xs={12} md={5} display="flex" flexDirection="column" justifyContent="center" textAlign="left" sx={{ marginLeft: "4rem" }}>
        <Typography
          variant="overline"
          sx={{
            fontSize: "0.9rem", // Small uppercase text for the label
            fontWeight: "bold",
            color: "#888", // Grey color for the overline text
            marginBottom: "1rem",
          }}
        >
          STREAMLINED RESEARCH TOOL
        </Typography>
        <Typography
          variant="h2"
          sx={{
            fontSize: "3.2rem", // Large font size for the title
            fontWeight: "bold",
            color: "#222", // Dark color for contrast
            lineHeight: 1.2,
            marginBottom: "1rem", // Slightly reduce space between title and subtitle
          }}
        >
          Effortlessly Discover, Analyze, and Organize Research Materials
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontSize: "1.25rem", // Medium-sized subtitle text
            color: "#555", // Lighter color for description
            marginBottom: "1.5rem", // Reduced space between description and button
          }}
        >
          Unlock the Future of Research – Simplify Your Search, Supercharge Your Analysis with AI, and Achieve Results with Just One Click.
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#000", // Black background for the button
            color: "#fff", // White text
            padding: "0.75rem 1.5rem", // Padding for button size
            fontSize: "1rem", // Font size for the button text
            fontWeight: "bold",
            textTransform: "none", // Disable uppercase for button text
            borderRadius: "5px", // Rounded corners
          }}
        >
          Start your search
        </Button>
      </Grid>

      {/* Right Section - Image */}
      <Grid xs={12} md={6} display="flex" justifyContent="flex-end" alignItems="center" sx={{ marginRight: "4rem" }}>
        <Box
          sx={{
            borderRadius: "135px 0px 0px 135px", // Larger curve on the left, rounder corners on the right
            overflow: "hidden", // Ensure the image stays within the border-radius
            width: "90%", // Make the image occupy a larger portion of its container
            maxWidth: "750px", // Match the image size from the example
          }}
        >
          <Image
            src={bookImage} // Use the imported image from the assets folder
            alt="Book Image" // Alt text for the image
            layout="responsive"
            objectFit="cover" // Ensure the image covers the entire container without white space
          />
        </Box>
      </Grid>
    </Grid>
  );
}
