import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MenuOption {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

interface SideMenuOptionsProps {
  selectedOption?: string;
  onOptionSelect: (key: string) => void;
}

const SideMenuOptions: React.FC<SideMenuOptionsProps> = ({
  selectedOption,
  onOptionSelect,
}) => {
  const menuOptions: MenuOption[] = [
    {
      key: "upcoming-workshops",
      label: "Lịch sắp tới",
      icon: "calendar-outline",
      onPress: () => onOptionSelect("orders"),
    },
    {
      key: "orders",
      label: "Đơn hàng",
      icon: "receipt-outline",
      onPress: () => onOptionSelect("orders"),
    },
    {
      key: "discount",
      label: "Mã ưu đãi",
      icon: "ticket-outline",
      onPress: () => onOptionSelect("discount"),
    },
    {
      key: "points",
      label: "Điểm tích lũy",
      icon: "star-outline",
      onPress: () => onOptionSelect("points"),
    },
    // {
    //   key: "rewards",
    //   label: "PhotoGo Rewards",
    //   icon: "gift-outline",
    //   onPress: () => onOptionSelect("rewards"),
    // },
    // {
    //   key: "attendance",
    //   label: "Điểm danh",
    //   icon: "calendar-outline",
    //   onPress: () => onOptionSelect("attendance"),
    // },
    
    {
      key: "reviews",
      label: "Đánh giá",
      icon: "star-half-outline",
      onPress: () => onOptionSelect("reviews"),
    },
    // {
    //   key: "favorites",
    //   label: "Yêu thích",
    //   icon: "heart-outline",
    //   onPress: () => onOptionSelect("favorites"),
    // },
    {
      key: "password",
      label: "Thay đổi mật khẩu",
      icon: "lock-closed-outline",
      onPress: () => onOptionSelect("password"),
    },
  ];

  return (
    <View style={styles.container}>
      {menuOptions.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.menuItem,
            selectedOption === option.key && styles.selectedMenuItem,
          ]}
          onPress={option.onPress}
        >
          <View style={styles.menuItemContent}>
            <Ionicons
              name={option.icon}
              size={20}
              color={selectedOption === option.key ? "#F8B26A" : "#555"}
            />
            <Text
              style={[
                styles.menuItemText,
                selectedOption === option.key && styles.selectedMenuItemText,
              ]}
            >
              {option.label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 16,
    marginLeft: 16,
    width: "90%",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  selectedMenuItem: {
    backgroundColor: "#FEF4EA",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#333",
  },
  selectedMenuItemText: {
    color: "#F8B26A",
    fontWeight: "600",
  },
});

export default SideMenuOptions; 