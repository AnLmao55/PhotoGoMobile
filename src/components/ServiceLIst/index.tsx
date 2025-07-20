import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Props = {
  studio: any;
};

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

const { width } = Dimensions.get('window');

const ServiceList: React.FC<Props> = ({ studio }) => {
  const navigation = useNavigation<any>();

  const handleServicePress = (servicePackage: ServicePackage) => {
    navigation.navigate('Concept', { 
      servicePackage, 
      studioName: studio?.name || 'Dịch vụ',
      slug: studio?.slug || '', // Add slug for booking navigation
    });
  };

  const renderServicePackage = (service: ServicePackage) => (
    <TouchableOpacity
      key={service.id}
      style={styles.serviceCard}
      onPress={() => handleServicePress(service)}
    >
      <View style={styles.serviceImage}>
        {service.image ? (
          <Image source={{ uri: service.image }} style={styles.imageStyle} />
        ) : (
          <Ionicons name="image-outline" size={40} color="#ccc" />
        )}
      </View>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{service.name}</Text>
        <Text style={styles.serviceSubtitle}>
          {service.serviceConcepts.length} concept
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#FF7F50" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Gói dịch vụ</Text>
        {(studio?.servicePackages ?? []).length > 0 ? (
          studio.servicePackages.map(renderServicePackage)
        ) : (
          <Text style={{ textAlign: 'center', margin: 20 }}>
            Không có gói dịch vụ nào.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#fff',
  },
  container: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  imageStyle: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  serviceSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
});

export default ServiceList;
