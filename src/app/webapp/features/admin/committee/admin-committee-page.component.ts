import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommitteeMemberDocument } from '../../../../core/firebase/models/firestore-data.models';
import { CommitteeAdminService } from './committee-admin.service';

@Component({ selector: 'app-admin-committee-page', standalone: true, imports: [RouterLink], template: `
<section class="admin-content"><header><div><p class="eyebrow">Website content</p><h1>Committee</h1></div><a routerLink="new">Add member</a></header>
@if (loading()) { <p>Loading committee members…</p> } @else if (error()) { <p role="alert">{{ error() }}</p> }
@else if (!members().length) { <p>No committee members have been added.</p> }
@for (member of members(); track member.id) { <article><div><strong>{{ member.name }}</strong><p>{{ member.role }} · {{ member.publicationState }}</p></div><a [routerLink]="[member.id, 'edit']">Edit</a><button type="button" (click)="remove(member)">Delete</button></article> }</section>
`, styles: [`.admin-content{display:grid;gap:1rem}header,article{display:flex;align-items:center;justify-content:space-between;gap:1rem}article{padding:1rem;background:#fff;border:1px solid #ddd}`] })
export class AdminCommitteePageComponent implements OnInit {
  readonly members=signal<CommitteeMemberDocument[]>([]); readonly loading=signal(true); readonly error=signal('');
  constructor(private readonly admin: CommitteeAdminService) {} async ngOnInit(){await this.refresh();}
  async remove(member:CommitteeMemberDocument){if(confirm(`Delete “${member.name}”?`)){await this.admin.remove(member.id);await this.refresh();}}
  private async refresh(){this.loading.set(true);try{this.members.set((await this.admin.list()).sort((a,b)=>a.displayOrder-b.displayOrder));}catch(e){this.error.set(e instanceof Error?e.message:'Committee could not be loaded.');}finally{this.loading.set(false);}}
}
