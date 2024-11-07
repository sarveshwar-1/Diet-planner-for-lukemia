import React from 'react';
import { Stack } from 'expo-router';

const PagesLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="Chatbot" options={{ headerShown: false }} />
        </Stack>
    );
};

export default PagesLayout;