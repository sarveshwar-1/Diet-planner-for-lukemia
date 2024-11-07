import React from 'react'
import {Stack} from "expo-router";

const GraphLayout = () => {
    return(
        <Stack>
            <Stack.Screen name="graph" options={{headerShown: false}}/>
        </Stack>
    )
}
export default GraphLayout
