import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface MembershipOption {
  readonly id: string;
  readonly name: string;
  readonly price: string;
  readonly period: string;
  readonly detail?: string;
  readonly description: string;
  readonly featured?: boolean;
}

@Component({
  selector: 'app-membership-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './membership-page.component.html',
  styleUrl: './membership-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipPageComponent {
  protected readonly membershipOptions: readonly MembershipOption[] = [
    {
      id: 'freehold',
      name: 'Freehold',
      price: 'R1,450',
      period: '/ yr',
      description: 'Or R125 per month via debit order. Ideal for standard residential properties.'
    },
    {
      id: 'business',
      name: 'Business',
      price: 'R750',
      period: '/ mo',
      description: 'For local businesses operating within the Parktown North precinct.',
      featured: true
    },
    {
      id: 'sectional-title',
      name: 'Sectional Title',
      price: 'R750',
      period: '/ mo base',
      detail: '+ R10 per unit / yr',
      description: 'For Body Corporates and complexes managing multiple units.'
    }
  ];
}
