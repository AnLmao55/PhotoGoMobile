import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();
const logo = require('../../assets/logocam.png');

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Cấu hình Google OAuth
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '1049648822582-37cndij0l40qrpnma9ptp1uu40ant5jn.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', // Thay bằng iOS Client ID
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Thay bằng Web Client ID
    scopes: ['profile', 'email', 'openid'],
    responseType: 'id_token',
  });

  // Xử lý response từ Google OAuth
  useEffect(() => {
    if (response?.type === 'success') {
      // Change this line to access idToken correctly
      const { id_token } = response.authentication || {};
      if (id_token) {
        handleGoogleSuccess(id_token);
      } else {
        console.error('No ID token found in response');
        Alert.alert('Lỗi', 'Không thể lấy thông tin xác thực');
        setIsLoading(false);
      }
    } else if (response?.type === 'error') {
      console.error('Google OAuth Error:', response.error);
      Alert.alert('Lỗi', 'Đăng nhập Google thất bại');
      setIsLoading(false);
    }
  }, [response]);

  // Xử lý khi Google OAuth thành công
  const handleGoogleSuccess = async (idToken: string) => {
    try {
      setIsLoading(true);

      // Lấy thông tin user từ Google API
      const userInfo = await fetchGoogleUserInfo(idToken);

      if (userInfo) {
        // Tạo user object để lưu vào AsyncStorage
        const userData = {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          given_name: userInfo.given_name,
          family_name: userInfo.family_name,
          email_verified: userInfo.email_verified,
          loginMethod: 'google',
          loginTime: new Date().toISOString(),
        };

        // Lưu thông tin user vào AsyncStorage
        await AsyncStorage.multiSet([
          ['isLoggedIn', 'true'],
          ['userData', JSON.stringify(userData)],
          ['userToken', idToken],
          ['loginMethod', 'google'],
        ]);

        console.log('User data saved:', userData);
        Alert.alert('Thành công', `Chào mừng ${userData.name}!`, [
          { text: 'OK', onPress: () => navigation.navigate('MainTabs') }
        ]);
      }
    } catch (error) {
      console.error('Error handling Google success:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng từ Google');
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy thông tin user từ Google API
  const fetchGoogleUserInfo = async (idToken: string) => {
    try {
      // Verify và lấy thông tin từ Google tokeninfo endpoint
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);

      if (!response.ok) {
        throw new Error('Failed to verify token');
      }

      const tokenInfo = await response.json();

      // Kiểm tra token có hợp lệ không
      if (tokenInfo.aud !== '1049648822582-37cndij0l40qrpnma9ptp1uu40ant5jn.apps.googleusercontent.com') {
        throw new Error('Invalid token audience');
      }

      return tokenInfo;
    } catch (error) {
      console.error('Error fetching Google user info:', error);
      throw error;
    }
  };

  // Xử lý đăng nhập Google
const handleGoogleLogin = async () => {
  if (!request) {
    Alert.alert('Lỗi', 'Google OAuth chưa sẵn sàng');
    return;
  }

  try {
    setIsLoading(true);
    await promptAsync();
  } catch (error) {
    console.error('Error initiating Google login:', error);
    Alert.alert('Lỗi', 'Không thể khởi tạo đăng nhập Google');
  } finally {
    setIsLoading(false);
  }
};

  // Xử lý đăng nhập thường
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    setIsLoading(true);

    // Simulate login (thay thế bằng logic thực tế của bạn)
    setTimeout(async () => {
      if (username === 'test' && password === '123') {
        const userData = {
          id: 'test_user',
          email: 'test@example.com',
          name: 'Test User',
          username: username,
          loginMethod: 'normal',
          loginTime: new Date().toISOString(),
        };

        await AsyncStorage.multiSet([
          ['isLoggedIn', 'true'],
          ['userData', JSON.stringify(userData)],
          ['loginMethod', 'normal'],
        ]);

        navigation.navigate('MainTabs');
      } else {
        Alert.alert('Lỗi', 'Tên đăng nhập hoặc mật khẩu không đúng');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (isLoggedIn === 'true') {
        navigation.navigate('MainTabs');
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  return (
    <View style={styles.container}>
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
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
          disabled={isLoading}
        >
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={24}
            color={theme.colors.lightText}
          />
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
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
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
                uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png',
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
  buttonDisabled: {
    opacity: 0.6,
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
    paddingRight: 50,
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