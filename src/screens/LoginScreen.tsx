import type React from "react";
import { useState, useEffect } from "react";
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
} from "react-native";
import { theme } from "../theme/theme";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import Svg, { Path } from "react-native-svg";
import axios from "axios";
import Constants from "expo-constants";
import { useAlert } from "../components/Alert/AlertContext";

// Bắt buộc cho Expo Auth
WebBrowser.maybeCompleteAuthSession();

// Assets
const logo = require("../../assets/logotrang.png");
const backgroundImage = require("../../assets/login-background.jpg");
const { width: screenWidth } = Dimensions.get("window");

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { customAlert } = useAlert();
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "95785649270-fok0s8um7klc3ko4o7uu3jkcujm2tk09.apps.googleusercontent.com",
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

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

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.user) {
        const userData = {
          id: userInfo.user.id,
          email: userInfo.user.email,
          name: userInfo.user.name || "",
          picture: userInfo.user.photo || "",
          given_name: userInfo.user.givenName || "",
          family_name: userInfo.user.familyName || "",
          email_verified: true,
          loginMethod: "google",
          loginTime: new Date().toISOString(),
        };

        const tokens = await GoogleSignin.getTokens();
        const idToken = tokens.idToken;

        await AsyncStorage.multiSet([
          ["isLoggedIn", "true"],
          ["userData", JSON.stringify(userData)],
          ["userToken", idToken || ""],
          ["loginMethod", "google"],
        ]);
        
        // Log AsyncStorage contents after Google login
        await logAsyncStorageContent();

        customAlert("Thành công", "Đăng nhập thành công", () => {
          navigation.navigate("MainTabs");
        });
      }
    } catch (error: any) {
      console.error("Error during Google sign in:", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in is in progress already");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Lỗi", "Google Play Services không khả dụng hoặc đã lỗi thời");
      } else {
        Alert.alert("Lỗi đăng nhập", "Không thể đăng nhập với Google. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL}/auth/login`,
        {
          email,
          password,
        }
      );

      const { data } = response.data;
      const { user, access_token, refresh_token } = data;

      const userData = {
        id: user.id || "unknown",
        email: user.email || email,
        name: user.name || "User",
        role: user.role || { id: "unknown", name: "unknown", description: "unknown" },
        cartId: user.cartId || "unknown",
        wishlistId: user.wishlistId || "unknown",
        loginMethod: "normal",
        loginTime: new Date().toISOString(),
      };

      await AsyncStorage.multiSet([
        ["isLoggedIn", "true"],
        ["userData", JSON.stringify(userData)],
        ["access_token", access_token || ""],
        ["refresh_token", refresh_token || ""],
        ["loginMethod", "normal"],
      ]);
      
      
      

      customAlert("Thành công", "Đăng nhập thành công", () => {
        navigation.navigate("MainTabs");
      });
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Email hoặc mật khẩu không đúng";
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

  const handleForgotPassword = () => navigation.navigate("ForgotPassword");
  const handleRegister = () => navigation.navigate("Register");

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ height: 700, position: "relative" }}>
        <ImageBackground source={backgroundImage} style={{ width: "100%", height: "60%" }} resizeMode="cover">
          {/* Lớp phủ để làm sáng background */}
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

        <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
          <Text style={styles.forgot}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
        </TouchableOpacity>

        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.or}>Hoặc tiếp tục với</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.social}>
          <TouchableOpacity
            style={[styles.socialButton, isLoading && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Image
                source={{
                  uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png",
                }}
                style={styles.socialIcon}
              />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
          <Text style={styles.register}>Chưa có tài khoản? Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
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
  forgot: {
    color: theme.colors.lightText,
    alignSelf: "flex-end",
    marginBottom: theme.spacing.md,
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
  or: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  social: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
    marginBottom: theme.spacing.lg,
  },
  socialIcon: {
    width: 25,
    height: 25,
  },
  register: {
    color: theme.colors.primary,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    marginVertical: theme.spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.lightText,
  },
  socialButton: {
    width: 100,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.lightText,
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
});

export default LoginScreen;