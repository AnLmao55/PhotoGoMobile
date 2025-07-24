import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Linking, ColorValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUserProfile } from "../../contexts/UserProfileContext";
import { SubscriptionPlan } from "../../services/subscriptionService";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";

interface PlanBenefit {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  iconColor?: string;
}

interface PremiumPlanCardProps {
  plan?: SubscriptionPlan;
  onBuyPlan?: () => void;
  hasSubscription?: boolean;
}

const defaultBenefits: PlanBenefit[] = [
  { icon: "ticket", text: "Giảm giá 10% trên tổng đơn hàng", iconColor: "#F8B26A" },
  { icon: "gift", text: "Mã giảm giá 10%", iconColor: "#F8B26A" },
  { icon: "flash", text: "Free rush booking", iconColor: "#F8B26A" },
  { icon: "calendar", text: "Thư mời tham gia workshop", iconColor: "#F8B26A" },
];

const extractBenefitsFromDescription = (description: string): PlanBenefit[] => {
  // Extract benefits from HTML description
  const benefits: PlanBenefit[] = [];
  const items = description.match(/<li><p>(.*?)<\/p><\/li>/g);
  
  if (items && items.length > 0) {
    items.forEach((item, index) => {
      const textMatch = item.match(/<li><p>(.*?)<\/p><\/li>/);
      if (textMatch && textMatch[1]) {
        // Assign different icons based on the content or index
        const iconMap: {[key: number]: keyof typeof Ionicons.glyphMap} = {
          0: "ticket",
          1: "gift",
          2: "flash",
          3: "calendar"
        };
        
        benefits.push({
          icon: iconMap[index] || "star",
          text: textMatch[1],
          iconColor: "#FFFFFF"
        });
      }
    });
  }
  
  return benefits.length > 0 ? benefits : defaultBenefits;
};

const formatPrice = (price: string): string => {
  return parseInt(price).toLocaleString('vi-VN');
};

