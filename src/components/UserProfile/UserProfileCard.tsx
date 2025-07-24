import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface UserProfileCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
  onUpdateProfile?: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  name,
  email,
  avatarUrl,
  onUpdateProfile,
}) => {
  // Get initials from name for avatar
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <LinearGradient
      colors={['#F8B26A', '#F69942', '#F57C00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Avatar Circle */}
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{getInitials(name)}</Text>
      </View>
      
      {/* User Name */}
      <Text style={styles.nameText}>{name}</Text>
      
      {/* Update Profile Button */}
      <TouchableOpacity style={styles.updateButton} onPress={onUpdateProfile}>
        <Text style={styles.updateButtonText}>Cập nhật thông tin cá nhân</Text>
        <Ionicons name="chevron-forward" size={14} color="#333" />
      </TouchableOpacity>
      
      {/* Registration Button */}
      <TouchableOpacity style={styles.registerButton}>
        <Text style={styles.registerButtonText}>Đăng ký ngay</Text>
      </TouchableOpacity>
      
      {/* Subscription Label */}
      <Text style={styles.subscriptionText}>Gói đăng cấp vippro</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    borderRadius: 0,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "500",
    color: "#F57C00",
  },
  nameText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  updateButtonText: {
    fontSize: 14,
    color: "#F57C00",
    marginRight: 4,
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  registerButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#F57C00",
  },
  subscriptionText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

export default UserProfileCard;
