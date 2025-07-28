import React from 'react'
import { View, StyleSheet, TouchableOpacity, Dimensions, Pressable, Image } from 'react-native'

function ImageCarousel() {
    const imageToShow = [
        {
            id: 1,
            url: "ligma"
        }
    ]


    return (
        <View style={styles.gridContainer}>
            {imageToShow.map((url, index) => {
                const isLastInRow = (index + 1) % 3 === 0;
                return (
                    <TouchableOpacity key={index} >
                        <View style={[styles.workItem, !isLastInRow && { marginRight: 16 }]}>
                            <Image source={{ uri: url }} style={styles.image} />
                        </View>
                    </TouchableOpacity>
                )
            })}

        </View>
    )
}
const itemSize = (Dimensions.get('window').width - 64 - 16 * 2) / 3;

const styles = StyleSheet.create({
    gridContainer: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    workItem: {
        width: itemSize,
        height: itemSize,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#EEE',
        marginBottom: 16,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
})
export default ImageCarousel
