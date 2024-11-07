import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTimes = ['Breakfast', 'Lunch', 'Dinner'];

const RatingPage = () => {
    const [weightedPlan, setWeightedPlan] = useState([]);
    const [ratings, setRatings] = useState({});
    const [completedDays, setCompletedDays] = useState([]);

    useEffect(() => {
        loadWeightedPlan();
        loadRatings();
        loadCompletedDays();
    }, []);

    const loadWeightedPlan = async () => {
        try {
            const storedWeightedPlan = await AsyncStorage.getItem('weightedPlan');
            if (storedWeightedPlan) {
                setWeightedPlan(storedWeightedPlan.split(','));
            }
        } catch (error) {
            console.error('Error loading weighted plan:', error);
        }
    };

    const loadRatings = async () => {
        try {
            const storedRatings = await AsyncStorage.getItem('mealRatings');
            if (storedRatings) {
                setRatings(JSON.parse(storedRatings));
            }
        } catch (error) {
            console.error('Error loading ratings:', error);
        }
    };

    const loadCompletedDays = async () => {
        try {
            const storedCompletedDays = await AsyncStorage.getItem('completedDays');
            if (storedCompletedDays) {
                setCompletedDays(JSON.parse(storedCompletedDays));
            }
        } catch (error) {
            console.error('Error loading completed days:', error);
        }
    };

    const handleRatingChange = (day, meal, value) => {
        const numericValue = parseInt(value);
        if (isNaN(numericValue) || numericValue < 0 || numericValue > 5) {
            Alert.alert("Invalid Input", "Please enter a number between 0 and 5.");
            return;
        }
        setRatings(prevRatings => ({
            ...prevRatings,
            [day]: {
                ...prevRatings[day],
                [meal]: value
            }
        }));
    };

    const saveMealRating = async (day, meal) => {
        try {
            const email = await AsyncStorage.getItem('email');
            if (!email) {
                throw new Error('Email not found');
            }

            const mealIndex = daysOfWeek.indexOf(day) * 3 + mealTimes.indexOf(meal);
            const taste = weightedPlan[mealIndex];
            const rating = ratings[day]?.[meal];

            // Only proceed if a rating is provided
            if (rating !== undefined && rating !== '') {
                const numericRating = parseFloat(rating);

                if (isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
                    Alert.alert("Invalid Rating", "Please enter a valid rating between 0 and 5.");
                    return;
                }

                const tasteWeights = {
                    [taste.toLowerCase()]: numericRating
                };

                await axios.post('http://192.168.64.143:3000/update-taste-weights', {
                    gmail: email,
                    tasteWeights
                });

                // Save the updated ratings
                await AsyncStorage.setItem('mealRatings', JSON.stringify(ratings));

                // Check if all meals for the day are rated
                const dayRatings = ratings[day] || {};
                if (mealTimes.every(mealTime => dayRatings[mealTime])) {
                    const updatedCompletedDays = [...completedDays, day];
                    setCompletedDays(updatedCompletedDays);
                    await AsyncStorage.setItem('completedDays', JSON.stringify(updatedCompletedDays));
                }

                Alert.alert("Success", `Rating for ${day}'s ${meal} (${taste}) saved successfully!`);
            } else {
                Alert.alert("No Rating", "Please enter a rating before saving.");
            }
        } catch (error) {
            console.error('Error saving rating:', error);
            Alert.alert("Error", 'Failed to save rating. Please try again.');
        }
    };

    const renderMealRating = (day, meal) => {
        const mealIndex = daysOfWeek.indexOf(day) * 3 + mealTimes.indexOf(meal);
        const taste = weightedPlan[mealIndex];

        return (
            <View key={`${day}-${meal}`} style={styles.mealContainer}>
                <Text style={styles.mealTitle}>{meal} - {taste}</Text>
                <View style={styles.ratingContainer}>
                    <Text style={styles.ratingLabel}>Rating (0-5):</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={ratings[day]?.[meal] || ''}
                        onChangeText={(text) => handleRatingChange(day, meal, text)}
                        maxLength={1}
                        placeholder="0-5"
                    />
                </View>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => saveMealRating(day, meal)}
                >
                    <Text style={styles.saveButtonText}>Save Rating</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={['#FFBB70', '#FFEC9E', '#FFFBDA']}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.title}>Weekly Meal Ratings</Text>
                    {daysOfWeek.map((day) => (
                        !completedDays.includes(day) && (
                            <View key={day} style={styles.dayContainer}>
                                <Text style={styles.dayTitle}>{day}</Text>
                                {mealTimes.map((meal) => renderMealRating(day, meal))}
                            </View>
                        )
                    ))}
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FF69B4',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
    },
    dayContainer: {
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 10,
        padding: 15,
    },
    dayTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    mealContainer: {
        marginBottom: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        padding: 10,
        borderRadius: 5,
    },
    mealTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    ratingLabel: {
        flex: 1,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 5,
        width: 50,
        textAlign: 'center',
        backgroundColor: 'white',
    },
    saveButton: {
        backgroundColor: '#hsl(30, 100%, 47.5%)',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    saveButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default RatingPage;
