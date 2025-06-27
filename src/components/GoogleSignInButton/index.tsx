import type React from "react"
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from "react-native"
import { useGoogleAuth } from "../../hooks/use-google-auth"

interface GoogleSignInButtonProps {
  onSignInSuccess?: (user: any) => void
  onSignInError?: (error: any) => void
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSignInSuccess, onSignInError }) => {
  const { signIn, isLoading } = useGoogleAuth()

  const handleSignIn = async () => {
    try {
      const user = await signIn()
      if (user && onSignInSuccess) {
        onSignInSuccess(user)
      }
    } catch (error) {
      if (onSignInError) {
        onSignInError(error)
      } else {
        Alert.alert("Lỗi đăng nhập", "Không thể đăng nhập với Google. Vui lòng thử lại.")
      }
    }
  }

  return (
    <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={isLoading}>
      {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng nhập với Google</Text>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4285F4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
