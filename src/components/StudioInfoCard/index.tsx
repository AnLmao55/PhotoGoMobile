import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
type Props = {
    studio: any;
};

const StudioInfoCard: React.FC<Props> = ({ studio }) => {
    const isOpen = studio.status === "hoạt động";

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>{studio.name || "Studio chưa rõ"}</Text>
            </View>

            <View
                style={[
                    styles.statusBadge,
                    { backgroundColor: isOpen ? '#d4f5dd' : '#fcdede' },
                ]}
            >
                <Text
                    style={[
                        styles.statusText,
                        { color: isOpen ? '#0f9d58' : '#d93025' },
                    ]}
                >
                    {isOpen ? "Mở cửa" : "Đóng cửa"}
                </Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.star}>⭐</Text>
                <Text style={styles.rating}>{studio.averageRating?.toFixed(1) ?? "N/A"}</Text>
                <Text style={styles.ratingCount}>({studio.reviewCount ?? 0})</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.location}>
                    {studio.locations?.[0]
                        ? [studio.locations[0].address, studio.locations[0].district, studio.locations[0].city].filter(Boolean).join(", ")
                        : "Không rõ địa chỉ"}
                </Text>
            </View>

            <View style={styles.tagContainer}>
                {(studio.servicePackages || []).map((pkg: any, index: number) => (
                    <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{pkg.name}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        backgroundColor: '#fff',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
        marginTop: 10,
        width: 75,
        alignItems: 'center',
    },
    statusText: {
        fontWeight: '600',
        fontSize: 12,
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow text to wrap onto the next line
        alignItems: 'center',
        marginTop: 6,
    },

    star: {
        fontSize: 14,
        color: '#fbbc04',
    },
    rating: {
        marginLeft: 4,
        fontWeight: 'bold',
        fontSize: 13,
        color: '#444',
    },
    ratingCount: {
        marginLeft: 4,
        fontSize: 13,
        color: '#888',
    },
    dot: {
        marginHorizontal: 6,
        fontSize: 12,
        color: '#888',
    },
    location: {
        fontSize: 13,
        color: '#555',
        flexShrink: 1, // Allow text to shrink if needed
        flexGrow: 1,   // Allow text to grow and take up remaining space
        flexBasis: 'auto',
        minWidth: 0,   // Prevents text from forcing container to overflow
    },

    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    tag: {
        backgroundColor: '#f1f3f4',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 12,
        color: '#333',
    },
});

export default StudioInfoCard;
