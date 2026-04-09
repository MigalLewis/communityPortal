import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  template: `
    <section>
      <h1 class="h2">Admin</h1>
      <p class="text-body">Admin tools are available to authorized users only.</p>
    </section>
  `
})
export class AdminPageComponent {}
