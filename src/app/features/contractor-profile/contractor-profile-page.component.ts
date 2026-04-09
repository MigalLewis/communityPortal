import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, of, switchMap, delay, startWith, catchError } from 'rxjs';
import { MOCK_CONTRACTORS, MOCK_CONTRACTOR_PROFILES } from '../contractor-directory/data/mock-contractors';
import { Contractor, ContractorProfile } from '../contractor-directory/models/contractor.model';

interface ContractorProfileViewModel {
  state: 'loading' | 'not-found' | 'ready';
  contractor?: Contractor;
  profile?: ContractorProfile;
}

@Component({
  selector: 'app-contractor-profile-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contractor-profile-page.component.html',
  styleUrl: './contractor-profile-page.component.scss'
})
export class ContractorProfilePageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly profileVm$ = this.route.paramMap.pipe(
    map((params) => params.get('id')?.trim() ?? ''),
    switchMap((id) => {
      if (!id) {
        return of<ContractorProfileViewModel>({ state: 'not-found' });
      }

      const contractor = MOCK_CONTRACTORS.find((entry) => entry.id === id);
      const profile = MOCK_CONTRACTOR_PROFILES[id];

      if (!contractor || !profile) {
        return of<ContractorProfileViewModel>({ state: 'not-found' }).pipe(delay(450));
      }

      return of<ContractorProfileViewModel>({ state: 'ready', contractor, profile }).pipe(delay(550));
    }),
    startWith<ContractorProfileViewModel>({ state: 'loading' }),
    catchError(() => of<ContractorProfileViewModel>({ state: 'not-found' }))
  );

  trackByValue(_index: number, value: string): string {
    return value;
  }

  trackByReview(_index: number, review: { author: string; date: string }): string {
    return `${review.author}-${review.date}`;
  }
}
