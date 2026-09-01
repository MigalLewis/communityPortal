import { Component } from '@angular/core';

interface EmergencyContact {
  label: string;
  number: string;
  telephone: string;
}

@Component({
  selector: 'app-security-page',
  standalone: true,
  templateUrl: './security-page.component.html',
  styleUrl: './security-page.component.scss'
})
export class SecurityPageComponent {
  protected readonly emergencyContacts: EmergencyContact[] = [
    { label: '24/7 Security', number: '011 555 1234', telephone: '0115551234' },
    { label: 'Parkview SAPS', number: '011 067 6000', telephone: '0110676000' },
    { label: 'Flying Squad', number: '10111', telephone: '10111' },
    { label: 'Emergency Services', number: '112', telephone: '112' }
  ];
}
