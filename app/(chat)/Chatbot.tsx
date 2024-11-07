import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoadingDots from './LoadingDots';
import axios from 'axios';

enum Role {
    User,
    Bot
}

type Chat = {
    role: Role,
    text: string
}

const Chatbot = () => {
    const [chats, setChats] = useState<Chat[]>([{ role: Role.Bot, text: "Hello! How can I help you?" }]);
    const [text, setText] = useState('');
    const [waitingForBot, setWaitingForBot] = useState(false);
    const [username, setUsername] = useState('User');
    // const [isPregnant, setIsPregnant] = useState<boolean | null>(null);
    // const [dateOfBirth, setDateOfBirth] = useState<string | null>(null);
    // const [pregnancyDate, setPregnancyDate] = useState<string | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const email = AsyncStorage.getItem('email');
                const storedUsername = await AsyncStorage.getItem('username');
                setUsername(storedUsername);

                // const storedIsPregnant = await AsyncStorage.getItem('pregnancy');
                // const storedDateOfBirth = await AsyncStorage.getItem('dob');

                // if (storedUsername) setUsername(storedUsername);
                // if (storedIsPregnant) setIsPregnant(storedIsPregnant === 'true');
                // if (storedDateOfBirth) {
                //     const date = new Date(storedDateOfBirth);
                //     setDateOfBirth(date.toISOString().split('T')[0]);
                //     if (storedIsPregnant === 'true') {
                //         setPregnancyDate(date.toISOString().split('T')[0]);
                //     }
                // }
                // const res = await axios.post('http://192.168.64.143:8000/auth/get-user-details', null, {
                //     params: {
                //         username: email
                //     }
                // });
                // console.log(res.data);
                // const { allergies, currentDietPlan, region, bmi, age } = res.data;
            } catch (error) {
                console.error('Failed to fetch user data from AsyncStorage', error);
            }
        };

        fetchUserData();
    }, []);

    const fetchData = async () => {
        const query_text = chats[chats.length - 1].text;
        const requestBody = {
            query: query_text,
        };
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        const response = await fetch('http://192.168.64.143:8006/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            console.error('Response status:', response.status);
            console.error('Response text:', await response.text());
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.response;
    };

    const userResponse = (text: string) => {
        setChats(prevChats => [...prevChats, { role: Role.User, text: text }]);
    };

    const botResponse = (text: string) => {
        setChats(prevChats => [...prevChats, { role: Role.Bot, text: text }]);
    };

    const onSend = async () => {
        if (!text) return;
        userResponse(text);
        setWaitingForBot(true);
        setText('');
    };

    useEffect(() => {
        const handleBotResponse = async () => {
            if (waitingForBot) {
                try {
                    const data = await fetchData();
                    botResponse(data);
                } catch (error) {
                    console.error('Error fetching bot response:', error);
                    botResponse("I'm sorry, I encountered an error. Please try again.");
                } finally {
                    setWaitingForBot(false);
                }
            }
        };

        handleBotResponse();
    }, [waitingForBot]);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [chats]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar translucent backgroundColor="transparent" />
            <LinearGradient
                colors={['#FFBB70', '#FFEC9E', '#FFFBDA']}
                style={styles.container}
            >
                <View style={styles.header}>
                    <Text style={styles.headerText}>Hello, {username}</Text>
                </View>
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                >
                    {chats.map((chat, index) => (
                        <View key={index} style={[styles.chatRow, chat.role === Role.User ? styles.userChat : styles.botChat]}>
                            <View style={styles.chatBubble}>
                                <Text style={styles.chatText}>{chat.text}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {waitingForBot && <LoadingDots />}

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <ScrollView>
                            <TextInput
                                value={text}
                                onChangeText={(text) => { setText(text) }}
                                style={styles.textInput}
                                placeholder="Type your message..."
                                placeholderTextColor="#999"
                                multiline
                            />
                        </ScrollView>
                    </View>
                    <TouchableOpacity onPress={onSend} style={styles.sendButton}>
                        <Ionicons name="send" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ED9455', // pink-500
    },
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: 'flex-start',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    scrollView: {
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    chatRow: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    userChat: {
        justifyContent: 'flex-end',
    },
    botChat: {
        justifyContent: 'flex-start',
    },
    chatBubble: {
        padding: 10,
        borderRadius: 15,
        maxWidth: '80%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    chatText: {
        fontSize: 16,
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        paddingBottom: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    inputWrapper: {
        flex: 1,
        marginRight: 10,
        maxHeight: 100, // Limit the height of the input
    },
    textInput: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: '#333',
    },
    sendButton: {
        backgroundColor: '#ED9455', // pink-500
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Chatbot;
