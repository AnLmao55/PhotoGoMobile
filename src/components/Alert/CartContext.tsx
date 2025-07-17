import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

type CartContextType = {
  cartItemCount: number;
  refreshCart: () => Promise<void>;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCartItemCount = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setCartItemCount(0);
        return;
      }
      
      // Get user data to extract cartId
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        setCartItemCount(0);
        return;
      }
      
      const userData = JSON.parse(userDataString);
      const { cartId } = userData;
      
      if (!cartId) {
        setCartItemCount(0);
        return;
      }
      
      const response = await axios.get(
        `https://api.photogo.id.vn/api/v1/carts/items/${cartId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.statusCode === 200) {
        setCartItemCount(response.data.data.data.length);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartItemCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCartItemCount();
    
    // Set up interval to refresh cart count periodically
    const intervalId = setInterval(fetchCartItemCount, 60000); // Every minute
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <CartContext.Provider 
      value={{ 
        cartItemCount,
        refreshCart: fetchCartItemCount,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
}; 