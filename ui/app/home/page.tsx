"use client";
import React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { Box, Typography, ButtonBase } from "@mui/material"; // Use ButtonBase to give Link a button-like appearance
import Image from 'next/image'; // Import Next.js Image component
import Link from 'next/link'; // Use Next.js Link component
import bookImage from '../assets/book.jpg'; // Import the image from assets
import { useRouter, usePathname } from 'next/navigation';

export default function HomePage() {
  // Handle smooth scroll to the section
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop,
        behavior: 'smooth',
      });
    }
  };

  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/home')
    router.push('/');

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
      <Grid container sm={12} lg={5} display="flex" flexDirection="column" justifyContent="center" textAlign="left" sx={{ marginLeft: "4rem" }}>
        <Grid xs={12}>
          {/* App Name - PaperMate */}
          <Typography
            variant="h1"
            sx={{
              fontFamily: "'Fauna One', serif", // Use stylish font for PaperMate
              fontSize: "4rem", // Large font size for visibility
              fontWeight: "bold", // Bold font weight
              color: "#333", // Darker color for contrast
              marginBottom: "2rem", // Space below the app name
            }}
          >
            PaperMate
          </Typography>
        </Grid>
        <Grid xs={12}>
          {/* Other content */}
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
        </Grid>
        <Grid xs={12}>
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
        </Grid>
        <Grid xs={12}>
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
        </Grid>
        <Grid xs={12}>
          {/* ButtonBase wraps the Link to maintain button styling */}
          <ButtonBase
            sx={{
              backgroundColor: "#000", // Black background
              color: "#fff", // White text
              fontSize: "1rem", // Font size for the button text
              fontWeight: "bold",
              textTransform: "none", // Disable uppercase for button text
              borderRadius: "5px", // Rounded corners
              cursor: "pointer", // Pointer cursor for interactivity
              display: "inline-block", // To make the button inline-block like
              width: "100%",
              textDecoration: "none", // No underline for the link
              '&:hover': {
                backgroundColor: "#444", // Slight darkening on hover
              }
            }}
          >
            <Link
              href="#search"
              className="bottom-bar-option"
              onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleScroll(e, 'search')}
              passHref
              style={{
                color: 'inherit', // Ensure the text color is inherited from ButtonBase
                textDecoration: 'none', // Remove underline from the link
                width: '100%',
                height: '100%',
                display: 'flex', // Ensure link behaves like a button by taking full size of ButtonBase
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              Start your search
            </Link>
          </ButtonBase>
        </Grid>
      </Grid>

      {/* Right Section - Image */}
      <Grid sm={0} lg={5} display="flex" justifyContent="flex-end" alignItems="center" sx={{ marginRight: "4rem" }}>
        <Box
          sx={{
            borderRadius: "150px 0px 0px 150px", // Larger curve on the left, rounder corners on the right
            overflow: "hidden", // Ensure the image stays within the border-radius
            width: "100%", // Make the image occupy a larger portion of its container
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
