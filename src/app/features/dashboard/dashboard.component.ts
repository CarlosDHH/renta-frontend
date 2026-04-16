import { Component, inject } from '@angular/core'
import { AsyncPipe } from '@angular/common'
import { Store } from '@ngrx/store'
import { selectUser } from '../auth/store/auth.selectors'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private store = inject(Store)
  user$ = this.store.select(selectUser)
}
