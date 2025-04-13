import { getFirebase } from './firebase-init'
import { onDisconnect, onConnect, enableNetwork, disableNetwork } from 'firebase/firestore'

let isOnline = true
let isInitialized = false

export const initConnectionState = async () => {
  if (isInitialized) return
  
  try {
    const { db } = getFirebase()
    
    // Monitor connection state
    onConnect(db, () => {
      isOnline = true
      console.log('Firebase connection established')
    })

    onDisconnect(db, () => {
      isOnline = false
      console.log('Firebase connection lost')
    })

    // Ensure network is enabled
    await enableNetwork(db)
    isOnline = true
    isInitialized = true
    console.log('Firebase connection monitoring initialized')
  } catch (error) {
    console.error('Failed to initialize connection monitoring:', error)
  }
}

export const getConnectionState = () => isOnline

export const enableFirebaseNetwork = async () => {
  try {
    const { db } = getFirebase()
    await enableNetwork(db)
    isOnline = true
    return true
  } catch (error) {
    console.error('Failed to enable network:', error)
    return false
  }
}

export const disableFirebaseNetwork = async () => {
  try {
    const { db } = getFirebase()
    await disableNetwork(db)
    isOnline = false
    return true
  } catch (error) {
    console.error('Failed to disable network:', error)
    return false
  }
}

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (!isOnline) {
        await enableFirebaseNetwork()
      }
      return await operation()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries')
} 