import React from "react";
import { View, Text, SafeAreaView, StatusBar } from "react-native";
import { Stack } from "expo-router";
import DoaList from "./components/DoaList";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F2]">
      <StatusBar barStyle="light-content" backgroundColor="#096B68" />
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor: "#096B68",
          },
          headerTintColor: "#F2F2F2",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          title: "Doa dari Alquran",
        }}
      />
      <View className="flex-1 bg-[#F2F2F2]">
        <DoaList />
      </View>
    </SafeAreaView>
  );
}
