import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [currentConceptIndex, setCurrentConceptIndex] = useState(0);

  const handleNextConcept = () => {
    if (!selectedPackage) return;
    setCurrentConceptIndex((prev) =>
      prev + 1 >= selectedPackage.serviceConcepts.length ? 0 : prev + 1
    );
  };

  const handlePrevConcept = () => {
    if (!selectedPackage) return;
    setCurrentConceptIndex((prev) =>
      prev - 1 < 0 ? selectedPackage.serviceConcepts.length - 1 : prev - 1
    );
  };

  const renderServicePackage = (service: ServicePackage) => (
    <TouchableOpacity
      key={service.id}
      style={styles.serviceCard}
      onPress={() => {
        setSelectedPackage(service);
        setCurrentConceptIndex(0);
      }}
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
      </View>
    </TouchableOpacity>
  );

  const renderConcept = () => {
    if (!selectedPackage) return null;

    const concept = selectedPackage.serviceConcepts[currentConceptIndex];
    return (
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.conceptTitle}>{concept.name}</Text>
        <Text style={styles.conceptDescription}>
          {concept.description.replace(/<[^>]+>/g, '')}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {concept.images?.map((imgUrl) => (
            <Image
              key={imgUrl}
              source={{ uri: imgUrl }}
              style={styles.conceptImage}
            />
          ))}
        </ScrollView>

        <Text style={styles.conceptInfo}>
          Giá: {Number(concept.price).toLocaleString()} đ
        </Text>
        <Text style={styles.conceptInfo}>
          Thời lượng: {concept.duration} phút ({concept.conceptRangeType})
        </Text>
        <Text style={styles.conceptInfo}>
          Số ngày: {concept.numberOfDays}
        </Text>

        <Text style={styles.conceptInfo}>Phong cách:</Text>
        {concept.serviceTypes?.map((type) => (
          <Text key={type.id} style={styles.serviceType}>
            - {type.name}: {type.description}
          </Text>
        ))}
      </ScrollView>
    );
  };

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

      <Modal
        visible={!!selectedPackage}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPackage(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPackage && selectedPackage.serviceConcepts.length > 0 && (
              <>
                {renderConcept()}

                {selectedPackage.serviceConcepts.length > 1 && (
                  <View style={styles.switchButtons}>
                    <Pressable onPress={handlePrevConcept} style={styles.navButton}>
                      <Text style={styles.navButtonText}>◀ Trước</Text>
                    </Pressable>
                    <Pressable onPress={handleNextConcept} style={styles.navButton}>
                      <Text style={styles.navButtonText}>Tiếp ▶</Text>
                    </Pressable>
                  </View>
                )}

                <Pressable
                  onPress={() => setSelectedPackage(null)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
  },
  conceptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  conceptDescription: {
    marginBottom: 12,
    fontSize: 14,
    color: '#555',
  },
  conceptImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginRight: 10,
  },
  conceptInfo: {
    fontSize: 14,
    marginTop: 6,
  },
  serviceType: {
    fontSize: 13,
    marginLeft: 10,
  },
  switchButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 10,
  },
  navButton: {
    backgroundColor: '#FF7F50',
    padding: 8,
    borderRadius: 8,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#ccc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#333',
    fontWeight: '600',
  },
});

export default ServiceList;
