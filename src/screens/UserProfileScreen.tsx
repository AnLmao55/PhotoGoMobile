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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import { StackNavigationProp } from '@react-navigation/stack';

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

// Define the navigation param list
type RootStackParamList = {
  Login: undefined;
  // Add other screens as needed
};

const UserProfileScreen: React.FC = () => {

  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { userProfile, isLoading, error, refreshUserProfile } = useUserProfile();

  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    oldPasswordHash: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();


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
    setEditFormData({
      fullName: userData.fullName || "",
      phoneNumber: userData.phoneNumber || "",
      email: userData.email || "",
      password: "",
      confirmPassword: "",
      oldPasswordHash: "",
    });
    setIsEditModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    try {
      // Validate form data
      if (!editFormData.fullName || !editFormData.phoneNumber || !editFormData.email) {
        Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin họ tên, số điện thoại và email.");
        return;
      }

      // If changing password, validate password fields
      if (editFormData.password || editFormData.confirmPassword || editFormData.oldPasswordHash) {
        if (!editFormData.password || !editFormData.confirmPassword || !editFormData.oldPasswordHash) {
          Alert.alert("Lỗi", "Để thay đổi mật khẩu, vui lòng điền đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu.");
          return;
        }

        if (editFormData.password !== editFormData.confirmPassword) {
          Alert.alert("Lỗi", "Mật khẩu mới và xác nhận mật khẩu không khớp.");
          return;
        }
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
        password: null,
        confirmPassword: editFormData.confirmPassword || undefined,
        oldPasswordHash: editFormData.oldPasswordHash || undefined,
      };

      // Log the request details
      console.log('API Request URL:', `${Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL}/api/v1/users/${userId}`);
      console.log('Request Headers:', {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      });
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));

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

      // Log the response
      console.log('API Response Status:', response.status);
      console.log('API Response Data:', JSON.stringify(response.data, null, 2));

      // If successful, update the local userData and close modal
      if (response.status === 200) {
        Alert.alert("Thành công", "Cập nhật thông tin thành công!");
        setIsEditModalVisible(false);
        fetchUserData(); // Refresh user data
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

            fullName={userData.fullName || "User"}
            phone={userData.phoneNumber || ""}
            email={userData.email || ""}
            onEdit={handleEditProfile}

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
                
                <Text style={styles.sectionTitle}>Thay đổi mật khẩu</Text>
                
                <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.oldPasswordHash}
                  onChangeText={(text) => setEditFormData({...editFormData, oldPasswordHash: text})}
                  placeholder="Mật khẩu hiện tại"
                  secureTextEntry={!showPassword}
                />
                
                <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.password}
                  onChangeText={(text) => setEditFormData({...editFormData, password: text})}
                  placeholder="Mật khẩu mới"
                  secureTextEntry={!showPassword}
                />
                
                <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.confirmPassword}
                  onChangeText={(text) => setEditFormData({...editFormData, confirmPassword: text})}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
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
