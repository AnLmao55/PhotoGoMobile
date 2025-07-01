"use client"

import { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import Step1 from "../components/BookingStepForm/Step1"
import Step2 from "../components/BookingStepForm/Step2"
import Step3 from "../components/BookingStepForm/Step3"
import Step4 from "../components/BookingStepForm/Step4"
import type { PaymentFormData, VendorData } from "../types/payment"
import { paymentApi } from "../services/paymentApi"



import { RouteProp } from "@react-navigation/native"



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
    const { slug } = route.params as { slug: string }
    console.log(slug)

    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [vendorData, setVendorData] = useState<VendorData | null>(null)
    const [isLoadingVendor, setIsLoadingVendor] = useState(true)
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
                const data = await paymentApi.fetchVendorBySlug(slug)
                setVendorData(data)
            } catch (error) {
                console.error("Error fetching vendor data:", error)
                Alert.alert("Lỗi", "Không thể tải thông tin nhà cung cấp. Vui lòng thử lại.")
            } finally {
                setIsLoadingVendor(false)
            }
        }

        if (slug) {
            fetchVendorData()
        }
    }, [slug])

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
            // Process payment
            const result = await paymentApi.processPayment(formData)

            Alert.alert(
                "Thanh toán thành công!",
                `Mã giao dịch: ${result.transactionId}\nSố tiền: ${result.amount.toLocaleString("vi-VN")}đ`,
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // Navigate to success screen or reset form
                            console.log("Payment completed:", result)
                        },
                    },
                ],
            )
        } catch (error: any) {
            Alert.alert("Lỗi thanh toán", error.message || "Có lỗi xảy ra khi xử lý thanh toán")
        } finally {
            setIsLoading(false)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
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
                return <Step1 {...commonProps} onNext={handleStep1Next} selectedService={selectedService} />
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
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Đang tải thông tin...</Text>
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
