import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASEROW_TOKEN = "nhg3j7C6oD37cs9NObD3PI4fQd5HNf3L";
const TABLE_ID = "550282";
const BASEROW_API_URL = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/`;

interface DoaData {
  id: string;
  "Nama Do'a": string;
  "Kalimat Do'a": string;
  "Arti Do'a": string;
}

// Fallback data
const fallbackDoaData: DoaData[] = [
  {
    id: "1",
    "Nama Do'a": "Doa Memohon Petunjuk",
    "Kalimat Do'a":
      "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ",
    "Arti Do'a":
      "Ya Tuhan kami, janganlah Engkau jadikan hati kami condong kepada kesesatan sesudah Engkau beri petunjuk kepada kami, dan karuniakanlah kepada kami rahmat dari sisi Engkau; karena sesungguhnya Engkau-lah Maha Pemberi (karunia).",
  },
  {
    id: "2",
    "Nama Do'a": "Doa Memohon Kebaikan",
    "Kalimat Do'a":
      "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    "Arti Do'a":
      "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat dan peliharalah kami dari siksa neraka.",
  },
  {
    id: "3",
    "Nama Do'a": "Doa Memohon Kesabaran",
    "Kalimat Do'a":
      "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
    "Arti Do'a":
      "Ya Tuhan kami, limpahkanlah kesabaran kepada kami dan kokohkanlah pendirian kami dan tolonglah kami terhadap orang-orang kafir.",
  },
  {
    id: "4",
    "Nama Do'a": "Doa Memohon Ampunan",
    "Kalimat Do'a":
      "رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
    "Arti Do'a":
      "Ya Tuhan kami, ampunilah dosa-dosa kami dan tindakan-tindakan kami yang berlebih-lebihan dalam urusan kami dan tetapkanlah pendirian kami, dan tolonglah kami terhadap kaum yang kafir.",
  },
  {
    id: "5",
    "Nama Do'a": "Doa Memohon Perlindungan",
    "Kalimat Do'a":
      "رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلْقَوْمِ الظَّالِمِينَ وَنَجِّنَا بِرَحْمَتِكَ مِنَ الْقَوْمِ الْكَافِرِينَ",
    "Arti Do'a":
      "Ya Tuhan kami, janganlah Engkau jadikan kami sasaran fitnah bagi kaum yang zalim, dan selamatkanlah kami dengan rahmat Engkau dari kaum yang kafir.",
  },
];

export default function DoaDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [currentDoa, setCurrentDoa] = useState<DoaData | null>(null);
  const [allDoas, setAllDoas] = useState<DoaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchDoaById(id as string);
    fetchAllDoas();
    checkFavoriteStatus(id as string);
  }, [id]);

  const fetchDoaById = async (doaId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASEROW_API_URL}${doaId}/`, {
        headers: {
          Authorization: `Token ${BASEROW_TOKEN}`,
        },
        params: {
          user_field_names: true,
        },
      });
      setCurrentDoa(response.data);
    } catch (error) {
      console.error("Error fetching doa:", error);
      // Fallback to local data
      const fallbackDoa =
        fallbackDoaData.find((doa) => doa.id === doaId) || fallbackDoaData[0];
      setCurrentDoa(fallbackDoa);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDoas = async () => {
    try {
      const response = await axios.get(BASEROW_API_URL, {
        headers: {
          Authorization: `Token ${BASEROW_TOKEN}`,
        },
        params: {
          user_field_names: true,
          size: 100, // Get more items for navigation
        },
      });
      setAllDoas(response.data.results);
      const currentIdx = response.data.results.findIndex(
        (doa: DoaData) => doa.id === id,
      );
      setCurrentIndex(currentIdx >= 0 ? currentIdx : 0);
    } catch (error) {
      console.error("Error fetching all doas:", error);
      setAllDoas(fallbackDoaData);
      const currentIdx = fallbackDoaData.findIndex((doa) => doa.id === id);
      setCurrentIndex(currentIdx >= 0 ? currentIdx : 0);
    }
  };

  const handleNextDoa = () => {
    if (allDoas.length > 0) {
      const nextIndex = (currentIndex + 1) % allDoas.length;
      const nextDoa = allDoas[nextIndex];
      router.push(`/doa/${nextDoa.id}`);
    }
  };

  const handlePrevDoa = () => {
    if (allDoas.length > 0) {
      const prevIndex = (currentIndex - 1 + allDoas.length) % allDoas.length;
      const prevDoa = allDoas[prevIndex];
      router.push(`/doa/${prevDoa.id}`);
    }
  };

  const checkFavoriteStatus = async (doaId: string) => {
    try {
      const savedFavorites = await AsyncStorage.getItem("favorites");
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites);
        setIsFavorite(favorites.includes(doaId));
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem("favorites");
      let favorites = savedFavorites ? JSON.parse(savedFavorites) : [];

      if (isFavorite) {
        favorites = favorites.filter((fav: string) => fav !== id);
        await updateFavoriteInBaserow(id as string, false);
      } else {
        favorites.push(id);
        await updateFavoriteInBaserow(id as string, true);
      }

      await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const updateFavoriteInBaserow = async (doaId: string, favorite: boolean) => {
    try {
      await axios.patch(
        `${BASEROW_API_URL}${doaId}/`,
        {
          favorite: favorite,
        },
        {
          headers: {
            Authorization: `Token ${BASEROW_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error) {
      console.error("Error updating favorite in Baserow:", error);
    }
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  if (loading || !currentDoa) {
    return (
      <View className="flex-1 bg-[#F2F2F2] justify-center items-center">
        <ActivityIndicator size="large" color="#129990" />
        <Text className="mt-4 text-[#096B68] text-lg">Memuat doa...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#90D1CA]">
      {/* Header with back button and save */}
      <View className="bg-[#90D1CA] p-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={handleBackToHome}
          className="flex-row items-center"
        >
          <ArrowLeft size={24} color="#096B68" />
          <Text className="text-lg font-bold text-[#096B68] ml-2">
            Kembali ke Daftar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} className="items-center">
          <Heart
            size={24}
            color={isFavorite ? "#FF6B6B" : "#096B68"}
            fill={isFavorite ? "#FF6B6B" : "transparent"}
          />
          <Text className="text-sm text-[#096B68] mt-1">
            {isFavorite ? "Favorit" : "Simpan"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <ScrollView className="flex-1 px-4">
        {/* Doa Card */}
        <View className="bg-white rounded-2xl p-6 mx-2 mt-4 shadow-lg">
          {/* Doa Name */}
          <Text className="text-2xl font-bold text-[#096B68] mb-4">
            {currentDoa["Nama Do'a"]}
          </Text>

          {/* Lafadz Doa Label */}
          <Text className="text-lg font-bold text-[#129990] mb-3">
            Lafadz Doa
          </Text>

          {/* Arabic Text */}
          <Text
            className="text-2xl text-right leading-10 text-[#096B68] mb-6"
            style={{ fontFamily: "System" }}
          >
            {currentDoa["Kalimat Do'a"]}
          </Text>

          {/* Arti Doa Label */}
          <Text className="text-lg font-bold text-[#129990] mb-3">
            Arti Doa
          </Text>

          {/* Translation */}
          <Text className="text-base text-[#096B68] leading-6">
            {currentDoa["Arti Do'a"]}
          </Text>
        </View>
      </ScrollView>

      {/* Navigation buttons */}
      <View className="flex-row justify-between bg-[#90D1CA] p-4">
        <TouchableOpacity
          onPress={handlePrevDoa}
          className="bg-[#129990] px-6 py-3 rounded-2xl flex-row items-center flex-1 mr-2 justify-center"
        >
          <ArrowLeft size={20} color="#FFFFFF" />
          <Text className="text-white ml-2 font-bold">Doa Sebelumnya</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNextDoa}
          className="bg-[#129990] px-6 py-3 rounded-2xl flex-row items-center flex-1 ml-2 justify-center"
        >
          <Text className="text-white mr-2 font-bold">Doa Selanjutnya</Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
