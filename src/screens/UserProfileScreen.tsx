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
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import UserProfileCard from "../components/UserProfile/UserProfileCard";
import PersonalInfoCard from "../components/UserProfile/PersonalInfoCard";
import LoyaltyCard from "../components/UserProfile/LoyaltyCard";
import { useUserProfile } from "../contexts/UserProfileContext";

// Define navigation types
type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  Register: undefined;
  MyOrder: undefined;
  // Add other screens as needed
};

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { userProfile, isLoading, error, refreshUserProfile } = useUserProfile();

  useEffect(() => {
    refreshUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem('wishlistId');
      
      // Reset navigation to Login screen with proper typing
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
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

  if (error || !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <Text>Không thể tải thông tin người dùng.</Text>
          <TouchableOpacity onPress={refreshUserProfile} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isVIP = userProfile.rank !== "Đồng";
  const currentLevel = userProfile.rank || "Đồng";
  const currentPoints = 750; // Placeholder
  const totalPoints = 1000;
  const nextLevelPoints = totalPoints - currentPoints;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <UserProfileCard
            name={userProfile.fullName || "User"}
            email={userProfile.email || ""}
            avatarUrl={userProfile.avatarUrl || ""}
            isVIP={isVIP}
          />
          <PersonalInfoCard
            fullName={userProfile.fullName || "User"}
            phone={userProfile.phoneNumber || "Chưa cung cấp"}
            email={userProfile.email || ""}
            address={userProfile.address || "Chưa cung cấp địa chỉ"}
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
            <TouchableOpacity 
              style={[styles.button, styles.myOrderButton]} 
              onPress={() => navigation.navigate('MyOrder')}
            >
              <Ionicons name="receipt-outline" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.myOrderButtonText}>Đơn hàng của tôi</Text>
            </TouchableOpacity>
          </View>
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
  retryButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f6ac69",
    borderRadius: 6,
    alignItems: "center",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  myOrderButton: {
    backgroundColor: "#f6ac69", // Brand color to match the theme
    borderWidth: 0,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  myOrderButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
});

export default UserProfileScreen;
