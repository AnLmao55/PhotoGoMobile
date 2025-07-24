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
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";

import UserProfileCard from "../components/UserProfile/UserProfileCard";
import PersonalInfoCard from "../components/UserProfile/PersonalInfoCard";
import SideMenuOptions from "../components/UserProfile/SideMenuOptions";
import PremiumPlanCard from "../components/UserProfile/PremiumPlanCard";
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

// Menu option type
interface MenuOption {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { userProfile, isLoading: profileLoading, error, refreshUserProfile } = useUserProfile();

  const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
  });
  
  const [passwordFormData, setPasswordFormData] = useState({
    oldPasswordHash: "",
    password: "",
    confirmPassword: "",
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Define menu options
  const menuOptions: MenuOption[] = [
    { key: "discount", label: "Mã ưu đãi", icon: "ticket-outline" },
    { key: "points", label: "Điểm tích lũy", icon: "star-outline" },
    { key: "rewards", label: "PhotoGo Rewards", icon: "gift-outline" },
    { key: "attendance", label: "Điểm danh", icon: "calendar-outline" },
    { key: "orders", label: "Đơn hàng", icon: "receipt-outline" },
    { key: "reviews", label: "Đánh giá", icon: "star-half-outline" },
    // { key: "favorites", label: "Yêu thích", icon: "heart-outline" },
    { key: "password", label: "Thay đổi mật khẩu", icon: "lock-closed-outline" },
  ];

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

  const handleEditProfile = () => {
    // Initialize form data with current user data
    if (userProfile) {
      setEditFormData({
        fullName: userProfile.fullName || "",
        phoneNumber: userProfile.phoneNumber || "",
        email: userProfile.email || "",
      });
    }
    setIsEditModalVisible(true);
  };

  const handleShowPasswordModal = () => {
    setPasswordFormData({
      oldPasswordHash: "",
      password: "",
      confirmPassword: "",
    });
    setIsPasswordModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    try {
      // Validate form data
      if (!editFormData.fullName || !editFormData.phoneNumber || !editFormData.email) {
        Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin họ tên, số điện thoại và email.");
        return;
      }

      setIsUpdating(true);
      const accessToken = await AsyncStorage.getItem("access_token");
      const userDataString = await AsyncStorage.getItem("userData");

      if (!userDataString || !accessToken) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.");
        return;
      }

      const user = JSON.parse(userDataString);
      const userId = user.id;

      if (!userId) {
        Alert.alert("Lỗi", "Không tìm thấy ID người dùng.");
        return;
      }

      // Prepare request body
      const requestBody = {
        email: editFormData.email,
        fullName: editFormData.fullName,
        phoneNumber: editFormData.phoneNumber,
      };

      // Make PUT request to update user profile
      const response = await axios.put(
        `${Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL}/users/${userId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // If successful, update the local userData and close modal
      if (response.status === 200) {
        Alert.alert("Thành công", "Cập nhật thông tin thành công!");
        setIsEditModalVisible(false);
        refreshUserProfile();
      }
    } catch (error: any) {
      console.error("Error updating user data:", error);
      let errorMessage = "Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại.";

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
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      // Validate form data
      if (!passwordFormData.oldPasswordHash || !passwordFormData.password || !passwordFormData.confirmPassword) {
        Alert.alert("Lỗi", "Vui lòng điền đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu.");
        return;
      }

      if (passwordFormData.password !== passwordFormData.confirmPassword) {
        Alert.alert("Lỗi", "Mật khẩu mới và xác nhận mật khẩu không khớp.");
        return;
      }

      setIsChangingPassword(true);
      const accessToken = await AsyncStorage.getItem("access_token");
      const userDataString = await AsyncStorage.getItem("userData");

      if (!userDataString || !accessToken) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.");
        return;
      }

      const user = JSON.parse(userDataString);
      const userId = user.id;

      if (!userId) {
        Alert.alert("Lỗi", "Không tìm thấy ID người dùng.");
        return;
      }

      // Prepare request body
      const requestBody = {
        oldPasswordHash: passwordFormData.oldPasswordHash,
        password: passwordFormData.password,
        confirmPassword: passwordFormData.confirmPassword,
      };

      // Make PUT request to update password
      const response = await axios.put(
        `${Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL}/users/${userId}/change-password`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // If successful, close modal
      if (response.status === 200) {
        Alert.alert("Thành công", "Thay đổi mật khẩu thành công!");
        setIsPasswordModalVisible(false);
      }
    } catch (error: any) {
      console.error("Error updating password:", error);
      let errorMessage = "Đã xảy ra lỗi khi thay đổi mật khẩu. Vui lòng thử lại.";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Mật khẩu cũ không đúng hoặc phiên đăng nhập hết hạn.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleBuyPlan = () => {
    Alert.alert("Mua gói", "Tính năng đang được phát triển!");
  };

  const handleOptionSelect = (key: string) => {
    setSelectedOption(key);
    
    // Handle actions for each menu option
    switch (key) {
      case "orders":
        navigation.navigate("MyOrder");
        break;
      case "password":
        handleShowPasswordModal();
        break;
      default:
        Alert.alert("Thông báo", "Tính năng đang được phát triển");
        break;
    }
  };

  // Render a menu option item for the horizontal slider
  const renderMenuItem = ({ item }: { item: MenuOption }) => {
    const isSelected = selectedOption === item.key;
    
    return (
      <TouchableOpacity
        style={[
          styles.menuItem,
          isSelected && styles.selectedMenuItem,
        ]}
        onPress={() => handleOptionSelect(item.key)}
      >
        <View style={styles.menuItemContent}>
          <Ionicons
            name={item.icon}
            size={24}
            color={isSelected ? "#F8B26A" : "#555"}
            style={styles.menuItemIcon}
          />
          <Text
            style={[
              styles.menuItemText,
              isSelected && styles.selectedMenuItemText,
            ]}
          >
            {item.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (profileLoading) {
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Profile Card (Blue Header) */}
        <UserProfileCard
          name={userProfile.fullName || "User"}
          email={userProfile.email || ""}
          avatarUrl={userProfile.avatarUrl || ""}
          onUpdateProfile={handleEditProfile}
        />
        
        {/* Menu Options Horizontal Slider */}
        <View style={styles.menuSliderContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={menuOptions}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.menuSliderContent}
          />
        </View>
        
        {/* Personal Info Card */}
        <PersonalInfoCard
          fullName={userProfile.fullName || "User"}
          phone={userProfile.phoneNumber || ""}
          email={userProfile.email || ""}
          registrationDate="14/7/2025"
          onEdit={handleEditProfile}
        />
        
        {/* Premium Plan Card */}
        <PremiumPlanCard onBuyPlan={handleBuyPlan} />
        
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF4757" />
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
        
        {/* Edit Profile Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isEditModalVisible}
          onRequestClose={() => setIsEditModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.scrollModalContent}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
                
                <Text style={styles.inputLabel}>Họ và tên</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.fullName}
                  onChangeText={(text) => setEditFormData({...editFormData, fullName: text})}
                  placeholder="Họ và tên"
                />
                
                <Text style={styles.inputLabel}>Số điện thoại</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.phoneNumber}
                  onChangeText={(text) => setEditFormData({...editFormData, phoneNumber: text})}
                  placeholder="Số điện thoại"
                  keyboardType="phone-pad"
                />
                
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.email}
                  onChangeText={(text) => setEditFormData({...editFormData, email: text})}
                  placeholder="Email"
                  keyboardType="email-address"
                  editable={false} // Usually email shouldn't be editable
                />
                
                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]} 
                    onPress={() => setIsEditModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.saveButton, isUpdating && styles.disabledButton]} 
                    onPress={handleUpdateProfile}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>Lưu</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Change Password Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isPasswordModalVisible}
          onRequestClose={() => setIsPasswordModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.scrollModalContent}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Thay đổi mật khẩu</Text>
                
                <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
                <TextInput
                  style={styles.input}
                  value={passwordFormData.oldPasswordHash}
                  onChangeText={(text) => setPasswordFormData({...passwordFormData, oldPasswordHash: text})}
                  placeholder="Mật khẩu hiện tại"
                  secureTextEntry={!showPassword}
                />
                
                <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                <TextInput
                  style={styles.input}
                  value={passwordFormData.password}
                  onChangeText={(text) => setPasswordFormData({...passwordFormData, password: text})}
                  placeholder="Mật khẩu mới"
                  secureTextEntry={!showPassword}
                />
                
                <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
                <TextInput
                  style={styles.input}
                  value={passwordFormData.confirmPassword}
                  onChangeText={(text) => setPasswordFormData({...passwordFormData, confirmPassword: text})}
                  placeholder="Xác nhận mật khẩu mới"
                  secureTextEntry={!showPassword}
                />
                
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.passwordToggleText}>
                    {showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]} 
                    onPress={() => setIsPasswordModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.saveButton, isChangingPassword && styles.disabledButton]} 
                    onPress={handleChangePassword}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>Đổi mật khẩu</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  // Menu slider styles
  menuSliderContainer: {
    marginVertical: 16,
  },
  menuSliderContent: {
    paddingHorizontal: 16,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedMenuItem: {
    backgroundColor: '#FEF4EA',
    borderColor: '#F8B26A',
    borderWidth: 1,
  },
  menuItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemIcon: {
    marginBottom: 6,
  },
  menuItemText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  selectedMenuItemText: {
    color: '#F8B26A',
    fontWeight: '600',
  },
  // Logout button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FFF0F0',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFDDDD',
    marginBottom: 100,
  },
  logoutButtonText: {
    color: '#FF4757',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
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
  
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  scrollModalContent: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 40,
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  passwordToggle: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  passwordToggleText: {
    fontSize: 14,
    color: '#007bff',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '45%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#F8B26A',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default UserProfileScreen;
