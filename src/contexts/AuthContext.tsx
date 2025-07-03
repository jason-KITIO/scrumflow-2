import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types'
import { db } from '../lib/database'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: { name: string; email: string; password: string; role: User['role'] }) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize database with sample data
    db.initializeData()
    
    // Check if user is already logged in
    const savedUserId = localStorage.getItem('currentUserId')
    if (savedUserId) {
      const savedUser = db.getUserById(savedUserId)
      if (savedUser) {
        setUser(savedUser)
      } else {
        localStorage.removeItem('currentUserId')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = db.authenticateUser(email, password)
      if (authenticatedUser) {
        setUser(authenticatedUser)
        localStorage.setItem('currentUserId', authenticatedUser.id)
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (userData: { name: string; email: string; password: string; role: User['role'] }): Promise<boolean> => {
    try {
      const existingUser = db.getUserByEmail(userData.email)
      if (existingUser) {
        return false // User already exists
      }

      const newUser = db.createUser({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        status: 'active'
      })

      // Set password for the new user
      db.setUserPassword(newUser.id, userData.password)

      setUser(newUser)
      localStorage.setItem('currentUserId', newUser.id)
      return true
    } catch (error) {
      console.error('Register error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUserId')
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}