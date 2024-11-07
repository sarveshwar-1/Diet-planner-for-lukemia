import { Ionicons } from '@expo/vector-icons';
import { Camera as ExpoCamera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loader from '../../components/Loader';

let API_KEY = "AIzaSyA-vL2SijziXK8aaXJanpPKddtKMChL7aQ";

const Camera = () => {
  const [image, setImage] = useState(null);
  const [foodName, setFoodName] = useState('');
  const [foodQuantity, setFoodQuantity] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const resizeImage = async (uri, targetSizeInBits) => {
    let width = 1080;
    let compressionQuality = 0.5;
    let resizedImage;
    
    while (true) {
      resizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: width } }],
        { compress: compressionQuality, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      const fileInfo = await FileSystem.getInfoAsync(resizedImage.uri, { size: true });
      const fileSizeInBits = fileInfo.size * 8;
      
      if (fileSizeInBits <= targetSizeInBits) {
        break;
      }
      
      if (compressionQuality > 0.1) {
        compressionQuality -= 0.1;
      } else if (width > 300) {
        width -= 100;
        compressionQuality = 0.7;
      } else {
        console.warn("Couldn't reduce image to target size");
        break;
      }
    }
    
    return resizedImage.uri;
  };

  const openCamera = async () => {
    const { status } = await ExpoCamera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadAndGenerateContent = async () => {
    if (!image) {
      alert('Please select or take an image first!');
      return;
    }
    if (!foodName || !foodQuantity) {
      alert('Please enter both food name and quantity!');
      return;
    }
    setLoading(true);
    try {
      const targetSizeInBits = 4.9 * 1024 * 1024; // 4.9 megabits
      const resizedImageUri = await resizeImage(image, targetSizeInBits);

      let base64Image = await FileSystem.readAsStringAsync(resizedImageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const finalFileInfo = await FileSystem.getInfoAsync(resizedImageUri, { size: true });

      const backendUrl = 'http://192.168.64.143:3000/upload-and-generate';
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: base64Image, 
          apiKey: API_KEY,
          foodName,
          foodQuantity
        }),
      });

      const result = await response.json();
      setResponse(result.aiResponse);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload the image or generate content.');
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={styles.boldText}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#FFBB70', '#FFEC9E', '#FFFBDA']}
          style={styles.container}
        >
          {loading && (
            <View style={styles.loaderContainer}>
              <Loader />
            </View>
          )}
          <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
            <Ionicons name="camera" size={24} color="white" />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Food Analysis</Text>
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              <Ionicons name="image" size={24} color="white" />
              <Text style={styles.buttonText}>Pick an image</Text>
            </TouchableOpacity>
            {image && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} />
              </View>
            )}
            <TextInput
              style={styles.input}
              placeholder="Food Name"
              value={foodName}
              onChangeText={setFoodName}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantity (e.g., 1 cup, 200g)"
              value={foodQuantity}
              onChangeText={setFoodQuantity}
            />
            <TouchableOpacity 
              style={[styles.uploadButton, (!image || !foodName || !foodQuantity) && styles.disabledButton]} 
              onPress={uploadAndGenerateContent}
              disabled={!image || !foodName || !foodQuantity || loading}
            >
              <Ionicons name="cloud-upload" size={24} color="white" />
              <Text style={styles.buttonText}>Analyze Food</Text>
            </TouchableOpacity>
            {response && (
              <View style={styles.responseContainer}>
                <Text style={styles.responseTitle}>AI Analysis:</Text>
                <Text style={styles.responseText}>
                  {renderFormattedText(response)}
                </Text>
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFBB70',
  },
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  cameraButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  imagePickerButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  imageContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#hsl(30, 100%, 47.5%)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 20,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  responseContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 10,
    width: '100%',
  },
  responseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF1493',
    marginBottom: 10,
  },
  responseText: {
    fontSize: 16,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 12,
    marginBottom: 10,
    width: '80%',
    fontSize: 16,
  },
});

export default Camera;
