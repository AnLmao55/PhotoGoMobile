import React from 'react';
import { View, FlatList, SafeAreaView } from 'react-native';
import { theme } from '../theme/theme';
import SearchBar from '../components/SearchBar';
import Services from '../components/Services';
import Carousel from '../components/Carousel';
import Submenu from '../components/Submenu';
import Studio from '../components/Studio';
import MakeupArtists from '../components/MakeupArtists';
import Review from '../components/Review';


const carouselData = [
  {
    id: 1,
    image: 'https://tuarts.net/wp-content/uploads/2019/07/anh-cuoi-phong-cach-han-quoc-5.jpg',
    title: 'Gạo Studio',
  },
  {
    id: 2, 
    image: 'https://omni.vn/wp-content/uploads/2024/01/DUCK5235-1.jpg',
    title: 'Minh Phước Studio'
  },
  {
    id: 3,
    image: 'https://studio1nha.vn/application/upload/products//z5323895944572_dbfe9de4c04a7b67a9cffc54720d38b7.jpg',
    title: 'VV Studio'
  }
];

const HomeScreen: React.FC = () => {
  const renderContent = () => (
    <View className="flex-1 bg-white pt-10 items-center">
      <SearchBar />
      <Submenu/>
      <Carousel
        data={carouselData}
        autoPlay={true}
        interval={3000}
      />
      <Studio/>
      <Services />   
      
      {/* <MakeupArtists/> */}
      <Review/>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => renderContent()}
        scrollEnabled={true}
        keyExtractor={item => item.key}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;