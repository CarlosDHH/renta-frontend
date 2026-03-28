import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http'
import { inject } from '@angular/core'
import { Store } from '@ngrx/store'
import { catchError, switchMap, throwError } from 'rxjs'
import { selectAccessToken, selectRefreshToken } from '../../features/auth/store/auth.selectors'
import { logout, refreshToken } from '../../features/auth/store/auth.actions'
import { take } from 'rxjs/operators'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store)

  return store.select(selectAccessToken).pipe(
    take(1),
    switchMap((token) => {
      const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req

      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            return store.select(selectRefreshToken).pipe(
              take(1),
              switchMap((refresh) => {
                if (refresh) {
                  store.dispatch(refreshToken({ refreshToken: refresh }))
                } else {
                  store.dispatch(logout())
                }
                return throwError(() => error)
              })
            )
          }
          return throwError(() => error)
        })
      )
    })
  )
}
