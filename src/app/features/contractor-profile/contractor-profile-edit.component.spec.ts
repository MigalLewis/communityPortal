import { TestBed } from '@angular/core/testing';
import { ContractorRepository } from '../contractor-directory/services/contractor.repository';
import { ContractorProfileEditComponent } from './contractor-profile-edit.component';

describe('ContractorProfileEditComponent validation', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [ContractorProfileEditComponent], providers: [
    { provide: ContractorRepository, useValue: { getOwned: async () => null, updateOwnedProfile: jasmine.createSpy() } }
  ] }));
  it('requires a business name, services and service areas', () => {
    const component = TestBed.createComponent(ContractorProfileEditComponent).componentInstance;
    expect(component.form.invalid).toBeTrue();
    component.form.patchValue({ businessName: 'Acme', services: 'Repair', serviceAreas: 'Central' });
    expect(component.form.valid).toBeTrue();
  });
  it('rejects non-http portfolio websites and malformed contact email', () => {
    const component = TestBed.createComponent(ContractorProfileEditComponent).componentInstance;
    component.form.patchValue({ businessName: 'Acme', services: 'Repair', serviceAreas: 'Central', website: 'acme.test', email: 'bad' });
    expect(component.form.controls.website.hasError('pattern')).toBeTrue();
    expect(component.form.controls.email.hasError('email')).toBeTrue();
  });
});
