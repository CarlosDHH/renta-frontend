import { createReducer, on } from '@ngrx/store'
import { initialAuthState } from './auth.state'
import * as AuthActions from './auth.actions'

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.rehydrateAuth, (state, { user, accessToken, refreshToken }) => ({
    ...state,
    user,
    accessToken,
    refreshToken,
  })),

  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { user, accessToken, refreshToken }) => ({
    ...state,
    user,
    accessToken,
    refreshToken,
    loading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AuthActions.logout, () => initialAuthState),

  on(AuthActions.refreshTokenSuccess, (state, { accessToken, refreshToken }) => ({
    ...state,
    accessToken,
    refreshToken,
  })),

  on(AuthActions.refreshTokenFailure, (state) => initialAuthState),
  
  on(AuthActions.clearAuth, () => initialAuthState),
)
