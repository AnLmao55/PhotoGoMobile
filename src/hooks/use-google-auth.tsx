"use client"

import { useState, useEffect } from "react"
import { googleAuthService, type GoogleUser } from "../services/google-auth"

export const useGoogleAuth = () => {
  const [user, setUser] = useState<GoogleUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    checkSignInStatus()
  }, [])

  const checkSignInStatus = async () => {
    try {
      const signedIn = await googleAuthService.isSignedIn()
      setIsSignedIn(signedIn)

      if (signedIn) {
        const currentUser = await googleAuthService.getCurrentUser()
        setUser(currentUser)
      }
    } catch (error) {
      console.error("Error checking sign in status:", error)
    }
  }

  const signIn = async () => {
    setIsLoading(true)
    try {
      const userData = await googleAuthService.signIn()
      if (userData) {
        setUser(userData)
        setIsSignedIn(true)
        return userData
      }
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      await googleAuthService.signOut()
      setUser(null)
      setIsSignedIn(false)
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    isLoading,
    isSignedIn,
    signIn,
    signOut,
  }
}
