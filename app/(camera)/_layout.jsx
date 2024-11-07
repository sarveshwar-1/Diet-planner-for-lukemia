import React from 'react';
import { Stack } from 'expo-router';

const ImageLayout = () => {
    return (
        <Stack >
            <Stack.Screen name="Camera" options={{ headerShown: false }}/>
        </Stack>
    );
};

export default ImageLayout;
