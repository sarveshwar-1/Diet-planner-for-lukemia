import React, { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../components/Loader';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        "SF-Bold": require("../assets/fonts/SfBold.otf"),
        "SF-Semi-Bold": require("../assets/fonts/SfSemiBold.otf"),
        "SF-Medium": require("../assets/fonts/SfMedium.otf"),
    });

    const [isLoggedIn, setIsLoggedIn] = useState(null);

    useEffect(() => {
        const checkLoginStatus = async () => {
            const loggedInStatus = await AsyncStorage.getItem('isLoggedIn');
            setIsLoggedIn(loggedInStatus === 'true');
        };

        checkLoginStatus();
    }, []);

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    useEffect(() => {
        if (fontsLoaded && isLoggedIn !== null) {
            if (isLoggedIn) {
                router.replace('/HomeScreen');
            }
        }
    }, [fontsLoaded, isLoggedIn]);

    if (!fontsLoaded || isLoggedIn === null) {
        return <Loader />;
    }

    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(Onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(home)" options={{ headerShown: false }} />
            <Stack.Screen name="(camera)" options={{ headerShown: false }} />
            <Stack.Screen name="(graph)" options={{ headerShown: false }} />    
            <Stack.Screen name="(chat)" options={{ headerShown: false }} />
            <Stack.Screen name="(diet)" options={{ headerShown: false }} />
            <Stack.Screen name="(rating)" options={{ headerShown: false }} />
        </Stack>
    );
}