const PremiumPlanCard: React.FC<PremiumPlanCardProps> = ({ plan, onBuyPlan }) => {
  const { userProfile } = useUserProfile();
  // Check for subscription using the new structure
  const hasSubscription = !!userProfile?.subscription;
  const [isLoading, setIsLoading] = useState(false);
  
  // Get active subscription plan if available
  const subscribedPlan = userProfile?.subscription?.plan || userProfile?.subscription?.planDetails;
  const activePlan = subscribedPlan || plan;
  
  // Define gradient colors based on subscription status with proper typing
  const gradientColors: [string, string, string] = hasSubscription 
    ? ['#2196f3', '#00bcd4', '#00bcd4'] // Blue gradient for active subscribers
    : ['#f5f5f5', '#e0e0e0', '#e0e0e0']; // Gray gradient for non-subscribers
  
  // Text color based on subscription status
  const textColor = hasSubscription ? '#FFFFFF' : '#333333';
  
  // If no plan data is provided and no subscription plan, show loading
  if (!activePlan) {
    return (
      <LinearGradient
        colors={gradientColors}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <Text style={[styles.loadingText, {color: textColor}]}>Loading subscription plans...</Text>
        </View>
      </LinearGradient>
    );
  }
  
  const createPaymentLink = async () => {
    try {
      setIsLoading(true);
      
      // Get user data and access token
      const userDataString = await AsyncStorage.getItem("userData");
      const accessToken = await AsyncStorage.getItem("access_token");
      
      if (!userDataString || !accessToken) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để tiếp tục");
        return;
      }
      
      const userData = JSON.parse(userDataString);
      
      // Create request body
      const requestBody = {
        planId: activePlan.id,
        type: "thanh toán đầy đủ",
        userId: userData.id
      };
      
      // Log the request body for debugging
      console.log("Payment request body:", requestBody);
      
      // Get API URL from environment
      const apiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
      
      // Call API to create payment link
      const response = await axios.post(
        `${apiUrl}/subscriptions/create-payment-link`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      // Log response
      console.log("Payment link response:", response.data);
      
      // Handle successful response
      if (response.data && response.data.data && response.data.data.paymentLink) {
        // Open the payment link in a browser
        await Linking.openURL(response.data.data.paymentLink);
      } else {
        Alert.alert("Lỗi", "Không thể tạo đường dẫn thanh toán");
      }
    } catch (error) {
      console.error("Error creating payment link:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tạo đường dẫn thanh toán");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Extract benefits from description
  const benefits = extractBenefitsFromDescription(activePlan.description);
  const planName = activePlan.name;
  const planPriceMonth = formatPrice(activePlan.priceForMonth);
  const planPriceYear = formatPrice(activePlan.priceForYear);
  
  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.header}>
        <View style={[styles.planIcon, {backgroundColor: hasSubscription ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"}]}>
          <Ionicons name="airplane" size={24} color={textColor} />
        </View>
        <View style={styles.planInfo}>
          <Text style={[styles.planName, {color: textColor}]}>{planName}</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.planPrice, {color: textColor}]}>{planPriceMonth} đ</Text>
            <Text style={[styles.planPeriod, {color: textColor, opacity: 0.8}]}>/ tháng</Text>
          </View>
          <Text style={[styles.originalPrice, {color: textColor, opacity: 0.7}]}>
            Hoặc {planPriceYear} đ / năm <Text style={[styles.discountTag, {color: hasSubscription ? "#FFEB3B" : "#f6ac69"}]}>(tiết kiệm hơn)</Text>
          </Text>
        </View>
      </View>

      <View style={styles.benefitsContainer}>
        {benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <Ionicons
              name={benefit.icon}
              size={18}
              color={textColor}
              style={styles.benefitIcon}
            />
            <Text style={[styles.benefitText, {color: textColor}]}>{benefit.text}</Text>
          </View>
        ))}
      </View>

      {/* Hide lock container when user has subscription */}
      {!hasSubscription && (
        <View style={styles.lockContainer}>
          <Ionicons name="lock-closed" size={64} color="#AAA" style={styles.lockIcon} />
          <Text style={[styles.lockText, {color: textColor}]}>Mua gói để mở khóa ưu đãi!</Text>
        </View>
      )}

      {hasSubscription ? (
        <View style={styles.activeSubscriptionContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#FFF" />
          <Text style={styles.activeSubscriptionText}>Gói đang hoạt động</Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.buyButton, {backgroundColor: "#f6ac69"}]} 
          onPress={createPaymentLink}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buyButtonText}>Mua gói</Text>
          )}
        </TouchableOpacity>
      )}
      
      {hasSubscription && (
        <Text style={[styles.subscriptionFooter, {color: textColor}]}>
          Trở thành thành viên {planName} để nhận ưu đãi độc quyền và trải nghiệm dịch vụ tốt nhất!
        </Text>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
    width: "100%",
    padding: 20,
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  planPrice: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFF",
  },
  planPeriod: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.8,
    marginLeft: 4,
  },
  originalPrice: {
    fontSize: 12,
    color: "#FFF",
    opacity: 0.7,
    marginTop: 2,
  },
  discountTag: {
    color: "#FFEB3B",
    fontWeight: "600",
  },
  benefitsContainer: {
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  benefitIcon: {
    marginRight: 8,
  },
  benefitText: {
    fontSize: 14,
    color: "#FFF",
  },
  lockContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  lockIcon: {
    opacity: 0.9,
    marginBottom: 8,
  },
  lockText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    textAlign: "center",
  },
  buyButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
  },
  buyButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  activeSubscriptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
  activeSubscriptionText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
  subscriptionFooter: {
    fontSize: 12,
    color: "#FFF",
    textAlign: "center",
    marginTop: 16,
    opacity: 0.8,
    paddingHorizontal: 20,
    fontStyle: 'italic'
  }
});

export default PremiumPlanCard; 