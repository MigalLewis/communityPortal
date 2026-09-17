import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

/** Controlled file picker: parents own selection and perform the actual upload. */
@Component({
  selector: 'app-file-upload',
  standalone: true,
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent {
  @Input() label = 'Upload file';
  @Input() hint = 'Choose a file or drag and drop it here.';
  @Input() accept = '';
  @Input() multiple = false;
  @Input() disabled = false;
  @Input() files: readonly File[] = [];
  @Input() maxFiles = 0;
  @Input() maxFileSize = 0;
  @Output() filesChange = new EventEmitter<File[]>();
  @Output() selectionError = new EventEmitter<string>();
  protected readonly dragging = signal(false);
  protected readonly error = signal('');
  private dragDepth = 0;

  protected choose(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = ''; // Allow choosing the same file again after clearing.
    if (files.length) this.select(files);
  }

  protected enter(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled) { this.dragDepth++; this.dragging.set(true); }
  }

  protected leave(event: DragEvent): void {
    event.preventDefault();
    if (--this.dragDepth <= 0) { this.dragDepth = 0; this.dragging.set(false); }
  }

  protected over(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = this.disabled ? 'none' : 'copy';
  }

  protected drop(event: DragEvent): void {
    event.preventDefault();
    this.dragDepth = 0;
    this.dragging.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length) this.select(files);
  }

  protected clear(): void {
    if (this.disabled) return;
    this.error.set('');
    this.selectionError.emit('');
    this.filesChange.emit([]);
  }

  protected sizeLabel(bytes: number): string {
    return bytes < 1_000_000 ? `${Math.max(1, Math.round(bytes / 1000))} KB` : `${(bytes / 1_000_000).toFixed(1)} MB`;
  }

  private select(files: File[]): void {
    if (this.disabled) return;
    const types = this.accept.split(',').map(type => type.trim().toLowerCase()).filter(Boolean);
    const invalidType = files.some(file => types.length && !types.some(type =>
      type.startsWith('.') ? file.name.toLowerCase().endsWith(type)
        : type.endsWith('/*') ? file.type.toLowerCase().startsWith(type.slice(0, -1))
          : file.type.toLowerCase() === type));
    const limit = this.multiple ? this.maxFiles : 1;
    const message = limit && files.length > limit ? `Choose up to ${limit} ${limit === 1 ? 'file' : 'files'}.`
      : invalidType ? 'This file type is not supported. ' + this.hint
      : this.maxFileSize && files.some(file => file.size > this.maxFileSize) ? `Each file must be ${this.sizeLabel(this.maxFileSize)} or smaller.` : '';
    this.error.set(message);
    this.selectionError.emit(message);
    if (!message) this.filesChange.emit(files);
  }
}
