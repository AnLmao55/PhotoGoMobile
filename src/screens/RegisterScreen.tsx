import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ImageBackground,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Dimensions,
    ScrollView,
    Modal,
} from "react-native";
import { theme } from "../theme/theme";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { useAlert } from "../components/Alert/AlertContext";
import Svg, { Path } from "react-native-svg";

// Assets
const logo = require("../../assets/logotrang.png");
const backgroundImage = require("../../assets/login-background.jpg");
const { width: screenWidth } = Dimensions.get("window");

// Helper function to log all AsyncStorage contents
const logAsyncStorageContent = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    console.log('===== ASYNC STORAGE CONTENTS AFTER REGISTRATION =====');
    items.forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    console.log('=============================================');
  } catch (error) {
    console.error('Error logging AsyncStorage content:', error);
  }
};

const RegisterScreen: React.FC = () => {
    const navigation = useNavigation();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState("");
    const { customAlert } = useAlert();

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
            if (isLoggedIn === "true") {
                navigation.navigate("MainTabs");
            }
        } catch (error) {
            console.error("Error checking login status:", error);
        }
    };

    const handleRegister = async () => {
        if (!fullName || !email || !password || !phoneNumber) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/auth/register`,
                {
                    fullName,
                    avatarUrl: "",
                    email,
                    passwordHash: password,
                    phoneNumber,
                    roleId: "R001",
                    status: "hoạt động",
                    auth: "local",
                }
            );

            if (response.data.statusCode === 201) {
                const { data } = response.data;
                const userData = {
                    id: data.id || "unknown",
                    email: data.email || email,
                    name: data.fullName || fullName,
                    role: data.role || { id: "R001", name: "customer", description: "Khách hàng sử dụng dịch vụ" },
                    cartId: data.cartId || "unknown",
                    wishlistId: data.wishlistId || "unknown",
                    loginMethod: "local",
                    loginTime: new Date().toISOString(),
                };

                await AsyncStorage.multiSet([
                    ["isLoggedIn", "true"],
                    ["userData", JSON.stringify(userData)],
                    ["loginMethod", "local"],
                ]);
                
                // Log AsyncStorage contents after registration
                await logAsyncStorageContent();

                setShowOtpModal(true);
            } else {
                throw new Error(response.data.message || "Đăng ký không thành công");
            }
        } catch (error: any) {
            console.error("Registration error:", error);
            let errorMessage = "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.";

            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
                } else if (error.response.status === 409) {
                    errorMessage = "Email đã được sử dụng.";
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.request) {
                errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
            }

            Alert.alert("Lỗi", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async () => {
        if (!otp) {
            Alert.alert("Lỗi", "Vui lòng nhập mã OTP");
            return;
        }

        setIsLoading(true);

        try {
            await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/auth/activate`,
                null, // không có body
                {
                    params: {
                        email,
                        otp,
                    },
                }
            );

            customAlert("Thành công", "Xác thực OTP thành công", () => {
                setShowOtpModal(false);
                navigation.navigate("Login");
            });
        } catch (error: any) {
            console.error("OTP verification error:", error);
            let errorMessage = "Đã xảy ra lỗi khi xác thực OTP. Vui lòng thử lại.";

            if (error.response) {
                if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.request) {
                errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
            }

            Alert.alert("Lỗi", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = () => navigation.navigate("Login");

    return (
        <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ height: 700, position: "relative" }}>
                <ImageBackground source={backgroundImage} style={{ width: "100%", height: "60%" }} resizeMode="cover">
                    <View style={styles.overlay} />
                    <Svg
                        height="100%"
                        width="100%"
                        viewBox="0 0 1440 320"
                        style={{ position: "absolute", bottom: 0 }}
                    >
                        <Path
                            fill={theme.colors.background}
                            d="M0,160L48,170.7C96,181,192,203,288,213.3C384,224,480,224,576,208C672,192,768,160,864,133.3C960,107,1056,85,1152,80C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        />
                    </Svg>
                    <View style={{ position: "absolute", top: 15, width: "100%", alignItems: "center" }}>
                        <Image source={logo} style={styles.logo} />
                    </View>
                </ImageBackground>
            </View>

            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder="Họ và tên"
                    placeholderTextColor={theme.colors.lightText}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    editable={!isLoading}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={theme.colors.lightText}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isLoading}
                />

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.input, styles.passwordInput]}
                        placeholder="Mật khẩu"
                        placeholderTextColor={theme.colors.lightText}
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        editable={!isLoading}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                        <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={24} color={theme.colors.lightText} />
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Số điện thoại"
                    placeholderTextColor={theme.colors.lightText}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                />

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng ký</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
                    <Text style={styles.register}>Đã có tài khoản? Đăng nhập ngay</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={showOtpModal}
                onRequestClose={() => setShowOtpModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Xác thực OTP</Text>
                        <Text style={styles.modalSubtitle}>
                            Vui lòng nhập mã OTP được gửi đến email {email}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập mã OTP"
                            placeholderTextColor={theme.colors.lightText}
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="numeric"
                            editable={!isLoading}
                        />
                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleOtpSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Xác nhận</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.md,
        marginTop: -400,
    },
    logo: {
        width: 200,
        height: 200,
        resizeMode: "contain",
        padding: 10,
        zIndex: 10,
    },
    input: {
        width: "80%",
        height: 50,
        borderWidth: 1,
        borderColor: theme.colors.lightText,
        borderRadius: 30,
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        backgroundColor: "#fff",
    },
    button: {
        width: "80%",
        height: 50,
        backgroundColor: theme.colors.primary,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: theme.spacing.md,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#fff",
        fontSize: theme.fontSizes.md,
    },
    register: {
        color: theme.colors.primary,
    },
    passwordContainer: {
        width: "80%",
        position: "relative",
        justifyContent: "center",
    },
    passwordInput: {
        width: "100%",
        paddingRight: 50,
    },
    eyeIcon: {
        position: "absolute",
        right: 15,
        top: -5,
        height: "100%",
        justifyContent: "center",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255, 255, 255, 0.2)", // Semi-transparent white overlay
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "80%",
        backgroundColor: theme.colors.background,
        borderRadius: 20,
        padding: theme.spacing.lg,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: theme.fontSizes.lg,
        fontWeight: "bold",
        marginBottom: theme.spacing.sm,
        color: theme.colors.text,
    },
    modalSubtitle: {
        fontSize: theme.fontSizes.md,
        marginBottom: theme.spacing.md,
        color: theme.colors.text,
        textAlign: "center",
    },
});

export default RegisterScreen;