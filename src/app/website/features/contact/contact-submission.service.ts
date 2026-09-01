import { Injectable } from '@angular/core';
import { firebaseClient } from '../../../core/firebase/firebase.client';

export interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  website?: string;
}

interface CallableResponse { result?: { ok: boolean }; data?: { ok: boolean }; error?: { message?: string } }

@Injectable({ providedIn: 'root' })
export class ContactSubmissionService {
  async submit(submission: ContactSubmission): Promise<void> {
    const response = await fetch(`${firebaseClient.functionsBaseUrl}/submitContactEnquiry`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: submission })
    });
    const payload = await response.json().catch(() => ({})) as CallableResponse;
    if (!response.ok || payload.error || !(payload.result ?? payload.data)?.ok) {
      throw new Error(payload.error?.message ?? 'We could not send your message. Please try again.');
    }
  }
}
