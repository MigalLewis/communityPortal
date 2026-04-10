import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordsDoNotMatch: true };
}

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.component.html',
  styleUrl: './auth-pages.component.scss'
})
export class RegisterPageComponent {
  protected readonly isSubmitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly registerForm = this.createRegisterForm();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  private createRegisterForm() {
    return this.formBuilder.nonNullable.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: [passwordMatchValidator] }
    );
  }

  protected async submit(): Promise<void> {
    if (this.registerForm.invalid || this.isSubmitting()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.formError.set(null);
    this.isSubmitting.set(true);

    try {
      const { fullName, email, password } = this.registerForm.getRawValue();
      await this.authService.registerResident(fullName, email, password);
      await this.router.navigate(['/dashboard']);
    } catch (error: unknown) {
      this.formError.set(error instanceof Error ? error.message : 'Unable to create account right now.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

export { passwordMatchValidator };
