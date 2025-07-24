import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { getSubscriptionPlans, getUserSubscription, SubscriptionPlan } from '../services/subscriptionService';

// Define user profile data type
export interface UserProfileData {
  id?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  rank?: string;
  subscriptionId?: string;
  createdAt?: string;
  subscription?: {
    id: string;
    planId: string;
    userId: string;
    startDate: string;
    endDate: string;
    status: string;
    planDetails?: SubscriptionPlan;
    plan?: SubscriptionPlan; // Add plan field for new API response format
  };
}

// Define context type
interface UserProfileContextType {
  userProfile: UserProfileData | null;
  isLoading: boolean;
  error: string | null;
  subscriptionPlans: SubscriptionPlan[];
  isLoadingPlans: boolean;
  updateUserProfile: (data: Partial<UserProfileData>) => void;
  refreshUserProfile: () => Promise<void>;
  subscribeToPlan: (planId: string) => Promise<void>;
}

// Create context
const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

// Provider component
export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(true);

  // Fetch user profile data on mount
  useEffect(() => {
    fetchUserProfile();
    fetchSubscriptionPlans();
  }, []);

  // Fetch subscription plans
  const fetchSubscriptionPlans = async () => {
    try {
      setIsLoadingPlans(true);
      const response = await getSubscriptionPlans();
      setSubscriptionPlans(response.data);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    } finally {
      setIsLoadingPlans(false);
    }
  };

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
      const profileData: UserProfileData = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        avatarUrl: data.avatarUrl,
        rank: data.rank,
        subscriptionId: data.subscriptionId,
        createdAt: data.createdAt,
      };

      // If the API directly returns a subscription in the response, use it
      if (data.subscription) {
        profileData.subscription = data.subscription;
        setUserProfile(profileData);
      } else {
        // Otherwise, set the profile and then try to fetch subscription details separately
        setUserProfile(profileData);

        // If user has a subscription ID but no subscription data, fetch subscription details
        if (data.subscriptionId) {
          try {
            const subscriptionData = await getUserSubscription(userId);
            if (subscriptionData) {
              setUserProfile(prev => ({
                ...prev!,
                subscription: subscriptionData,
              }));
            }
          } catch (subscriptionError) {
            console.error('Error fetching subscription details:', subscriptionError);
          }
        }
      }
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
    await fetchSubscriptionPlans();
  };

  // Subscribe to a plan
  const subscribeToPlan = async (planId: string) => {
    try {
      const response = await axios.post(
        `${Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL}/subscriptions`,
        { planId },
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('access_token')}`,
          },
        }
      );
      
      if (response.data.success) {
        await refreshUserProfile();
      }
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      throw error;
    }
  };

  return (
    <UserProfileContext.Provider
      value={{
        userProfile,
        isLoading,
        error,
        subscriptionPlans,
        isLoadingPlans,
        updateUserProfile,
        refreshUserProfile,
        subscribeToPlan,
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