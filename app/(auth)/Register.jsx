import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Loader from "../../components/Loader";
import { icons } from "../../constants";


const Register = () => {
    const calculateBMI = (height, weight) => {
        return (weight / ((height / 100) ** 2)).toFixed(2);
    }
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
        userName: "",
        height: "",
        weight: "",
        allergies: "",
        currentDietPlan: "",
        region: "",
        dob: "",
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const calculateAge = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    const handleRegisterClick = () => {
        if (!form.email || !form.password || !form.userName) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        handleRegister();
    }

    const handleRegister = async () => {
       try {
    console.log('Attempting to register...');
    const response = await axios.post('http://192.168.64.143:8000/auth/register', {
    email: form.email,
    username: form.userName, // Ensure the correct casing for username
    password: form.password,
    height: parseFloat(form.height), // Ensure height is a float
    weight: parseFloat(form.weight), // Ensure weight is a float
    allergies: form.allergies || null, // Ensure optional fields are handled
    currentDietPlan: form.currentDietPlan || null, // Ensure optional fields are handled
    region: form.region || null, // Ensure optional fields are handled
    bmi: calculateBMI(parseFloat(form.height), parseFloat(form.weight)) || null, // Ensure bmi is a float
    age: calculateAge(form.dob) || null,
});
    console.log('First API call successful:', response.data);

    const graphResponse = await axios.post('http://192.168.64.143:3000/register', {
        gmail: form.email
    });
    console.log('Second API call successful:', graphResponse.data);

    await AsyncStorage.setItem('email', form.email);
    await AsyncStorage.setItem('username', form.userName);
    console.log('Email saved to AsyncStorage');

    Alert.alert('Success', 'Registration successful and taste graph created');
    router.replace('/Login');
} catch (err) {
    console.error('Registration error:', err);
    const errorMessage = typeof err.response?.data?.detail === 'string'
        ? err.response.data.detail
        : err.message || 'Registration failed';
    Alert.alert('Error', errorMessage);
}
    }

    return (
        <SafeAreaView className="bg-primary h-full w-full justify-center">
            {loading && <Loader />}
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="mx-2 mb-2"
                contentContainerStyle={{ minHeight: "100%", justifyContent: "center" }}
            >
                <View className="w-full justify-center items-center mt-7">
                    <Text className="text-2xl font-pbold text-main">Welcome</Text>
                    <Text className="text-gray-200 text-lg">Register to get started</Text>
                </View>

                {/* Email */}
                <View className="mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                    <Image className="w-6 h-6" source={icons.mail} resizeMode="contain" />
                    <TextInput
                        onChangeText={(e) => setForm({ ...form, email: e })}
                        className="flex-1 font-pmedium ml-2"
                        placeholder="Email address"
                        keyboardType="email-address"
                    />
                </View>
                <View className="mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                    <Image className="w-6 h-6" source={icons.user} resizeMode="contain" />
                    <TextInput
                        onChangeText={(e) => setForm({ ...form, userName: e })}
                        className="flex-1 font-pmedium ml-2"
                        placeholder="User Name"
                    />
                </View>
                {/* Password */}
                <View className="mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                    <Image className="w-6 h-6" source={icons.lock} resizeMode="contain" />
                    <TextInput
                        onChangeText={(e) => setForm({ ...form, password: e })}
                        className="flex-1 font-pmedium ml-2"
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Image source={!showPassword ? icons.eye : icons.eyeHide} className="w-6 h-6" resizeMode="contain" />
                    </TouchableOpacity>
                </View>
                {showDatePicker && (
                    <DateTimePicker
                        value={new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                                const formattedDate = selectedDate.toISOString().split('T')[0];
                                setForm({ ...form, dob: formattedDate });
                            }
                        }}
                    />
                )}

                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4"
                >
                    <Text className="flex-1 font-pmedium ml-2">
                        {form.dob ? form.dob : "Date of Birth (YYYY-MM-DD)"}
                    </Text>
                </TouchableOpacity>

                {/* Height */}
                <View className="mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                    <TextInput
                        onChangeText={(e) => setForm({ ...form, height: e })}
                        className="flex-1 font-pmedium ml-2"
                        placeholder="Height (in cm)"
                        keyboardType="numeric"
                    />
                </View>

                {/* Weight */}
                <View className="mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                    <TextInput
                        onChangeText={(e) => setForm({ ...form, weight: e })}
                        className="flex-1 font-pmedium ml-2"
                        placeholder="Weight (in kg)"
                        keyboardType="numeric"
                    />
                </View>

                {/* Allergies */}
                <View className="mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                    <TextInput
                        onChangeText={(e) => setForm({ ...form, allergies: e })}
                        className="flex-1 font-pmedium ml-2"
                        placeholder="Allergies (if any)"
                    />
                </View>

                {/* Current Diet Plan */}
                <View className="mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                    <TextInput
                        onChangeText={(e) => setForm({ ...form, currentDietPlan: e })}
                        className="flex-1 font-pmedium ml-2"
                        placeholder="Current Diet Plan"
                    />
                </View>

                {/* Region */}
                <View className="mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                    <TextInput
                        onChangeText={(e) => setForm({ ...form, region: e })}
                        className="flex-1 font-pmedium ml-2"
                        placeholder="Region"
                    />
                </View>

                <TouchableOpacity
                    onPress={handleRegisterClick}
                    className="bg-main mt-5 flex-row p-3 rounded-full items-center justify-center"
                >
                    <Text className="ml-3 text-lg text-white items-center justify-center">Register</Text>
                </TouchableOpacity>

                <View className="w-full justify-end items-center pt-3 flex-row">
                    <Text className="font-pregular text-gray-200">Already have an account? </Text>
                    <Link href="/Login" className="text-lg text-main mx-2">Login</Link>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Register;
