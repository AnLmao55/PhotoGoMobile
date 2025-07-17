import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

// Define user profile data type
export interface UserProfileData {
  id?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  rank?: string;
}

// Define context type
interface UserProfileContextType {
  userProfile: UserProfileData | null;
  isLoading: boolean;
  error: string | null;
  updateUserProfile: (data: Partial<UserProfileData>) => void;
  refreshUserProfile: () => Promise<void>;
}

// Create context
const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

// Provider component
export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile data on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch user profile data from API
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userDataString = await AsyncStorage.getItem('userData');
      const accessToken = await AsyncStorage.getItem('access_token');
      
      if (!userDataString || !accessToken) {
        setIsLoading(false);
        return;
      }
      
      const userData = JSON.parse(userDataString);
      const userId = userData.id;
      
      if (!userId || userId === 'unknown') {
        setIsLoading(false);
        return;
      }
      
      const response = await axios.get(
        `${Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      const { data } = response.data;
      
      // Set user profile data
      setUserProfile({
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        avatarUrl: data.avatarUrl,
        rank: data.rank,
      });
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      setError('Failed to fetch user profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile data
  const updateUserProfile = (data: Partial<UserProfileData>) => {
    setUserProfile(prev => prev ? { ...prev, ...data } : data);
  };

  // Refresh user profile data
  const refreshUserProfile = async () => {
    await fetchUserProfile();
  };

  return (
    <UserProfileContext.Provider
      value={{
        userProfile,
        isLoading,
        error,
        updateUserProfile,
        refreshUserProfile,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

// Custom hook to use the user profile context
export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}; 