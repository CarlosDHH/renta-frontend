import { Injectable, signal } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class NetworkService {
  isOnline = signal(navigator.onLine)

  constructor() {
    window.addEventListener('online', () => {
      console.log('Conexión restaurada')
      this.isOnline.set(true)
    })

    window.addEventListener('offline', () => {
      console.log('Sin conexión')
      this.isOnline.set(false)
    })
  }
}
