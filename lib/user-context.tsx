"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { appConfig } from './app-config'

interface User {
  id: string
  email?: string
  name?: string
  credits: number
  plan: 'free' | 'pro' | 'enterprise'
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  updateUser: (updates: Partial<User>) => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize user - in a real app, this would check authentication
    const initializeUser = () => {
      // For now, create a session-based user
      let sessionUser = sessionStorage.getItem(appConfig.user.sessionKey)
      
      if (!sessionUser) {
        const newUser: User = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          credits: appConfig.user.defaultCredits,
          plan: appConfig.user.defaultPlan
        }
        sessionUser = JSON.stringify(newUser)
        sessionStorage.setItem(appConfig.user.sessionKey, sessionUser)
      }
      
      setUser(JSON.parse(sessionUser))
      setIsLoading(false)
    }

    initializeUser()
  }, [])

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      sessionStorage.setItem(appConfig.user.sessionKey, JSON.stringify(updatedUser))
    }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem(appConfig.user.sessionKey)
  }

  return (
    <UserContext.Provider value={{ user, isLoading, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}