import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAlert } from '../components/Alert/AlertContext';

type ServiceConcept = {
  id: string;
  servicePackageId: string;
  name: string;
  description: string;
  price: string;
  duration: number;
  conceptRangeType: string;
  numberOfDays: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  images: string[];
};

type CartItem = {
  id: string;
  cartId: string;
  serviceConceptId: string;
  created_at: string;
  updated_at: string;
  serviceConcept: ServiceConcept;
};

type CartResponse = {
  statusCode: number;
  message: string;
  data: {
    data: CartItem[];
    pagination: {
      current: number;
      pageSize: number;
      totalPage: number;
      totalItem: number;
    };
  };
};

const CartScreen = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedItems, setSelectedItems] = useState<{[key: string]: boolean}>({});
  const navigation = useNavigation<any>();
  const { customAlert } = useAlert();

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        customAlert(
          'Thông báo',
          'Vui lòng đăng nhập để xem giỏ hàng',
          () => navigation.navigate('Login')
        );
        setIsLoading(false);
        return;
      }
      
      // Get user data to extract cartId
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        customAlert(
          'Thông báo',
          'Không tìm thấy thông tin người dùng',
          () => navigation.navigate('Login')
        );
        setIsLoading(false);
        return;
      }
      
      const userData = JSON.parse(userDataString);
      const { cartId } = userData;
      
      if (!cartId) {
        customAlert('Thông báo', 'Không tìm thấy giỏ hàng của bạn');
        setIsLoading(false);
        return;
      }
      
      const response = await axios.get<CartResponse>(
        `https://api.photogo.id.vn/api/v1/carts/items/${cartId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.statusCode === 200) {
        const items = response.data.data.data;
        setCartItems(items);
        
        // Initialize all items as selected
        const initialSelectedState: {[key: string]: boolean} = {};
        items.forEach(item => {
          initialSelectedState[item.id] = true;
        });
        setSelectedItems(initialSelectedState);
        
        // Calculate total price for all items
        calculateTotal(items, initialSelectedState);
      }
    } catch (error: any) {
      console.error('Error fetching cart items:', error);
      
      let errorMessage = 'Đã xảy ra lỗi khi tải giỏ hàng.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      customAlert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const calculateTotal = (items: CartItem[], selected: {[key: string]: boolean}) => {
    const total = items.reduce((sum, item) => {
      if (selected[item.id]) {
        return sum + parseFloat(item.serviceConcept.price);
      }
      return sum;
    }, 0);
    
    setTotalPrice(total);
  };

  const toggleItemSelection = (itemId: string) => {
    const updatedSelection = {
      ...selectedItems,
      [itemId]: !selectedItems[itemId]
    };
    
    setSelectedItems(updatedSelection);
    calculateTotal(cartItems, updatedSelection);
  };

  const toggleSelectAll = () => {
    const allSelected = cartItems.every(item => selectedItems[item.id]);
    const newState: {[key: string]: boolean} = {};
    
    cartItems.forEach(item => {
      newState[item.id] = !allSelected;
    });
    
    setSelectedItems(newState);
    calculateTotal(cartItems, newState);
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        customAlert('Thông báo', 'Phiên đăng nhập đã hết hạn');
        return;
      }
      
      // Get user data to extract cartId
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        customAlert('Thông báo', 'Không tìm thấy thông tin người dùng');
        return;
      }
      
      const userData = JSON.parse(userDataString);
      const { cartId } = userData;
      
      if (!cartId) {
        customAlert('Thông báo', 'Không tìm thấy giỏ hàng của bạn');
        return;
      }
      
      // Confirm before removing
      customAlert(
        'Xác nhận',
        'Bạn có chắc chắn muốn xóa dịch vụ này khỏi giỏ hàng?',
        async () => {
          setIsLoading(true);
          
          try {
            await axios.delete(
              `https://api.photogo.id.vn/api/v1/carts/${cartId}/items/${itemId}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            
            // Remove item locally
            const updatedItems = cartItems.filter(item => item.id !== itemId);
            setCartItems(updatedItems);
            
            // Recalculate total
            const newTotal = updatedItems.reduce((sum, item) => {
              return sum + parseFloat(item.serviceConcept.price);
            }, 0);
            
            setTotalPrice(newTotal);
            
            customAlert('Thành công', 'Đã xóa dịch vụ khỏi giỏ hàng');
          } catch (error: any) {
            console.error('Error removing item:', error);
            customAlert('Lỗi', 'Không thể xóa dịch vụ. Vui lòng thử lại sau.');
          } finally {
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error in handleRemoveItem:', error);
      customAlert('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
    }
  };

  const handleCheckout = () => {
    const selectedConcepts = cartItems.filter(item => selectedItems[item.id]);
    
    if (selectedConcepts.length === 0) {
      customAlert('Thông báo', 'Vui lòng chọn ít nhất một dịch vụ để đặt lịch');
      return;
    }
    
    // Navigate to booking screen with selected concepts
    navigation.navigate('Booking', { 
      fromCart: true,
      selectedConcepts: selectedConcepts.map(item => ({
        id: item.serviceConceptId,
        name: item.serviceConcept.name,
        price: item.serviceConcept.price
      }))
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCartItems();
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const renderEmptyCart = () => (
    <View style={styles.emptyCartContainer}>
      <Ionicons name="cart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyCartText}>Giỏ hàng của bạn đang trống</Text>
      <TouchableOpacity 
        style={styles.browseButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.browseButtonText}>Khám phá dịch vụ</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const concept = item.serviceConcept;
    const price = parseFloat(concept.price);
    const isSelected = selectedItems[item.id] || false;
    
    return (
      <View style={styles.cartItem}>
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => toggleItemSelection(item.id)}
        >
          <View style={[
            styles.checkbox,
            isSelected && styles.checkboxSelected
          ]}>
            {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
        </TouchableOpacity>
        
        <View style={styles.imageContainer}>
          {concept.images && concept.images.length > 0 ? (
            <Image 
              source={{ uri: concept.images[0] }} 
              style={styles.conceptImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={30} color="#ccc" />
            </View>
          )}
        </View>
        
        <View style={styles.itemDetails}>
          <Text style={styles.conceptName} numberOfLines={2}>{concept.name}</Text>
          
          <View style={styles.conceptInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{concept.duration} phút</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{concept.numberOfDays} ngày</Text>
            </View>
          </View>
          
          <Text style={styles.conceptPrice}>{price.toLocaleString()} đ</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Ionicons name="trash-outline" size={22} color="#FF4757" />
        </TouchableOpacity>
      </View>
    );
  };

  const hasSelectedItems = cartItems.some(item => selectedItems[item.id]);
  const allItemsSelected = cartItems.length > 0 && cartItems.every(item => selectedItems[item.id]);

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7F50" />
        </View>
      ) : (
        <>
          {cartItems.length > 0 && (
            <View style={styles.selectAllContainer}>
              <TouchableOpacity 
                style={styles.selectAllButton}
                onPress={toggleSelectAll}
              >
                <View style={[
                  styles.checkbox,
                  allItemsSelected && styles.checkboxSelected
                ]}>
                  {allItemsSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.selectAllText}>Chọn tất cả</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: cartItems.length > 0 ? 150 : 0 }
            ]}
            ListEmptyComponent={renderEmptyCart}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={['#FF7F50']}
              />
            }
          />
          
          {cartItems.length > 0 && (
            <View style={styles.checkoutContainer}>
              <View style={styles.totalContainer}>
                <View style={styles.selectedCountContainer}>
                  <Text style={styles.selectedCountText}>
                    Đã chọn: {Object.values(selectedItems).filter(Boolean).length}/{cartItems.length}
                  </Text>
                </View>
                <View>
                  <Text style={styles.totalLabel}>Tổng cộng:</Text>
                  <Text style={styles.totalPrice}>{totalPrice.toLocaleString()} đ</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.checkoutButton,
                  !hasSelectedItems && styles.checkoutButtonDisabled
                ]}
                onPress={handleCheckout}
                disabled={!hasSelectedItems}
              >
                <Text style={styles.checkoutButtonText}>Đặt lịch</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.checkoutIcon} />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 16,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#f6ac69',
    borderColor: '#f6ac69',
  },
  checkboxContainer: {
    justifyContent: 'center',
    marginRight: 12,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#FF7F50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  conceptImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  conceptName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  conceptInfo: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  conceptPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f6ac69',
  },
  removeButton: {
    padding: 8,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 90, // Position above the tab bar
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedCountContainer: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedCountText: {
    fontSize: 14,
    color: '#666',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f6ac69',
    textAlign: 'right',
  },
  checkoutButton: {
    backgroundColor: '#f6ac69',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#ccc',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutIcon: {
    marginLeft: 8,
  },
});

export default CartScreen;
