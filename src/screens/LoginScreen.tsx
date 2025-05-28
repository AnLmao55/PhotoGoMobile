import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    // Add your authentication logic here
    if (username === 'test' && password === '123') {
      // Navigate to MainApp instead of Home
      navigation.navigate('Home');
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

  const handleGoogleLogin = () => {
    // Implement Google login
    Alert.alert('Info', 'Google login not implemented yet');
  };

  const handleFacebookLogin = () => {
    // Implement Facebook login
    Alert.alert('Info', 'Facebook login not implemented yet');
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://st2.depositphotos.com/1001599/8660/v/450/depositphotos_86601758-stock-illustration-cameraman.jpg' }}
        style={styles.tripodImage}
      />
      <Image
        source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp16OHeaeQhm_aPVmShyIruI1N3jvshRhWTQ&s' }}
        style={styles.logo}
      />
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
            name={showPassword ? "eye-outline" : "eye-off-outline"} 
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
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png' }}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin}>
          <Image
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/2048px-2023_Facebook_icon.svg.png' }}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleRegister}>
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
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
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
    resizeMode: 'contain'
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