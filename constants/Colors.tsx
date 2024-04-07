import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const defaultTheme = {
  primary: '#20115B',
  pink: '#C876FF',
  white: '#FFFFFF',
  offWhite: "#D9D9D9",
  transparentWhite: 'rgba(255, 255, 255, 0.15)',
  transparentPrimary: 'rgba(32, 17, 91, 0.15)',
};

const darkTheme = {
  primary: '#3D3D3D',
  pink: '#FF6EC7',
  white: '#FFFFFF',
  offWhite: "#D9D9D9",
  transparentWhite: 'rgba(255, 255, 255, 0.15)',
  transparentPrimary: 'rgba(61, 61, 61, 0.15)',
};

let currentTheme = defaultTheme;

// Function to load theme from secure storage
const loadTheme = async () => {
  try {
    const theme = await SecureStore.getItemAsync('theme');
    if (theme === 'dark') {
      console.log("dark theme")
      currentTheme = darkTheme;
    } else {
      currentTheme = defaultTheme;
    }
  } catch (error) {
    console.error('Error loading theme:', error);
  }
};

// Initial load of theme
loadTheme();


const Colors = currentTheme;

export default Colors;