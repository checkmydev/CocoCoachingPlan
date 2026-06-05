import { createContext, useContext } from 'react'
const AuthContext = createContext(null)
export function AuthProvider({ children }) { return <AuthContext.Provider value={{ session: null, profile: null, loading: false }}>{children}</AuthContext.Provider> }
export const useAuth = () => useContext(AuthContext)
