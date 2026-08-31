import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, ProfileOnboardingRequiredError, PublicRegistration } from '../services/auth.service';
import { PublicRegistrationRole } from '../services/user-profile.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('confirmPassword')?.value;
  return !password || !confirmation || password === confirmation ? null : { passwordsDoNotMatch: true };
}

@Component({
  selector: 'app-register-page', standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.component.html', styleUrl: './auth-pages.component.scss'
})
export class RegisterPageComponent {
  protected readonly isSubmitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly needsProfileRetry = signal(false);
  protected readonly accountType: PublicRegistrationRole | null;
  protected readonly registerForm;

  constructor(formBuilder: FormBuilder, private readonly authService: AuthService,
              private readonly router: Router, route: ActivatedRoute) {
    const routeType = route.snapshot.data['accountType'] as string | undefined;
    this.accountType = routeType === 'paid-resident' ? 'paid_resident'
      : routeType === 'resident' || routeType === 'contractor' ? routeType : null;
    this.registerForm = formBuilder.nonNullable.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]], phone: ['', [Validators.required, Validators.minLength(7)]],
      password: ['', [Validators.required, Validators.minLength(6)]], confirmPassword: ['', Validators.required],
      acceptedTerms: [false, Validators.requiredTrue], businessName: [''], serviceCategories: [''], serviceAreas: [''],
      businessDescription: [''], businessContactEmail: ['', Validators.email], businessContactPhone: [''],
      businessWebsite: [''], verificationDocumentName: [''], verificationDocumentType: [''], verificationDocumentReference: ['']
    }, { validators: passwordMatchValidator });
    if (this.accountType === 'contractor') {
      for (const name of ['businessName', 'serviceCategories', 'serviceAreas', 'businessDescription',
        'businessContactEmail', 'businessContactPhone', 'verificationDocumentName',
        'verificationDocumentType', 'verificationDocumentReference'] as const) {
        this.registerForm.controls[name].addValidators(Validators.required);
      }
    }
  }

  protected async submit(): Promise<void> {
    if (!this.accountType || this.registerForm.invalid || this.isSubmitting()) {
      this.registerForm.markAllAsTouched(); return;
    }
    this.formError.set(null); this.isSubmitting.set(true);
    const registration = this.registrationValue();
    try {
      if (this.needsProfileRetry()) await this.authService.retryProfileCreation(registration);
      else await this.authService.register(registration);
      await this.router.navigate(['/dashboard']);
    } catch (error: unknown) {
      if (error instanceof ProfileOnboardingRequiredError) this.needsProfileRetry.set(true);
      this.formError.set(error instanceof Error ? error.message : 'Unable to create account right now.');
    } finally { this.isSubmitting.set(false); }
  }

  private registrationValue(): PublicRegistration {
    const value = this.registerForm.getRawValue();
    const split = (input: string) => input.split(',').map((item) => item.trim()).filter(Boolean);
    return {
      role: this.accountType!, fullName: value.fullName.trim(), email: value.email.trim(), password: value.password,
      phone: value.phone.trim(), acceptedTermsAt: new Date().toISOString(),
      ...(this.accountType === 'contractor' ? {
        businessName: value.businessName.trim(), serviceCategories: split(value.serviceCategories),
        serviceAreas: split(value.serviceAreas), businessDescription: value.businessDescription.trim(),
        businessContactEmail: value.businessContactEmail.trim(), businessContactPhone: value.businessContactPhone.trim(),
        businessWebsite: value.businessWebsite.trim(), verificationDocumentName: value.verificationDocumentName.trim(),
        verificationDocumentType: value.verificationDocumentType.trim(),
        verificationDocumentReference: value.verificationDocumentReference.trim()
      } : {})
    };
  }
}

export { passwordMatchValidator };
