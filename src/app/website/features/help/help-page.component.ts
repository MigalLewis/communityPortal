import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
  link?: { label: string; route: string };
}

@Component({
  selector: 'app-help-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.scss'
})
export class HelpPageComponent {
  protected readonly categories = [
    'Membership',
    'Security',
    'Municipal Services',
    'Town Planning & Heritage',
    'Community',
    'General'
  ];

  protected readonly faqs: FaqItem[] = [
    { category: 'Membership', question: 'What does PNRA membership cost?', answer: 'Membership fees are determined annually at our AGM. Contact the PNRA team for the current household, business and complex rates, or view the membership page for payment options.', link: { label: 'View membership details', route: '/membership' } },
    { category: 'Membership', question: 'How do I pay for my membership?', answer: 'Membership can be paid by EFT using the banking details supplied on your invoice. Please use your street address or invoice number as the payment reference.' },
    { category: 'Membership', question: 'How do I check my membership status?', answer: 'Email our administration team with your name and property address. We will confirm your status and resend your latest invoice if required.' },
    { category: 'Membership', question: 'What is the membership period?', answer: 'PNRA membership is renewed annually. Your renewal notice will confirm the applicable period, fee and payment date.' },
    { category: 'Security', question: 'Who do I contact in an emergency?', answer: 'Call the relevant emergency service first. PNRA keeps the latest neighbourhood security and emergency contact information on our security page.', link: { label: 'View security contacts', route: '/security' } },
    { category: 'Security', question: 'Is the security scheme included in PNRA membership?', answer: 'No. PNRA membership supports civic, planning, heritage and community work. Security services are offered separately by the appointed security provider and require their own subscription.' },
    { category: 'Municipal Services', question: 'How do I report a municipal fault?', answer: 'Log the fault directly with the City of Johannesburg and keep the reference number. If a persistent issue affects the wider neighbourhood, send the reference to PNRA so that we can help escalate it.' },
    { category: 'Municipal Services', question: 'Can PNRA resolve billing queries?', answer: 'PNRA cannot access individual municipal accounts, but we can point you to the correct City channel and highlight trends affecting multiple residents.' },
    { category: 'Town Planning & Heritage', question: 'Do I need approval before renovating a heritage property?', answer: 'Many Parktown North properties have heritage considerations. Consult the applicable guidelines and authorities before work starts, and contact PNRA early if you need help understanding the process.', link: { label: 'Browse planning resources', route: '/resources' } },
    { category: 'Community', question: 'How can I get involved in neighbourhood projects?', answer: 'You can volunteer at an event, support a current project or propose an initiative to the committee. Project and event pages are updated as opportunities become available.', link: { label: 'Explore community projects', route: '/projects' } },
    { category: 'General', question: 'How do I contact PNRA?', answer: 'Email parktownnorthra@gmail.com or call 073 633 4560. Include your property address and as much detail as possible so we can direct your enquiry.' },
    { category: 'General', question: 'Where can I find forms, minutes and policies?', answer: 'The resource library contains membership forms, planning guidance, AGM documents, by-laws and governance information.', link: { label: 'Open the resource library', route: '/resources' } }
  ];

  protected activeCategory = 'Membership';
  protected query = '';
  protected openQuestion = this.faqs[0].question;

  protected get visibleFaqs(): FaqItem[] {
    const query = this.query.trim().toLowerCase();
    return this.faqs.filter((faq) => {
      const matchesCategory = !query && faq.category === this.activeCategory;
      const matchesSearch = !!query && `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase().includes(query);
      return matchesCategory || matchesSearch;
    });
  }

  protected get heading(): string {
    return this.query.trim() ? 'Search results' : `${this.activeCategory} FAQs`;
  }

  protected selectCategory(category: string): void {
    this.activeCategory = category;
    this.query = '';
    this.openQuestion = this.faqs.find((faq) => faq.category === category)?.question ?? '';
  }

  protected updateSearch(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
    this.openQuestion = '';
  }

  protected toggle(faq: FaqItem): void {
    this.openQuestion = this.openQuestion === faq.question ? '' : faq.question;
  }
}
