import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PlanBenefit {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  iconColor?: string;
}

interface PremiumPlanCardProps {
  planName?: string;
  planPrice?: string;
  planPeriod?: string;
  originalPrice?: string;
  benefits?: PlanBenefit[];
  onBuyPlan?: () => void;
}

const defaultBenefits: PlanBenefit[] = [
  { icon: "ticket", text: "Giảm giá 10% trên tổng đơn hàng", iconColor: "#F8B26A" },
  { icon: "gift", text: "Ưu đãi giá 10%", iconColor: "#F8B26A" },
  { icon: "flash", text: "Free nhất booking", iconColor: "#F8B26A" },
  { icon: "calendar", text: "Ưu tiên lịch đặt workshop", iconColor: "#F8B26A" },
];

const PremiumPlanCard: React.FC<PremiumPlanCardProps> = ({
  planName = "Gói Ultimated",
  planPrice = "29.000",
  planPeriod = "tháng",
  originalPrice = "49.000",
  benefits = defaultBenefits,
  onBuyPlan = () => console.log("Buy plan clicked"),
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.planIcon}>
          <Ionicons name="airplane" size={24} color="#F8B26A" />
        </View>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{planName}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.planPrice}>{planPrice} đ</Text>
            <Text style={styles.planPeriod}>/ {planPeriod}</Text>
          </View>
          {originalPrice && (
            <Text style={styles.originalPrice}>Thay vì {originalPrice} đ / tháng</Text>
          )}
        </View>
      </View>

      <View style={styles.benefitsContainer}>
        {benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <Ionicons
              name={benefit.icon}
              size={18}
              color={benefit.iconColor || "#F8B26A"}
              style={styles.benefitIcon}
            />
            <Text style={styles.benefitText}>{benefit.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.lockContainer}>
        <Ionicons name="lock-closed" size={64} color="#FFF" style={styles.lockIcon} />
        <Text style={styles.lockText}>Mua gói để mở khóa ưu đãi!</Text>
      </View>

      <TouchableOpacity style={styles.buyButton} onPress={onBuyPlan}>
        <Text style={styles.buyButtonText}>Mua gói</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#888",
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
    textDecorationLine: "line-through",
    marginTop: 2,
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
    backgroundColor: "#F8B26A",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buyButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default PremiumPlanCard; 