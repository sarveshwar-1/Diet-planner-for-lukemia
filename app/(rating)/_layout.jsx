import React from 'react'
import {Stack} from "expo-router";

const RatingPageLayout = () => {
    return(
        <Stack>
            <Stack.Screen name="RatingPage" options={{headerShown: false}}/>
        </Stack>
    )
}
export default RatingPageLayout
