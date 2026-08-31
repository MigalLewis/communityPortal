import { Injectable } from '@angular/core';
import { firebaseClient } from '../firebase.client';

interface CallableResponse<T> { result?: T; data?: T; error?: { message?: string }; }

@Injectable({ providedIn: 'root' })
export class FirebaseFunctionsService {
  async call<T>(name: string, data: unknown, idToken: string): Promise<T> {
    const response = await fetch(`${firebaseClient.functionsBaseUrl}/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ data })
    });
    const payload = await response.json() as CallableResponse<T>;
    if (!response.ok || payload.error) throw new Error(payload.error?.message ?? `Unable to complete ${name}.`);
    return (payload.result ?? payload.data) as T;
  }
}
