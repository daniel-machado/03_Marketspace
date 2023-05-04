import { StatusBar } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import { useFonts, Karla_400Regular, Karla_700Bold } from '@expo-google-fonts/karla'

import { Routes } from './src/routes';

import { AuthContextProvider } from '@contexts/AuthContext';

import { THEME } from './src/theme';

import { Loading } from '@components/Loading';

export default function App() {
  const [fontLoaded] = useFonts({ Karla_400Regular, Karla_700Bold });

  return (
   <NativeBaseProvider theme={THEME}>
    <StatusBar
      barStyle='light-content'
      backgroundColor='transparent'
      translucent
    />
    <AuthContextProvider>
      {fontLoaded ? <Routes/> : <Loading/>}
    </AuthContextProvider>
   </NativeBaseProvider>
  );
}

