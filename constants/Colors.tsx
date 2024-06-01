import * as SecureStore from 'expo-secure-store';

const purpleTheme = {
  primary: '#20115B',
  pink: '#C876FF',
  white: '#FFFFFF',
  offWhite: "#D9D9D9",
  transparentWhite: 'rgba(255, 255, 255, 0.15)',
  transparentPrimary: 'rgba(32, 17, 91, 0.15)',
};

const orangeTheme = {
  primary: '#BA4D86',
  pink: '#FE900D',
  white: '#FFFFFF',
  offWhite: "#D9D9D9",
  transparentWhite: 'rgba(255, 255, 255, 0.15)',
  transparentPrimary: 'rgba(61, 61, 61, 0.15)',
};

const brightTheme = {
  primary: '#FF7F50',
  pink: '#9400D3',
  white: '#FFFFFF',
  offWhite: "#FFFFF0",
  transparentWhite: 'rgba(255, 255, 255, 0.15)',
  transparentPrimary: 'rgba(61, 61, 61, 0.15)',
};

const initializeTheme = () => {
  try {
    const theme = SecureStore.getItem('theme');
    //console.log("theme: ", theme)
    if(theme === "purple"){
      return purpleTheme
    }
    if(theme === "orange"){
      return orangeTheme
    }
    if(theme === "bright"){
      return brightTheme
    }
    else{
      return purpleTheme
    }
  } 
  catch (error) {
    console.error('Error loading theme:', error);
    return purpleTheme;
  }
};

const currentTheme = initializeTheme();

export default currentTheme;