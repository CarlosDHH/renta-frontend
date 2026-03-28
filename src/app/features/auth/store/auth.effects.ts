import { inject, Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Router } from '@angular/router'
import { catchError, map, switchMap, tap } from 'rxjs/operators'
import { of } from 'rxjs'
import * as AuthActions from './auth.actions'
import { AuthService } from '../services/auth.service'
import { StorageService } from '../../../core/services/storage.service'
import { AuthUser } from './auth.state'

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions)
  private authService = inject(AuthService)
  private storageService = inject(StorageService)
  private router = inject(Router)

  rehydrate$ = createEffect(() =>
    this.actions$.pipe(
      ofType('@ngrx/effects/init'),
      map(() => {
        const accessToken = this.storageService.getAccessToken()
        const refreshToken = this.storageService.getRefreshToken()
        const user = this.storageService.getUser<AuthUser>()

        if (accessToken && refreshToken && user) {
          return AuthActions.rehydrateAuth({ user, accessToken, refreshToken })
        }
        return AuthActions.logout()
      })
    )
  )

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login({ email, password }).pipe(
          map((response) => {
            if (!response.success) {
              return AuthActions.loginFailure({ error: response.message })
            }
            return AuthActions.loginSuccess({
              user: response.data.user,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
            })
          }),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.message ?? 'Error al iniciar sesión' }))
          )
        )
      )
    )
  )

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ user, accessToken, refreshToken }) => {
        this.storageService.setTokens(accessToken, refreshToken)
        this.storageService.setUser(user)
        this.router.navigate(['/admin/dashboard'])
      })
    ),
    { dispatch: false }
  )

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.storageService.clear()
        this.router.navigate(['/auth/login'])
      })
    ),
    { dispatch: false }
  )

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      switchMap(({ refreshToken }) =>
        this.authService.refresh(refreshToken).pipe(
          map((response) => {
            if (!response.success) {
              return AuthActions.refreshTokenFailure({ error: response.message })
            }
            return AuthActions.refreshTokenSuccess({
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
            })
          }),
          catchError(() => of(AuthActions.refreshTokenFailure({ error: 'Error al renovar sesión' })))
        )
      )
    )
  )

  refreshTokenSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshTokenSuccess),
      tap(({ accessToken, refreshToken }) => {
        this.storageService.setTokens(accessToken, refreshToken)
      })
    ),
    { dispatch: false }
  )
}
