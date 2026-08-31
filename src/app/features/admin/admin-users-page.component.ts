import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserDocument, UserTransitionAuditDocument } from '../../core/firebase/models/firestore-data.models';
import { UserManagementService, UserTransition } from './user-management.service';

type View = 'contractors' | 'paid' | 'active' | 'rejected' | 'deactivated';

@Component({
  selector: 'app-admin-users-page', standalone: true, imports: [CommonModule, FormsModule],
  templateUrl: './admin-users-page.component.html', styleUrl: './admin-users-page.component.scss'
})
export class AdminUsersPageComponent {
  protected readonly views: { id: View; label: string }[] = [
    { id: 'contractors', label: 'Pending contractors' }, { id: 'paid', label: 'Pending paid residents' },
    { id: 'active', label: 'Active accounts' }, { id: 'rejected', label: 'Rejected applications' },
    { id: 'deactivated', label: 'Deactivated accounts' }
  ];
  protected readonly users = signal<UserDocument[]>([]);
  protected readonly audits = signal<UserTransitionAuditDocument[]>([]);
  protected readonly selectedView = signal<View>('contractors');
  protected readonly search = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.users().filter((u) => this.inView(u) && (!q || `${u.fullName} ${u.email}`.toLowerCase().includes(q)));
  });
  protected readonly visible = computed(() => this.filtered().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize));
  protected readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));

  constructor(private readonly management: UserManagementService) { void this.load(); }

  protected choose(view: View): void { this.selectedView.set(view); this.page.set(1); }
  protected updateSearch(value: string): void { this.search.set(value); this.page.set(1); }
  protected history(userId: string): UserTransitionAuditDocument[] {
    return this.audits().filter((item) => item.userId === userId).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }
  protected async transition(user: UserDocument, action: UserTransition): Promise<void> {
    const verb = action === 'approve' ? 'approve' : action;
    if (!confirm(`Confirm you want to ${verb} ${user.fullName}?`)) return;
    const reason = prompt(`Optional reason for ${verb}:`) ?? undefined;
    this.busy.set(true); this.error.set('');
    try { await this.management.transition(user.id, action, reason); await this.load(); }
    catch (error) { this.error.set(error instanceof Error ? error.message : 'Update failed.'); }
    finally { this.busy.set(false); }
  }
  private async load(): Promise<void> {
    this.busy.set(true);
    try { const [users, audits] = await Promise.all([this.management.listUsers(), this.management.listAuditHistory()]); this.users.set(users); this.audits.set(audits); }
    catch (error) { this.error.set(error instanceof Error ? error.message : 'Unable to load accounts.'); }
    finally { this.busy.set(false); }
  }
  private inView(user: UserDocument): boolean {
    switch (this.selectedView()) {
      case 'contractors': return user.role === 'contractor' && user.status === 'pending';
      case 'paid': return user.role === 'paid_resident' && user.status === 'pending';
      case 'active': return user.status === 'active';
      case 'rejected': return user.status === 'rejected';
      case 'deactivated': return user.status === 'deactivated';
    }
  }
}
