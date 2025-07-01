import type React from "react";
import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import UserProfileCard from "../components/UserProfile/UserProfileCard";
import PersonalInfoCard from "../components/UserProfile/PersonalInfoCard";
import LoyaltyCard from "../components/UserProfile/LoyaltyCard";

const UserProfileScreen: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const userDataString = await AsyncStorage.getItem("userData");
      const accessToken = await AsyncStorage.getItem("access_token");

      if (!userDataString || !accessToken) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.");
        return;
      }

      const user = JSON.parse(userDataString);
      const userId = user.id;

      if (!userId || userId === "unknown") {
        Alert.alert("Lỗi", "Không tìm thấy ID người dùng.");
        return;
      }

      const response = await axios.get(
        `${Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const { data } = response.data;
      setUserData(data);
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      let errorMessage = "Đã xảy ra lỗi khi lấy thông tin người dùng. Vui lòng thử lại.";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("access_token");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }], // tên screen cần điều hướng về
      });
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <Text>Không thể tải thông tin người dùng.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isVIP = userData.rank !== "Đồng";
  const currentLevel = userData.rank || "Đồng";
  const currentPoints = 750; // Placeholder
  const totalPoints = 1000;
  const nextLevelPoints = totalPoints - currentPoints;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <UserProfileCard
            name={userData.fullName || "User"}
            email={userData.email || ""}
            isVIP={isVIP}
          />
          <PersonalInfoCard
            fullName={userData.fullName || "User"}
            phone={userData.phoneNumber || ""}
            email={userData.email || ""}
            address={userData.address || "Chưa cung cấp địa chỉ"}
            onEdit={() => console.log("Edit pressed")}
          />
          <LoyaltyCard
            currentLevel={currentLevel}
            currentPoints={currentPoints}
            totalPoints={totalPoints}
            nextLevelPoints={nextLevelPoints}
            onSeeMore={() => console.log("Xem thêm ưu đãi")}
          />
          <View style={styles.card}>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
              <Text style={styles.buttonText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    margin: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  contentContainer: {
    flex: 1,
    position: "relative",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  button: {
    borderColor: "black",
    borderWidth: 1.2,
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    fontWeight: "600",
  },
});

export default UserProfileScreen;
