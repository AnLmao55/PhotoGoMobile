import AsyncStorage from '@react-native-async-storage/async-storage';

// Interface cho user data
export interface UserData {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  username?: string;
  email_verified?: boolean;
  loginMethod: 'google' | 'normal';
  loginTime: string;
}

// Lấy thông tin user từ AsyncStorage
export const getUserData = async (): Promise<UserData | null> => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Kiểm tra trạng thái đăng nhập
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const loginStatus = await AsyncStorage.getItem('isLoggedIn');
    return loginStatus === 'true';
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

// Đăng xuất
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      'isLoggedIn',
      'userData',
      'userToken',
      'loginMethod',
    ]);
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

// Lấy token
export const getUserToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
};

// Cập nhật thông tin user
export const updateUserData = async (newData: Partial<UserData>): Promise<void> => {
  try {
    const currentData = await getUserData();
    if (currentData) {
      const updatedData = { ...currentData, ...newData };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};