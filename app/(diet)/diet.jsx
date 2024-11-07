import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Diet = () => {
  const [dietPlan, setDietPlan] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dietexist();
  }, []);

  const dietexist = async() => {
    const dietPlan = await AsyncStorage.getItem('dietPlan');
    if (dietPlan) {
      setDietPlan(dietPlan);
    }
  }

  const handleGenerateDiet = async () => {
    try {
      setLoading(true);
      const email = await AsyncStorage.getItem('email');
  
      if (!email) {
        throw new Error('Email not found');
      }
      const res = await axios.post('http://192.168.64.143:8000/auth/get-user-details',null, {
       params: {
        username: email
    }
      });
      console.log(res.data);
      const {allergies,currentDietPlan,region,bmi,age} = res.data;
      // Log the request payload
   
      const requestPayload = {
      email: String(email),                      // Convert to string
      age: parseInt(age, 10),                    // Convert to integer
      allergies: String(allergies),              // Convert to string
      bmi: parseFloat(bmi),                      // Convert to float
      currentDietPlan: String(currentDietPlan),  // Convert to string
      region: String(region)                     // Convert to string
  };
      console.log('Request payload:', requestPayload);

      const response = await axios.post('http://192.168.64.143:8005/generate-diet-plan', requestPayload);
      
      setDietPlan(response.data.diet_plan);
  
      AsyncStorage.setItem('dietPlan', response.data.diet_plan);
      AsyncStorage.setItem('weightedPlan', response.data.weighted_plan.toString());
      // Reset meal ratings and completed days when a new diet plan is generated
      await AsyncStorage.setItem('mealRatings', JSON.stringify({}));
      await AsyncStorage.setItem('completedDays', JSON.stringify([]));
  
    } catch (error) {
      console.error('Error generating diet plan:', error);
      alert('Failed to generate diet plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderDietPlan = () => {
    if (!dietPlan) return null;

    const lines = dietPlan.split('\n');
    return lines.map((line, index) => {
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <Text key={index} style={styles.planText}>
            {parts.map((part, i) => 
              i % 2 === 0 ? part : <Text key={i} style={styles.boldText}>{part}</Text>
            )}
          </Text>
        );
      }
      return <Text key={index} style={styles.planText}>{line}</Text>;
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FFBB70', '#FFEC9E', '#FFFBDA']}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Generate Diet Plan</Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateDiet}
            disabled={loading}
          >
            <Text style={styles.generateButtonText}>
              {loading ? 'Generating...' : 'Generate Diet Plan'}
            </Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator size="large" color="#FF1493" />}
          {dietPlan ? (
            <View style={styles.planContainer}>
              {renderDietPlan()}
            </View>
          ) : null}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ED9455',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: 'hsl(30, 100%, 47.5%)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 20,
  },
  generateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  planContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  planText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default Diet;