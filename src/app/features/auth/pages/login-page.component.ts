import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './auth-pages.component.scss'
})
export class LoginPageComponent {
  protected readonly isSubmitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected loginForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });
  }

  protected async submit(): Promise<void> {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.formError.set(null);
    this.isSubmitting.set(true);

    try {
      const { email, password } = this.loginForm.getRawValue();
      await this.authService.login(email, password);
      await this.router.navigate(['/dashboard']);
    } catch (error: unknown) {
      this.formError.set(error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
