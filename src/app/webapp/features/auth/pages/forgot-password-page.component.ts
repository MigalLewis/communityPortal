import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password-page.component.html',
  styleUrl: './auth-pages.component.scss'
})
export class ForgotPasswordPageComponent {
  protected readonly isSubmitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected forgotPasswordForm;

  constructor(private readonly formBuilder: FormBuilder, private readonly authService: AuthService) {
    this.forgotPasswordForm = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  protected async submit(): Promise<void> {
    if (this.forgotPasswordForm.invalid || this.isSubmitting()) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.formError.set(null);
    this.successMessage.set(null);
    this.isSubmitting.set(true);

    try {
      const { email } = this.forgotPasswordForm.getRawValue();
      await this.authService.forgotPassword(email);
      this.successMessage.set('Password reset email sent. Please check your inbox.');
      this.forgotPasswordForm.reset({ email: '' });
    } catch (error: unknown) {
      this.formError.set(error instanceof Error ? error.message : 'Unable to send password reset email right now.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
