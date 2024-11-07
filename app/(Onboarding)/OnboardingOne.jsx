import React from "react";
import { View, Text, Image } from "react-native";
import { images } from "../../constants";

const OnboardingOne = () => {
  return (
    <View className="bg-primary w-full h-full justify-center">
      <View className="justify-center items-center">
        <Image
          className="w-[319px] h-[305px]"
          resizeMode="contain"
          source={images.onboarding1}
        />
      </View>

      <View className="w-100">
        <Text className="mx-1 text-center text-black-100 text-3xl font-pbold mt-14 mb-3 mb-">
        Instant Expert Advice for Lukemia Patients
        </Text>
        <Text className="text-gray-300 font-pmedium text-lg text-center leading-6">
          
Get quick and reliable answers to your Lukemia and health-related questions with our personalized chatbot, 
designed to provide expert guidance at your fingertips.
        </Text>
      </View>
    </View>
  );
};
export default OnboardingOne;
