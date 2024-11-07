import React, { useState, useEffect } from 'react';
import {router} from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Modal, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [childBirthday, setChildBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        const storedEmail = await AsyncStorage.getItem('email');
        const storedChildBirthday = await AsyncStorage.getItem('childBirthday');
        if (storedUsername) setUsername(storedUsername);
        if (storedEmail) setEmail(storedEmail);
        if (storedChildBirthday) setChildBirthday(new Date(storedChildBirthday));
      } catch (error) {
        console.error('Failed to fetch user data from AsyncStorage', error);
      }
    };

    fetchUserData();
  }, []);

  const blocks = [
    { title: 'Chat Bot', icon: 'chatbubble-ellipses', screen: '/Chatbot' },
    { title: 'Diet', icon: 'restaurant', screen: '/diet' },
    { title: 'Taste Graph', icon: 'stats-chart', screen: '/graph' },
    { title: 'Analyzer', icon: 'camera', screen: '/Camera' },
    {title: 'Rating', icon: 'star', screen: '/RatingPage'}
  ];

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['isLoggedIn', 'dietPlan']);
      setProfileModalVisible(false);
      router.replace('/Login');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || childBirthday;
    setShowDatePicker(Platform.OS === 'ios');
    setChildBirthday(currentDate);
  };

  // const saveChildBirthday = async () => {
  //   try {
  //     await AsyncStorage.setItem('childBirthday', childBirthday.toISOString());
  //     await AsyncStorage.setItem('pregnancy', 'false');
  //     alert('Child\'s birthday saved successfully!');
  //   } catch (error) {
  //     console.error('Failed to save child\'s birthday', error);
  //     alert('Failed to save child\'s birthday. Please try again.');
  //   }
  // };

  return (
  <>
    <StatusBar translucent backgroundColor="transparent" />
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FFBB70', '#FFEC9E', '#FFFBDA']} // Blue gradient
        style={styles.container}
      >
        <TouchableOpacity 
          style={styles.profileIcon} 
          onPress={() => setProfileModalVisible(true)}
        >
          <Ionicons name="person-circle" size={40} color="white" />
        </TouchableOpacity>
        <View style={styles.contentContainer}>
          <Text style={styles.welcomeText}>Welcome, {username}</Text>
          <View style={styles.blocksContainer}>
            {blocks.map((block, index) => (
              <TouchableOpacity
                key={index}
                style={styles.block}
                onPress={() => router.push(block.screen)}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)']}
                  style={styles.blockGradient}
                >
                  <Ionicons name={block.icon} size={40} color="#hsl(30, 100%, 45.5%)" />
                  <Text style={styles.blockText}>{block.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isProfileModalVisible}
          onRequestClose={() => setProfileModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setProfileModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#1E90FF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Profile</Text>
              <Text style={styles.modalText}>Username: {username}</Text>
              <Text style={styles.modalText}>Email: {email}</Text>
              {/* <Text style={styles.modalText}>Child's Birthday:</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>{childBirthday.toDateString()}</Text>
              </TouchableOpacity> */}
              {/* {showDatePicker && (
                <DateTimePicker
                  value={childBirthday}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
              <TouchableOpacity style={styles.saveButton} onPress={saveChildBirthday}>
                <Text style={styles.saveButtonText}>Save Child's Birthday</Text>
              </TouchableOpacity> */}
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  </>
);

};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFBB70', // Match the start color of your gradient
  },
  container: {
    flex: 1,
    padding: 20,
  },
  profileIcon: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 30,
    textAlign: 'center',
  },
  blocksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
  },
  block: {
    width: '45%',
    aspectRatio: 1,
    margin: '2.5%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  blockGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  blockText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#hsl(30, 100%, 45.5%)', // Blue text color
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '50%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#hsl(30, 100%, 45.5%)', // Blue title color
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#hsl(30, 100%, 45.5%)', // Blue button background
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
