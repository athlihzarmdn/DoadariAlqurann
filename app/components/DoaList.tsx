import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, Heart } from "lucide-react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DoaItem {
  id: string;
  "Nama Do'a": string;
  favorite?: boolean;
}

interface DoaListProps {
  doaList?: DoaItem[];
}

const BASEROW_TOKEN = "nhg3j7C6oD37cs9NObD3PI4fQd5HNf3L";
const TABLE_ID = "550282";
const BASEROW_API_URL = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/`;

export default function DoaList({ doaList }: DoaListProps) {
  const router = useRouter();
  const [doas, setDoas] = useState<DoaItem[]>([]);
  const [filteredDoas, setFilteredDoas] = useState<DoaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDoas();
    loadFavorites();
  }, [currentPage]);

  useEffect(() => {
    let filtered = doas;

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((doa) =>
        doa["Nama Do'a"].toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter((doa) => favorites.has(doa.id));
    }

    setFilteredDoas(filtered);
  }, [searchQuery, doas, favorites, showFavoritesOnly]);

  const fetchDoas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(BASEROW_API_URL, {
        headers: {
          Authorization: `Token ${BASEROW_TOKEN}`,
        },
        params: {
          user_field_names: true,
          page: currentPage,
          size: itemsPerPage,
        },
      });

      setDoas(response.data.results);
      setTotalPages(Math.ceil(response.data.count / itemsPerPage));
    } catch (error) {
      console.error("Error fetching doas:", error);
      // Fallback to default data if API fails
      setDoas(defaultDoaList as any);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem("favorites");
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const toggleFavorite = async (doaId: string) => {
    try {
      const newFavorites = new Set(favorites);
      if (newFavorites.has(doaId)) {
        newFavorites.delete(doaId);
        // Update Baserow - remove favorite
        await updateFavoriteInBaserow(doaId, false);
      } else {
        newFavorites.add(doaId);
        // Update Baserow - add favorite
        await updateFavoriteInBaserow(doaId, true);
      }
      setFavorites(newFavorites);
      await AsyncStorage.setItem(
        "favorites",
        JSON.stringify([...newFavorites]),
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const updateFavoriteInBaserow = async (
    doaId: string,
    isFavorite: boolean,
  ) => {
    try {
      await axios.patch(
        `${BASEROW_API_URL}${doaId}/`,
        {
          favorite: isFavorite,
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

  const navigateToDoaDetail = (id: string) => {
    router.push(`/doa/${id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderItem = ({ item }: { item: DoaItem }) => (
    <TouchableOpacity
      style={styles.doaItem}
      onPress={() => navigateToDoaDetail(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.doaItemContent}>
        <View style={styles.doaItemHeader}>
          <Text style={styles.doaName}>{item["Nama Do'a"]}</Text>
          <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            style={styles.favoriteButton}
          >
            <Heart
              size={20}
              color={favorites.has(item.id) ? "#FF6B6B" : "#999"}
              fill={favorites.has(item.id) ? "#FF6B6B" : "transparent"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.pageButton,
            currentPage === i && styles.activePageButton,
          ]}
          onPress={() => handlePageChange(i)}
        >
          <Text
            style={[
              styles.pageButtonText,
              currentPage === i && styles.activePageButtonText,
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>,
      );
    }
    return <View style={styles.paginationContainer}>{pages}</View>;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#129990" />
        <Text style={styles.loadingText}>Memuat doa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#096B68" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari doa..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Favorit Button */}
      <TouchableOpacity
        style={[
          styles.favoritButton,
          showFavoritesOnly && styles.favoritButtonActive,
        ]}
        onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
      >
        <Text
          style={[
            styles.favoritText,
            showFavoritesOnly && styles.favoritTextActive,
          ]}
        >
          {showFavoritesOnly ? "❤️ Tampilkan Semua" : "📖 Favorit"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={filteredDoas}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Pagination */}
      {totalPages > 1 && renderPagination()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    width: "100%",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#096B68",
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#129990",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#096B68",
  },
  favoritButton: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#129990",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  favoritText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#096B68",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  doaItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doaItemContent: {
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#129990",
    borderRadius: 12,
  },
  doaItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  doaName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#096B68",
    flex: 1,
    marginRight: 10,
  },
  favoriteButton: {
    padding: 4,
  },
  favoritButtonActive: {
    backgroundColor: "#129990",
  },
  favoritTextActive: {
    color: "#FFFFFF",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  pageButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#129990",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    minWidth: 40,
    alignItems: "center",
  },
  activePageButton: {
    backgroundColor: "#129990",
  },
  pageButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#129990",
  },
  activePageButtonText: {
    color: "#FFFFFF",
  },
});

// Default data for preview and testing
const defaultDoaList = [
  { id: "1", "Nama Do'a": "Doa Memohon Kebaikan Dunia dan Akhirat" },
  { id: "2", "Nama Do'a": "Doa Memohon Kesabaran" },
  { id: "3", "Nama Do'a": "Doa Memohon Perlindungan" },
  { id: "4", "Nama Do'a": "Doa Memohon Ampunan" },
  { id: "5", "Nama Do'a": "Doa Memohon Petunjuk" },
  { id: "6", "Nama Do'a": "Doa Memohon Rezeki yang Halal" },
  { id: "7", "Nama Do'a": "Doa Memohon Ilmu yang Bermanfaat" },
  { id: "8", "Nama Do'a": "Doa Memohon Keselamatan" },
  { id: "9", "Nama Do'a": "Doa Memohon Kekuatan Iman" },
  { id: "10", "Nama Do'a": "Doa Memohon Ketenangan Hati" },
];
