import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventDocument } from '../../../core/firebase/models/firestore-data.models';
import { PublicEventsService } from './public-events.service';

@Component({ selector:'app-events-page', standalone:true, imports:[RouterLink], templateUrl:'./events-page.component.html', styleUrl:'./events-page.component.scss' })
export class EventsPageComponent implements OnInit {
  readonly events=signal<EventDocument[]>([]); readonly loading=signal(true); readonly error=signal(''); activeFilter='All'; view:'grid'|'calendar'='grid';
  constructor(private readonly repository:PublicEventsService){}
  async ngOnInit():Promise<void>{try{this.events.set(await this.repository.list());}catch{this.error.set('Events could not be loaded. Please try again later.');}finally{this.loading.set(false);}}
  get featured():EventDocument|null{return this.repository.featured(this.upcoming);}
  get upcoming():EventDocument[]{const now=Date.now();return this.events().filter(e=>new Date(e.endAt).getTime()>=now);}
  get past():EventDocument[]{const now=Date.now();return this.events().filter(e=>new Date(e.endAt).getTime()<now).sort((a,b)=>b.startAt.localeCompare(a.startAt));}
  get filters():string[]{return ['All',...new Set(this.upcoming.map(e=>e.category))];}
  get filteredEvents():EventDocument[]{const featured=this.featured;return this.upcoming.filter(e=>e.id!==featured?.id&&(this.activeFilter==='All'||e.category===this.activeFilter));}
  selectFilter(filter:string):void{this.activeFilter=filter;}
  month(e:EventDocument):string{return new Intl.DateTimeFormat('en-ZA',{month:'short'}).format(new Date(e.startAt));}
  day(e:EventDocument):string{return new Intl.DateTimeFormat('en-ZA',{day:'2-digit'}).format(new Date(e.startAt));}
  time(e:EventDocument):string{const f=new Intl.DateTimeFormat('en-ZA',{hour:'2-digit',minute:'2-digit'});return `${f.format(new Date(e.startAt))} – ${f.format(new Date(e.endAt))}`;}
  addToCalendar(e:EventDocument):void{const stamp=(v:string)=>new Date(v).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const esc=(v:string)=>v.replace(/([,;\\])/g,'\\$1').replace(/\n/g,'\\n');const content=['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT',`UID:${e.id}@parktownnorth.org`,`DTSTART:${stamp(e.startAt)}`,`DTEND:${stamp(e.endAt)}`,`SUMMARY:${esc(e.title)}`,`LOCATION:${esc(e.venue)}`,`DESCRIPTION:${esc(e.description)}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([content],{type:'text/calendar'}));link.download=`${e.slug}.ics`;link.click();URL.revokeObjectURL(link.href);}
}
