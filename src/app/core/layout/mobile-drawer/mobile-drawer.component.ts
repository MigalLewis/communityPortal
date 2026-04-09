import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-mobile-drawer',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './mobile-drawer.component.html',
  styleUrl: './mobile-drawer.component.scss'
})
export class MobileDrawerComponent {
  @Input({ required: true }) isOpen = false;
  @Output() closed = new EventEmitter<void>();

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Projects', route: '/projects' },
    { label: 'Work Orders', route: '/work-orders' },
    { label: 'Settings', route: '/settings' }
  ];

  protected close(): void {
    this.closed.emit();
  }
}
