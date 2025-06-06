import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();
const logo = require('../../assets/logocam.png'); // Adjust the path as necessary

const handleWebViewNavigationStateChange = (navState: any) => {
  const { url } = navState;

  // Kiểm tra nếu URL chứa /auth/login/google
  if (url.includes('/auth/login/google')) {
    try {
      // Lấy query parameters từ URL
      const urlObj = new URL(url);
      const userParam = urlObj.searchParams.get('user');
      const token = urlObj.searchParams.get('token');

      if (userParam && token) {
        // Parse thông tin user từ chuỗi JSON
        const user = JSON.parse(decodeURIComponent(userParam));

        // Lưu thông tin user và token vào AsyncStorage
        const saveUserData = async () => {
          try {
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(user));
            // Điều hướng đến màn hình chính
            navigation.navigate('MainTabs');
            setWebViewUri(null); // Đóng WebView
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể lưu thông tin đăng nhập');
          }
        };

        saveUserData();
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xử lý thông tin đăng nhập');
    }
  }
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [webViewUri, setWebViewUri] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '48d92f75-1003-4b6f-a593-f4c241a0cda3',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
    responseType: "id_token",
    scopes: ['profile', 'email'],
    redirectUri: Platform.select({
    native: 'exp://u.expo.dev/adafe393-7132-412f-9616-d7965ad54c01?channel=production',
    default: 'exp://u.expo.dev/adafe393-7132-412f-9616-d7965ad54c01?channel=production'
  })
  });



  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    if (username === 'test' && password === '123') {
      navigation.navigate('MainTabs');
    } else {
      Alert.alert('Lỗi', 'Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleGoogleLogin = async () => {


    try {
      const result = await promptAsync();
      if (result.type === 'success') {
        const { id_token } = result.params;
        const response = await fetch('https://api.photogo.id.vn/api/v1/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: id_token }),
        });
        const data = await response.json();
        if (response.ok && data.redirectUrl) {
          setWebViewUri(data.redirectUrl);
        } else {
          Alert.alert('Lỗi', data.message || 'Đăng nhập Google thất bại');
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi đăng nhập Google');
    }
  };


  // Handle WebView navigation state changes to detect successful login
  

  return (
    <View style={styles.container}>
      {webViewUri ? (
        <WebView
          source={{ uri: webViewUri }}
          style={{ flex: 1 }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          onError={() => {
            Alert.alert('Lỗi', 'Không thể tải trang xác thực');
            setWebViewUri(null);
          }}
        />
      ) : (
        <>
          <Image
            source={{ uri: 'https://st2.depositphotos.com/1001599/8660/v/450/depositphotos_86601758-stock-illustration-cameraman.jpg' }}
            style={styles.tripodImage}
          />
          <Image source={logo} style={styles.logo} />
          <TextInput
            style={styles.input}
            placeholder="Tên đăng nhập"
            placeholderTextColor={theme.colors.lightText}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Mật khẩu"
              placeholderTextColor={theme.colors.lightText}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color={theme.colors.lightText}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgot}>Quên mật khẩu?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </TouchableOpacity>
          <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.or}>Hoặc tiếp tục với</Text>
            <View style={styles.line} />
          </View>
          <View style={styles.social}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
              <Image
                source={{
                  uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png',
                }}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.register}>Chưa có tài khoản? Đăng ký ngay</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 100,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: theme.spacing.md,
    resizeMode: 'contain',
  },
  input: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.lightText,
    borderRadius: 30,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: '#fff',
  },
  forgot: {
    color: theme.colors.lightText,
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.md,
  },
  button: {
    width: '80%',
    height: 50,
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  buttonText: {
    color: '#fff',
    fontSize: theme.fontSizes.md,
  },
  or: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  social: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginBottom: theme.spacing.lg,
  },
  socialIcon: {
    width: 25,
    height: 25,
  },
  register: {
    color: theme.colors.primary,
  },
  tripodImage: {
    width: 200,
    height: 200,
    marginBottom: theme.spacing.md,
    resizeMode: 'contain',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.lightText,
  },
  passwordContainer: {
    width: '80%',
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    width: '100%',
    paddingRight: 50, // Make room for the eye icon
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: -5,
    height: '100%',
    justifyContent: 'center',
  },
});

export default LoginScreen;