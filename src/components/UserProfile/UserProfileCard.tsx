import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useUserProfile } from "../../contexts/UserProfileContext";

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
  const { userProfile } = useUserProfile();
  const hasSubscription = !!userProfile?.subscription;

  // Get initials from name for avatar
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Background colors based on subscription status
  const gradientColors = hasSubscription
    ? ['#2196f3', '#00bcd4', '#03a9f4'] as const // Blue gradient for subscribers
    : ['#F8B26A', '#F69942', '#F57C00'] as const; // Orange gradient for non-subscribers

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Avatar Circle */}
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={[
            styles.avatarText, 
            hasSubscription && { color: '#2196f3' }
          ]}>
            {getInitials(name)}
          </Text>
        )}
      </View>
      
      {/* User Name */}
      <Text style={styles.nameText}>{name}</Text>
      
      {/* Update Profile Button */}
      <TouchableOpacity 
        style={[
          styles.updateButton, 
          hasSubscription && styles.subscriberButton
        ]} 
        onPress={onUpdateProfile}
      >
        <Text style={[
          styles.updateButtonText,
          hasSubscription && { color: '#2196f3' }
        ]}>
          Cập nhật thông tin cá nhân
        </Text>
        <Ionicons name="chevron-forward" size={14} color={hasSubscription ? "#2196f3" : "#F57C00"} />
      </TouchableOpacity>
      
      {/* Subscription Label */}
      {hasSubscription && (
        <View style={styles.subscriptionBadge}>
          <Ionicons name="star" size={14} color="#FFFFFF" style={{marginRight: 4}} />
          <Text style={styles.subscriptionBadgeText}>
            {userProfile?.subscription?.plan?.name || userProfile?.subscription?.planDetails?.name || "Ultimated"}
          </Text>
        </View>
      )}
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
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
  subscriberButton: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  updateButtonText: {
    fontSize: 14,
    color: "#F57C00",
    marginRight: 4,
    fontWeight: "600",
  },
  subscriptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 6,
  },
  subscriptionBadgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default UserProfileCard;
