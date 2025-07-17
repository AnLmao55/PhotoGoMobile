import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import RenderHtml from 'react-native-render-html';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAlert } from '../components/Alert/AlertContext';

const { width } = Dimensions.get('window');

type ServiceConcept = {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  duration: number;
  conceptRangeType: string;
  numberOfDays: number;
  serviceTypes: { id: string; name: string; description: string }[];
};

type ServicePackage = {
  id: string;
  name: string;
  description: string;
  image?: string;
  serviceConcepts: ServiceConcept[];
};

type UserData = {
  id: string;
  cartId: string;
  email: string;
  name: string;
  // Other user properties
};

const ConceptViewer = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { servicePackage, studioName } = route.params as { 
    servicePackage: ServicePackage;
    studioName: string;
  };
  const { customAlert } = useAlert();
  
  const [selectedConceptIndex, setSelectedConceptIndex] = useState(0);
  const [isConceptListVisible, setIsConceptListVisible] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({});
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const listHeightAnim = React.useRef(new Animated.Value(0)).current;
  const descriptionHeightAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Fetch user data from AsyncStorage
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const parsedData = JSON.parse(userDataString);
          setUserData(parsedData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);
  
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: servicePackage.name,
      headerTitleStyle: { fontSize: 18 },
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.studioNameHeader}>{studioName}</Text>
          <TouchableOpacity 
            style={{ padding: 8 }}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Giỏ hàng' })}
          >
            <Ionicons name="cart-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, servicePackage.name, studioName]);

  const handleSelectConcept = (index: number) => {
    setSelectedConceptIndex(index);
    setIsDescriptionExpanded(false); // Reset description expansion when changing concepts
    descriptionHeightAnim.setValue(0);
  };
  
  const toggleConceptList = () => {
    const toValue = isConceptListVisible ? 0 : 1;
    Animated.timing(listHeightAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsConceptListVisible(!isConceptListVisible);
  };

  const toggleDescription = () => {
    const toValue = isDescriptionExpanded ? 0 : 1;
    Animated.timing(descriptionHeightAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };
  
  const toggleFavorite = (conceptId: string) => {
    setFavorites(prev => ({
      ...prev,
      [conceptId]: !prev[conceptId]
    }));
  };
  
  const handleAddToCart = async () => {
    if (!userData) {
      customAlert(
        'Thông báo',
        'Vui lòng đăng nhập để thêm vào giỏ hàng',
        () => navigation.navigate('Login')
      );
      return;
    }
    
    const concept = servicePackage.serviceConcepts[selectedConceptIndex];
    setIsAddingToCart(true);
    
    try {
      // Get token from storage
      const token = await AsyncStorage.getItem('access_token');
      
      // Make sure we have a cartId
      if (!userData.cartId) {
        customAlert('Thông báo', 'Không tìm thấy giỏ hàng của bạn');
        setIsAddingToCart(false);
        return;
      }
      
      // Send POST request to add item to cart
      const response = await axios.post(
        `https://api.photogo.id.vn/api/v1/carts/${userData.id}/${userData.cartId}/${concept.id}/items`,
        {},  // Empty body, as per REST convention
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.status === 200 || response.status === 201) {
        customAlert(
          'Thành công',
          `Đã thêm "${concept.name}" vào giỏ hàng`,
          () => {
            // Navigate to the Cart tab
            navigation.navigate('MainTabs', { screen: 'Giỏ hàng' });
          }
        );
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      
      let errorMessage = 'Đã xảy ra lỗi khi thêm vào giỏ hàng.';
      if (error.response) {
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      customAlert('Lỗi', errorMessage);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const renderConceptItem = (concept: ServiceConcept, index: number) => {
    const isSelected = selectedConceptIndex === index;
    const isFavorite = favorites[concept.id] || false;
    
    return (
      <TouchableOpacity
        key={concept.id}
        style={[
          styles.conceptListItem,
          isSelected && styles.conceptListItemSelected
        ]}
        onPress={() => handleSelectConcept(index)}
      >
        <View style={styles.conceptItemContent}>
          <View style={styles.conceptItemImageContainer}>
            {concept.images && concept.images.length > 0 ? (
              <Image
                source={{ uri: concept.images[0] }}
                style={styles.conceptListItemImage}
              />
            ) : (
              <View style={styles.conceptListItemImagePlaceholder}>
                <Ionicons name="image-outline" size={24} color="#ccc" />
              </View>
            )}
            <TouchableOpacity 
              style={styles.favoriteIconSmall}
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(concept.id);
              }}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={16} 
                color={isFavorite ? "#FF4757" : "#fff"} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.conceptItemDetails}>
            <Text style={styles.conceptItemName} numberOfLines={1}>
              {concept.name}
            </Text>
            <Text style={styles.conceptItemPrice}>
              {Number(concept.price).toLocaleString()} đ
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSelectedConcept = () => {
    if (!servicePackage.serviceConcepts || servicePackage.serviceConcepts.length === 0) {
      return (
        <View style={styles.noConceptContainer}>
          <Text>Không có concept nào trong gói dịch vụ này.</Text>
        </View>
      );
    }

    const concept = servicePackage.serviceConcepts[selectedConceptIndex];
    const isFavorite = favorites[concept.id] || false;
    
    const descriptionMaxHeight = descriptionHeightAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 1000] // From collapsed height to expanded height
    });
    
    return (
      <View style={styles.selectedConceptContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.selectedConceptTitle}>{concept.name}</Text>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(concept.id)}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#FF4757" : "#666"} 
            />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          style={styles.imageGallery}
        >
          {concept.images?.map((imgUrl) => (
            <Image
              key={imgUrl}
              source={{ uri: imgUrl }}
              style={styles.conceptDetailImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
        
        <ScrollView style={styles.conceptDetailsScroll}>
          <View style={styles.descriptionWrapper}>
            <Animated.View style={[
              styles.descriptionContainer, 
              { maxHeight: descriptionMaxHeight, overflow: 'hidden' }
            ]}>
              <RenderHtml
                contentWidth={width - 32}
                source={{ html: concept.description }}
                tagsStyles={{
                  p: styles.htmlParagraph,
                  strong: styles.htmlBold,
                  em: styles.htmlItalic,
                  ul: styles.htmlList,
                  li: styles.htmlListItem,
                  h1: styles.htmlH1,
                  h2: styles.htmlH2,
                  h3: styles.htmlH3,
                }}
              />
            </Animated.View>
            
            <TouchableOpacity 
              style={styles.showMoreButton} 
              onPress={toggleDescription}
            >
              <Text style={styles.showMoreText}>
                {isDescriptionExpanded ? 'Thu gọn' : 'Xem thêm'}
              </Text>
              <Ionicons 
                name={isDescriptionExpanded ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color="#FF7F50" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Ionicons name="pricetag" size={18} color="#FF7F50" />
              <Text style={styles.infoLabel}>
                Giá: <Text style={styles.infoValue}>{Number(concept.price).toLocaleString()} đ</Text>
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="time" size={18} color="#FF7F50" />
              <Text style={styles.infoLabel}>
                Thời lượng: <Text style={styles.infoValue}>{concept.duration} phút ({concept.conceptRangeType})</Text>
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={18} color="#FF7F50" />
              <Text style={styles.infoLabel}>
                Số ngày: <Text style={styles.infoValue}>{concept.numberOfDays}</Text>
              </Text>
            </View>
          </View>

          {concept.serviceTypes?.length > 0 && (
            <View style={styles.serviceTypesContainer}>
              <Text style={styles.serviceTypesTitle}>Phong cách:</Text>
              {concept.serviceTypes.map((type) => (
                <View key={type.id} style={styles.serviceTypeItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#FF7F50" />
                  <View style={styles.serviceTypeText}>
                    <Text style={styles.serviceTypeName}>{type.name}</Text>
                    <Text style={styles.serviceTypeDesc}>{type.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.bookingButton, styles.primaryButton]}
              onPress={() => navigation.navigate('Booking')}
            >
              <Text style={styles.bookingButtonText}>Đặt lịch</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.cartButton, styles.secondaryButton]}
              onPress={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="cart" size={18} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.cartButtonText}>Thêm vào giỏ hàng</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  const listContainerHeight = listHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 140]
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.mainContent}>
          {renderSelectedConcept()}
        </View>
        
        {servicePackage.serviceConcepts?.length > 1 && (
          <>
            <TouchableOpacity 
              style={styles.conceptListToggle}
              onPress={toggleConceptList}
              activeOpacity={0.7}
            >
              <Text style={styles.conceptListTitle}>
                Danh sách concept ({servicePackage.serviceConcepts.length})
              </Text>
              <Ionicons 
                name={isConceptListVisible ? "chevron-down" : "chevron-up"} 
                size={18} 
                color="#444" 
              />
            </TouchableOpacity>
            
            <Animated.View 
              style={[
                styles.conceptListContainer,
                { height: listContainerHeight, overflow: 'hidden' }
              ]}
            >
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.conceptList}
              >
                {servicePackage.serviceConcepts.map(renderConceptItem)}
              </ScrollView>
            </Animated.View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  studioNameHeader: {
    color: '#FF7F50',
    fontSize: 14,
    marginRight: 12,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
  },
  noConceptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedConceptContainer: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 12,
    position: 'relative',
  },
  selectedConceptTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    flex: 1,
  },
  favoriteButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  imageGallery: {
    maxHeight: width * 0.7,
    marginBottom: 16,
  },
  conceptDetailImage: {
    width: width - 32,
    height: width * 0.7,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  conceptDetailsScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  descriptionWrapper: {
    marginBottom: 20,
  },
  descriptionContainer: {
    marginBottom: 5,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  showMoreText: {
    color: '#FF7F50',
    marginRight: 5,
    fontWeight: '600',
  },
  conceptDescription: {
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  infoBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 15,
    marginLeft: 8,
    color: '#444',
  },
  infoValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  serviceTypesContainer: {
    marginBottom: 24,
  },
  serviceTypesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  serviceTypeItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 5,
  },
  serviceTypeText: {
    marginLeft: 8,
    flex: 1,
  },
  serviceTypeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  serviceTypeDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  buttonContainer: {
    marginBottom: 30,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#FF7F50',
  },
  secondaryButton: {
    backgroundColor: '#666',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cartButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bookingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  conceptListToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    backgroundColor: '#fff',
  },
  conceptListContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  conceptListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  conceptList: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  conceptListItem: {
    width: 120,
    marginRight: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    overflow: 'hidden',
  },
  conceptListItemSelected: {
    borderColor: '#FF7F50',
    backgroundColor: 'rgba(255, 127, 80, 0.05)',
  },
  conceptItemContent: {
    width: '100%',
  },
  conceptItemImageContainer: {
    width: '100%',
    height: 90,
    position: 'relative',
  },
  conceptListItemImage: {
    width: '100%',
    height: '100%',
  },
  conceptListItemImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIconSmall: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 4,
  },
  conceptItemDetails: {
    padding: 8,
  },
  conceptItemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  conceptItemPrice: {
    fontSize: 12,
    color: '#FF7F50',
  },
  // HTML styles
  htmlParagraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    marginBottom: 10,
  },
  htmlBold: {
    fontWeight: 'bold',
    color: '#333',
  },
  htmlItalic: {
    fontStyle: 'italic',
  },
  htmlList: {
    marginVertical: 8,
  },
  htmlListItem: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 5,
    paddingLeft: 8,
  },
  htmlH1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginVertical: 10,
  },
  htmlH2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  htmlH3: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginVertical: 6,
  },
});

export default ConceptViewer;
