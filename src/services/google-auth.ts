import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin"

export interface GoogleUser {
  id: string
  name: string
  email: string
  photo?: string
  familyName?: string
  givenName?: string
}

class GoogleAuthService {
  constructor() {
    this.configure()
  }

  private configure() {
    GoogleSignin.configure({
      webClientId: "1049648822582-37cndij0l40qrpnma9ptp1uu40ant5jn.apps.googleusercontent.com", // Từ Google Cloud Console
      offlineAccess: true,
      hostedDomain: "", // Để trống nếu không có domain riêng
      forceCodeForRefreshToken: true,
    })
  }

  async signIn(): Promise<GoogleUser | null> {
    try {
      await GoogleSignin.hasPlayServices()
      const userInfo = await GoogleSignin.signIn()

      if (userInfo.user) {
        return {
          id: userInfo.user.id,
          name: userInfo.user.name || "",
          email: userInfo.user.email,
          photo: userInfo.user.photo || undefined,
          familyName: userInfo.user.familyName || undefined,
          givenName: userInfo.user.givenName || undefined,
        }
      }
      return null
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow")
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Signin in progress")
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Play services not available")
      } else {
        console.log("Some other error happened: ", error)
      }
      throw error
    }
  }

  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut()
    } catch (error) {
      console.error("Error signing out: ", error)
      throw error
    }
  }

  async getCurrentUser(): Promise<GoogleUser | null> {
    try {
      const userInfo = await GoogleSignin.getCurrentUser()
      if (userInfo?.user) {
        return {
          id: userInfo.user.id,
          name: userInfo.user.name || "",
          email: userInfo.user.email,
          photo: userInfo.user.photo || undefined,
          familyName: userInfo.user.familyName || undefined,
          givenName: userInfo.user.givenName || undefined,
        }
      }
      return null
    } catch (error) {
      console.error("Error getting current user: ", error)
      return null
    }
  }

  async isSignedIn(): Promise<boolean> {
    return GoogleSignin.isSignedIn()
  }
}

export const googleAuthService = new GoogleAuthService()
