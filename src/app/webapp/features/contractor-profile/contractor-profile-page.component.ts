import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, from, map, of, startWith, switchMap } from 'rxjs';
import { Contractor } from '../contractor-directory/models/contractor.model';
import { ContractorRepository } from '../contractor-directory/services/contractor.repository';
import { AuthService } from '../auth/services/auth.service';

interface Vm { state: 'loading' | 'not-found' | 'ready'; contractor?: Contractor; }
@Component({ selector: 'app-contractor-profile-page', standalone: true, imports: [CommonModule, RouterLink],
  templateUrl: './contractor-profile-page.component.html', styleUrl: './contractor-profile-page.component.scss' })
export class ContractorProfilePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly repository = inject(ContractorRepository);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly profileVm$ = this.route.paramMap.pipe(map((params) => params.get('id')?.trim() ?? ''),
    switchMap((id) => id ? from(this.repository.getPublicById(id)).pipe(map((contractor): Vm => contractor ? { state: 'ready', contractor } : { state: 'not-found' })) : of<Vm>({ state: 'not-found' })),
    startWith<Vm>({ state: 'loading' }), catchError(() => of<Vm>({ state: 'not-found' })));

  protected selectAction(contractorId: string, action: 'hire' | 'rate'): void {
    const destination = this.router.createUrlTree(['/projects'], { queryParams: { action, contractorId } }).toString();
    void this.router.navigateByUrl(this.auth.isAuthenticated()
      ? destination
      : this.router.createUrlTree(['/login'], { queryParams: { redirectTo: destination } }));
  }
}
