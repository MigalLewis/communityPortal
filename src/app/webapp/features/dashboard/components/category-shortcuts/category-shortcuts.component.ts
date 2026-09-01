import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ShortcutTile {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-category-shortcuts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-shortcuts.component.html',
  styleUrl: './category-shortcuts.component.scss'
})
export class CategoryShortcutsComponent {
  @Input() tiles: ShortcutTile[] = [];
}
