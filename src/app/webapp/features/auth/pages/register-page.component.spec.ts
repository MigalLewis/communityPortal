import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../services/auth.service';
import { RegisterPageComponent, passwordMatchValidator } from './register-page.component';

describe('passwordMatchValidator', () => {
  it('accepts matching passwords', () => expect(passwordMatchValidator(new FormGroup({ password: new FormControl('StrongPass1!'), confirmPassword: new FormControl('StrongPass1!') }))).toBeNull());
  it('rejects different passwords', () => expect(passwordMatchValidator(new FormGroup({ password: new FormControl('StrongPass1!'), confirmPassword: new FormControl('DifferentPass2!') }))).toEqual({ passwordsDoNotMatch: true }));
});

describe('RegisterPageComponent forms', () => {
  const auth = jasmine.createSpyObj<AuthService>('AuthService', ['register', 'retryProfileCreation']);
  const router = jasmine.createSpyObj<Router>('Router', ['navigate']);

  function component(accountType?: string): any {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [RegisterPageComponent], providers: [
      { provide: AuthService, useValue: auth }, { provide: Router, useValue: router },
      { provide: ActivatedRoute, useValue: { snapshot: { data: accountType ? { accountType } : {} } } }
    ] });
    return TestBed.createComponent(RegisterPageComponent).componentInstance;
  }

  it('uses /register as an account-type selection page', () => expect(component().accountType).toBeNull());

  it('requires all shared fields and terms', () => {
    const instance = component('resident');
    instance.registerForm.patchValue({ fullName: 'Rita', email: 'rita@example.com', phone: '5551234', password: 'secret1', confirmPassword: 'secret1' });
    expect(instance.registerForm.invalid).toBeTrue();
    instance.registerForm.controls.acceptedTerms.setValue(true);
    expect(instance.registerForm.valid).toBeTrue();
  });

  it('requires contractor business and verification metadata', () => {
    const instance = component('contractor');
    expect(instance.registerForm.controls.businessName.hasError('required')).toBeTrue();
    expect(instance.registerForm.controls.verificationDocumentReference.hasError('required')).toBeTrue();
  });
});
