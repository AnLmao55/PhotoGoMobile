import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../components/ConceptViewer/Header';
import TabSwitcher from '../components/ConceptViewer/TabSwitcher';
import ConceptList from '../components/ConceptViewer/ConceptList';
import ImageCarousel from '../components/ConceptViewer/ImageCarousel';
import ConceptDetail from '../components/ConceptViewer/ConceptDetail';
const concepts = [
    { id: '1', name: 'SEVENTEEN', image: 'https://link.to/seventeen.jpg' },
    { id: '2', name: 'BIRTHDAY', image: 'https://link.to/birthday.jpg' },
    { id: '3', name: 'MYSTERY CONCEPT', image: 'https://link.to/mystery.jpg' },
    { id: '4', name: 'SOFT CONCEPT', image: 'https://link.to/soft.jpg' },
];

const imagesByConcept = {
    'SEVENTEEN': ['https://imgs.search.brave.com/LfaeGPFhcPllZGvz9T8bD5lB0rGsoVlZ1tZSbR3tbnk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS12ZWN0/b3IvbmVlZGxlLWxv/Z28taWNvbi1kZXNp/Z24tdmVjdG9yXzU4/MDIyNC00NTguanBn/P3NlbXQ9YWlzX2h5/YnJpZCZ3PTc0MA', 'https://link.to/seventeen2.jpg'],
    'BIRTHDAY': ['https://link.to/birthday1.jpg'],
    'MYSTERY CONCEPT': ['https://link.to/mystery1.jpg'],
    'SOFT CONCEPT': ['https://link.to/soft1.jpg'],
};

const ConceptViewer = () => {
    const [selectedConcept, setSelectedConcept] = useState(concepts[0]);
    const [activeTab, setActiveTab] = useState<'image' | 'detail'>('image');

    return (
        <View style={styles.container}>
            <Header />
            <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
            <ConceptList
                concepts={concepts}
                selectedId={selectedConcept.id}
                onSelect={setSelectedConcept}
            />
            {activeTab === 'image' ? (
                <ImageCarousel images={imagesByConcept[selectedConcept.name] || []} />
            ) : (
                <ConceptDetail concept={selectedConcept} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
});

export default ConceptViewer;
