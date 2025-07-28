"use client"

import { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import Step1 from "../components/BookingStepForm/Step1"
import Step2 from "../components/BookingStepForm/Step2"
import Step3 from "../components/BookingStepForm/Step3"
import Step4 from "../components/BookingStepForm/Step4"
import type { PaymentFormData, VendorData } from "../types/payment"
import { paymentApi } from "../services/paymentApi"
import { RouteProp, useNavigation } from "@react-navigation/native"


const theme = {
    colors: {
        primary: "#f6ac69",
        secondary: "#E9D8FD",
        background: "#fdfcff",
        text: "#2D3748",
        lightText: "#A0AEC0",
    },
}

export default function Booking({ route }: { route: RouteProp<any, any> }) {
    const navigation = useNavigation<any>();
    const { slug, conceptId, conceptData, vendorData: passedVendorData, fromCart } = route.params as { 
        slug?: string;
        conceptId?: string;
        conceptData?: any;
        vendorData?: any;
        fromCart?: boolean;
    };
    
    console.log("Route params:", { slug, conceptId, conceptData, passedVendorData, fromCart });
    
    // Start from step 1 if slug is provided, otherwise step 1
    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [vendorData, setVendorData] = useState<VendorData | null>(null)
    const [isLoadingVendor, setIsLoadingVendor] = useState(true) // Always load vendor data
    const [formData, setFormData] = useState<PaymentFormData>({
        selectedServices: {
            premium: true,
            album: false,
            extraHour: false,
        },
        voucher: "",
        customerInfo: {
            name: "",
            email: "",
            phone: "",
            notes: "",
        },
        paymentOption: "30",
        paymentMethod: "card",
        cardDetails: {
            number: "",
            expiry: "",
            cvv: "",
            name: "",
        },
    })

    const steps = [
        { number: 1, title: "Đơn hàng" },
        { number: 2, title: "Ngày giờ" },
        { number: 3, title: "Thông tin" },
        { number: 4, title: "Thanh toán" },
    ]

    useEffect(() => {
        const fetchVendorData = async () => {
            try {
                setIsLoadingVendor(true)
                
                // If coming from cart, we need to fetch vendor data by concept
                if (fromCart && conceptData) {
                    // If we have slug from cart, use it first
                    if (slug) {
                        try {
                            const data = await paymentApi.fetchVendorBySlug(slug)
                            setVendorData(data)
                            setFormData(prev => ({
                                ...prev,
                                vendorData: data
                            }))
                            return
                        } catch (error) {
                            console.error("Error fetching vendor by slug:", error)
                        }
                    }
                    
                    // Fallback to concept ID if slug fails or not available
                    try {
                        const data = await paymentApi.fetchVendorByConceptId(conceptData.id)
                        setVendorData(data)
                        setFormData(prev => ({
                            ...prev,
                            vendorData: data
                        }))
                        return
                    } catch (error) {
                        console.error("Error fetching vendor by concept:", error)
                        Alert.alert("Lỗi", "Không thể tải thông tin nhà cung cấp. Vui lòng thử lại từ trang chi tiết studio.")
                        return
                    }
                }
                
                // Always fetch by slug if available
                if (slug) {
                    const data = await paymentApi.fetchVendorBySlug(slug)
                    setVendorData(data)
                    setFormData(prev => ({
                        ...prev,
                        vendorData: data
                    }))
                    return
                }
                
                // Fallback to passed vendor data if no slug
                if (passedVendorData) {
                    setVendorData(passedVendorData)
                    setFormData(prev => ({
                        ...prev,
                        vendorData: passedVendorData
                    }))
                    return
                }
            } catch (error) {
                console.error("Error fetching vendor data:", error)
                Alert.alert("Lỗi", "Không thể tải thông tin nhà cung cấp. Vui lòng thử lại.")
            } finally {
                setIsLoadingVendor(false)
            }
        }

        fetchVendorData()
    }, [slug, passedVendorData, fromCart, conceptData])

    // Set selected concept if conceptData is provided
    useEffect(() => {
        if (conceptData) {
            setFormData(prev => ({
                ...prev,
                selectedConcept: conceptData
            }))
        }
    }, [conceptData])

    const updateFormData = (data: Partial<PaymentFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }))
    }
    
    const handleStep1Next = async () => {
        setIsLoading(true)
        try {
            // Validate services and get pricing
            await paymentApi.validateServices(formData.selectedServices)
            setCurrentStep(2)
        } catch (error) {
            Alert.alert("Lỗi", "Không thể xác thực dịch vụ. Vui lòng thử lại.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleStep2Next = async () => {
        if (!formData.bookingDateTime) {
            Alert.alert("Lỗi", "Vui lòng chọn ngày và giờ")
            return
        }

        setIsLoading(true)
        try {
            // Validate date/time availability
            setCurrentStep(3)
        } catch (error) {
            Alert.alert("Lỗi", "Không thể xác thực thời gian. Vui lòng thử lại.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleStep3Next = async () => {
        setIsLoading(true)
        try {
            // Save customer information
            await paymentApi.saveCustomerInfo(formData.customerInfo)
            setCurrentStep(4)
        } catch (error) {
            Alert.alert("Lỗi", "Không thể lưu thông tin khách hàng. Vui lòng thử lại.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleStep4Next = async () => {
        setIsLoading(true)
        try {
            // Payment is now handled directly in the Step4 component
            // We just need to show a success message here
            Alert.alert(
                "Đặt lịch thành công!",
                "Cảm ơn bạn đã đặt lịch. Thông tin chi tiết sẽ được gửi đến email của bạn.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // Navigate back or to a success screen
                            console.log("Booking completed successfully");
                        },
                    },
                ],
            )
        } catch (error: any) {
            Alert.alert("Lỗi", error.message || "Có lỗi xảy ra khi hoàn tất đặt lịch")
        } finally {
            setIsLoading(false)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        } else {
            // If we're at step 1, always go back normally since we have slug
            navigation.goBack()
        }
    }

    const renderCurrentStep = () => {
        const commonProps = {
            formData,
            onUpdateFormData: updateFormData,
            onBack: handleBack,
            isLoading,
            vendorData: vendorData || undefined,
        }

        switch (currentStep) {
            case 1:
                return <Step1 {...commonProps} onNext={handleStep1Next} />
            case 2:
                return <Step2 {...commonProps} onNext={handleStep2Next} />
            case 3:
                return <Step3 {...commonProps} onNext={handleStep3Next} />
            case 4:
                return <Step4 {...commonProps} onNext={handleStep4Next} />
            default:
                return <Step1 {...commonProps} onNext={handleStep1Next} />
        }
    }

    if (isLoadingVendor) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16, color: '#6B7280' }}>Đang tải thông tin...</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.wrapper}>


                {/* Step Indicator */}
                <View style={styles.stepIndicator}>
                    {steps.map((step, index) => {
                        const isCompleted = currentStep > step.number
                        const isActive = currentStep === step.number
                        const isPassed = currentStep >= step.number

                        return (
                            <View key={step.number} style={styles.stepItem}>
                                <View style={styles.stepColumn}>
                                    <View
                                        style={[
                                            styles.stepCircle,
                                            {
                                                backgroundColor: isPassed ? theme.colors.primary : "#e5e7eb",
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.stepNumber,
                                                { color: isPassed ? "white" : "#9ca3af" },
                                            ]}
                                        >
                                            {step.number}
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            styles.stepTitle,
                                            {
                                                color: isPassed ? "#111827" : "#9ca3af",
                                            },
                                        ]}
                                    >
                                        {step.title}
                                    </Text>
                                </View>

                                {/* Step line */}
                                {index < steps.length - 1 && (
                                    <View
                                        style={[
                                            styles.stepLine,
                                            {
                                                backgroundColor: isCompleted
                                                    ? theme.colors.primary
                                                    : "#e5e7eb",
                                            },
                                        ]}
                                    />
                                )}
                            </View>
                        )
                    })}
                </View>

                {/* Step Content */}
                <View style={styles.content}>{renderCurrentStep()}</View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    wrapper: {
        minWidth: 400,
        alignSelf: "center",
        backgroundColor: "white",
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    backButton: {
        padding: 4,
    },
    backButtonDisabled: {
        opacity: 0.5,
    },
    backButtonText: {
        fontSize: 18,
        color: "#000",
    },
    backButtonTextDisabled: {
        color: "#9ca3af",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    headerSpacer: {
        width: 24,
    },
    stepIndicator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 24,
        paddingHorizontal: 6,
        backgroundColor: "white",
    },
    stepItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    stepColumn: {
        alignItems: "center",
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: "500",
    },
    stepTitle: {
        marginTop: 4,
        fontSize: 12,
        textAlign: "center",
    },
    stepLine: {
        width: 40,
        height: 2,
        marginHorizontal: 8,
        marginBottom: 20,
    },
    content: {
        flex: 1,
    },
})
