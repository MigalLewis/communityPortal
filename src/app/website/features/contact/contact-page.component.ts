import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactSubmission, ContactSubmissionService } from './contact-submission.service';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss'
})
export class ContactPageComponent {
  protected state: 'idle' | 'sending' | 'success' | 'failure' = 'idle';

  constructor(private readonly contactSubmissions: ContactSubmissionService) {}

  protected async submit(form: NgForm): Promise<void> {
    if (this.state === 'sending') return;
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.state = 'sending';
    try {
      const { privacy: _privacy, ...submission } = form.value as ContactSubmission & { privacy: boolean };
      await this.contactSubmissions.submit(submission);
      this.state = 'success';
      form.resetForm();
    } catch {
      this.state = 'failure';
    }
  }
}
