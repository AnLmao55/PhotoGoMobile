import axios from 'axios';
import Constants from 'expo-constants';
import { axiosPrivate } from '../config/config';

// Define the subscription plan type
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceForMonth: string;
  priceForYear: string;
  isActive: boolean;
  planType: string;
  billingCycle: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlansResponse {
  data: SubscriptionPlan[];
  pagination: {
    current: number;
    pageSize: number;
    totalPage: number;
    totalItem: number;
  };
}

// Get all subscription plans
export const getSubscriptionPlans = async (): Promise<SubscriptionPlansResponse> => {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;
    const response = await axios.get(
      `${apiUrl}/subscription-plans?current=1&pageSize=10&sortBy=createdAt&sortDirection=DESC&isActive=true&planType=ng%C6%B0%E1%BB%9Di%20d%C3%B9ng`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};

// Get user subscription details
export const getUserSubscription = async (userId: string): Promise<any> => {
  try {
    const response = await axiosPrivate.get(`/users/${userId}/subscription`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    throw error;
  }
};

// Subscribe to a plan
export const subscribeToPlan = async (planId: string): Promise<any> => {
  try {
    const response = await axiosPrivate.post(`/subscriptions`, {
      planId,
    });
    return response.data;
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    throw error;
  }
}; 