import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";

interface DoaDetailProps {
  id?: string;
  name?: string;
  arabicText?: string;
  translation?: string;
  onNextDoa?: () => void;
  totalDoas?: number;
  currentIndex?: number;
}

const DoaDetail = ({
  id = "1",
  name = "Doa Pembuka",
  arabicText = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
  translation = "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang",
  onNextDoa = () => {},
  totalDoas = 10,
  currentIndex = 1,
}: DoaDetailProps) => {
  const router = useRouter();

  const handleNextDoa = () => {
    onNextDoa();
  };

  return (
    <View className="flex-1 bg-[#F2F2F2] p-4">
      <ScrollView className="flex-1">
        {/* Doa Name */}
        <View className="bg-[#096B68] rounded-lg p-4 mb-6 shadow-md">
          <Text className="text-2xl font-bold text-white text-center">
            {name}
          </Text>
        </View>

        {/* Arabic Text */}
        <View className="bg-white rounded-lg p-6 mb-6 shadow-md">
          <Text
            className="text-2xl text-right leading-10 text-[#096B68]"
            style={{ fontFamily: "System" }}
          >
            {arabicText}
          </Text>
        </View>

        {/* Translation */}
        <View className="bg-[#90D1CA] rounded-lg p-6 mb-6 shadow-md">
          <Text className="text-lg text-[#096B68]">{translation}</Text>
        </View>

        {/* Position indicator */}
        <Text className="text-center text-[#129990] mb-4">
          {currentIndex} dari {totalDoas}
        </Text>
      </ScrollView>

      {/* Next Button */}
      <TouchableOpacity
        className="bg-[#129990] py-4 px-6 rounded-full flex-row items-center justify-center mt-4 shadow-md"
        onPress={handleNextDoa}
      >
        <Text className="text-white text-lg font-bold mr-2">
          Doa Selanjutnya
        </Text>
        <ChevronRight size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default DoaDetail;
