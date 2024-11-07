import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const Graph = () => {
  const [tasteWeights, setTasteWeights] = useState(null);
  const [gmail, setGmail] = useState(null);

  useEffect(() => {
    const fetchEmail = async () => {
      const email = await AsyncStorage.getItem('email');
      setGmail(email);
    };
    fetchEmail();
    fetchTasteWeights();
  }, []);

  const fetchTasteWeights = async () => {
    const storedGmail = await AsyncStorage.getItem('email');
    if (!storedGmail) return;
    try {
      
      const response = await fetch(`http://192.168.64.143:3000/get-taste-weights?gmail=${encodeURIComponent(storedGmail)}`);

      const data = await response.json();
      console.log('Received data:', data);
      setTasteWeights(data);
    } catch (error) {
      console.error('Error fetching taste weights:', error);
    }
  };

  const updateWeight = (taste, weight) => {
    setTasteWeights(prev => ({ ...prev, [taste]: weight }));
  };

  const saveWeights = async () => {
    const storedGmail = await AsyncStorage.getItem('email');
    try {
      const response = await fetch('http://192.168.64.143:3000/update-taste-weights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gmail: storedGmail, tasteWeights }),
      });
      if (response.ok) {
        alert('Weights updated successfully!');
      } else {
        throw new Error('Failed to update weights');
      }
    } catch (error) {
      console.error('Error saving weights:', error);
      alert('Failed to save weights. Please try again.');
    }
  };

  const renderGraph = () => {
    console.log('Rendering graph with weights:', tasteWeights);
    const size = Math.min(width, height) * 0.7;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;

    return (
      <Svg height={size} width={size}>
        <G transform={`translate(${centerX},${centerY})`}>
          {Object.entries(tasteWeights).map(([taste, weight], index) => {
            const angle = (index / Object.keys(tasteWeights).length) * 2 * Math.PI - Math.PI / 2;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);

            return (
              <React.Fragment key={taste}>
                <Line
                  x1={0}
                  y1={0}
                  x2={x}
                  y2={y}
                  stroke="#hsl(30, 100%, 45.5%)"
                  strokeWidth="2"
                />
                <Circle
                  cx={(weight / 5) * x}
                  cy={(weight / 5) * y}
                  r="8"
                  fill="#hsl(30, 100%, 45.5%)"
                />
                <SvgText
                  x={1.2 * x}
                  y={1.2 * y}
                  fill="#000000"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {taste}
                </SvgText>
              </React.Fragment>
            );
          })}
        </G>
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#EF9C66', '#F9D689', '#F5E7B2']}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Taste Preferences</Text>
          {tasteWeights ? renderGraph() : <Text style={styles.loadingText}>Loading...</Text>}
          {tasteWeights && Object.entries(tasteWeights).map(([taste, weight]) => (
            <View key={taste} style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>{taste}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={5}
                step={0.1}
                value={weight}
                onValueChange={(value) => updateWeight(taste, value)}
                minimumTrackTintColor="#003049"
                maximumTrackTintColor="#E2E8F0"
                thumbTintColor="#000000"
              />
              <Text style={styles.sliderValue}>{weight.toFixed(1)}</Text>
            </View>
          ))}
          {tasteWeights && (
            <TouchableOpacity style={styles.saveButton} onPress={saveWeights}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    color: '#000000',
    fontSize: 18,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  sliderLabel: {
    width: 60,
    color: '#003049',
    fontSize: 16,
  },
  slider: {
    flex: 1,
  },
  sliderValue: {
    width: 40,
    textAlign: 'right',
    color: '#000000',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#hsl(30, 100%, 45.5%)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Graph;
