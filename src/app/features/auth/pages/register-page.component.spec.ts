import { FormControl, FormGroup } from '@angular/forms';
import { passwordMatchValidator } from './register-page.component';

describe('passwordMatchValidator', () => {
  it('returns null when password and confirmPassword match', () => {
    const form = new FormGroup({
      password: new FormControl('StrongPass1!'),
      confirmPassword: new FormControl('StrongPass1!')
    });

    expect(passwordMatchValidator(form)).toBeNull();
  });

  it('returns passwordsDoNotMatch when values differ', () => {
    const form = new FormGroup({
      password: new FormControl('StrongPass1!'),
      confirmPassword: new FormControl('DifferentPass2!')
    });

    expect(passwordMatchValidator(form)).toEqual({ passwordsDoNotMatch: true });
  });
});
