import { ContactPageComponent } from './contact-page.component';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContactSubmissionService } from './contact-submission.service';

describe('ContactPageComponent', () => {
  const values = { name: 'Alex Resident', email: 'alex@example.com', phone: '073 123 4567',
    subject: 'General enquiry', message: 'Please contact me.', privacy: true, website: '' };

  function setup(rejection?: Error) {
    let resolvePending: (() => void) | undefined;
    const pending = new Promise<void>((resolve, reject) => rejection ? reject(rejection) : (resolvePending = resolve));
    const service = { submit: jasmine.createSpy('submit').and.returnValue(pending) };
    const component = new ContactPageComponent(service as any);
    const form = { invalid: false, value: { ...values }, control: { markAllAsTouched: jasmine.createSpy() },
      resetForm: jasmine.createSpy() } as any;
    return { component, service, form, resolvePending };
  }

  it('marks an invalid form and does not submit it', async () => {
    const { component, service, form } = setup();
    form.invalid = true;
    await (component as any).submit(form);
    expect(form.control.markAllAsTouched).toHaveBeenCalled();
    expect(service.submit).not.toHaveBeenCalled();
  });

  it('shows success and clears values only after confirmed delivery', async () => {
    const { component, service, form, resolvePending } = setup();
    const result = (component as any).submit(form);
    expect((component as any).state).toBe('sending');
    expect(form.resetForm).not.toHaveBeenCalled();
    resolvePending!();
    await result;
    expect(service.submit).toHaveBeenCalledWith(jasmine.objectContaining({ name: values.name }));
    expect((component as any).state).toBe('success');
    expect(form.resetForm).toHaveBeenCalled();
  });

  it('shows a failure when the backend rejects the request', async () => {
    const { component, form } = setup(new Error('offline'));
    await (component as any).submit(form);
    expect((component as any).state).toBe('failure');
  });

  it('prevents repeated submissions while delivery is pending', async () => {
    const { component, service, form, resolvePending } = setup();
    const first = (component as any).submit(form);
    await (component as any).submit(form);
    expect(service.submit).toHaveBeenCalledTimes(1);
    resolvePending!();
    await first;
  });

  it('preserves all entered form data after an error', async () => {
    const { component, form } = setup(new Error('backend failure'));
    await (component as any).submit(form);
    expect(form.resetForm).not.toHaveBeenCalled();
    expect(form.value).toEqual(values);
  });
});

describe('ContactPageComponent privacy link', () => {
  it('opens the policy separately so entered form data remains in place', async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPageComponent],
      providers: [
        provideRouter([{ path: 'privacy', component: ContactPageComponent }]),
        { provide: ContactSubmissionService, useValue: { submit: jasmine.createSpy('submit') } }
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(ContactPageComponent);
    fixture.detectChanges();
    const name = fixture.nativeElement.querySelector('input[name="name"]') as HTMLInputElement;
    name.value = 'Alex Resident';
    name.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const policy = fixture.nativeElement.querySelector('.privacy a') as HTMLAnchorElement;

    expect(policy.getAttribute('href')).toBe('/privacy');
    expect(policy.target).toBe('_blank');
    expect(policy.rel).toContain('noopener');
    expect(name.value).toBe('Alex Resident');
  });
});
