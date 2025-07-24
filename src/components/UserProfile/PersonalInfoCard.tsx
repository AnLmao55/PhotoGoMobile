import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PersonalInfoCardProps {
  fullName: string;
  phone: string;
  email: string;
  registrationDate?: string;
  onEdit?: () => void;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  fullName,
  phone,
  email,
  registrationDate,
  onEdit,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
        
        {onEdit && (
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Ionicons name="pencil" size={18} color="#F8B26A" />
            <Text style={styles.editText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.infoRow}>
        <View style={styles.infoLabelContainer}>
          <Text style={styles.infoLabel}>Họ và tên</Text>
        </View>
        <View style={styles.infoValueContainer}>
          <Text style={styles.infoValue}>{fullName}</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <View style={styles.infoLabelContainer}>
          <Text style={styles.infoLabel}>Số điện thoại</Text>
        </View>
        <View style={styles.infoValueContainer}>
          <Text style={styles.infoValue}>{phone}</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <View style={styles.infoLabelContainer}>
          <Text style={styles.infoLabel}>Email</Text>
        </View>
        <View style={styles.infoValueContainer}>
          <Text style={styles.infoValue}>{email}</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <View style={styles.infoLabelContainer}>
          <Text style={styles.infoLabel}>Ngày tham gia</Text>
        </View>
        <View style={styles.infoValueContainer}>
          <Text style={styles.infoValue}>{registrationDate || "14/7/2025"}</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <View style={styles.infoLabelContainer}>
          <Text style={styles.infoLabel}>Gói đăng ký</Text>
        </View>
        <View style={styles.infoValueContainer}>
          <Text style={styles.infoValue}>Chưa mua gói</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: -10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF0E6",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  editText: {
    fontSize: 14,
    color: "#F8B26A",
    fontWeight: "500",
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  infoLabelContainer: {
    flex: 1,
  },
  infoValueContainer: {
    flex: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
});

export default PersonalInfoCard;
