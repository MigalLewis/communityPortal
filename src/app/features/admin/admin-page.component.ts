import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section>
      <h1 class="h2">Admin</h1>
      <p class="text-body">Admin tools are available to authorized users only.</p>
      <p><a routerLink="/admin/users">Manage users and applications</a></p>
    </section>
  `
})
export class AdminPageComponent {}
