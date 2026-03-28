export interface AuthUser {
  id: string
  name: string
  lastName: string
  email: string
  role: string
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
}

export const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
}
