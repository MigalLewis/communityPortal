import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { UserProfileService } from '../auth/services/user-profile.service';
import { ProviderAdminService } from './provider-admin.service';
import { ProviderImportService } from './provider-import.service';
import { ALLOWED_AVAILABILITY, splitMultiValue, toServiceProviderDocument } from './provider-import.util';
import { ProviderImportRowResult } from './provider-import.models';

@Component({
  selector: 'app-admin-providers-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-providers-page.component.html',
  styleUrl: './admin-providers-page.component.scss'
})
export class AdminProvidersPageComponent {
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly isParsing = signal(false);
  protected readonly isImporting = signal(false);
  protected readonly importRows = signal<ProviderImportRowResult[]>([]);
  protected readonly parseError = signal<string | null>(null);
  protected readonly importMessage = signal<string | null>(null);
  protected readonly knownCategoryMap = signal<Record<string, string>>({});

  protected readonly summary = computed(() => ({
    totalRows: this.importRows().length,
    validRows: this.importRows().filter((row) => row.isValid).length,
    invalidRows: this.importRows().filter((row) => !row.isValid).length,
    warningCount: this.importRows().reduce((total, row) => total + row.warnings.length, 0),
    errorCount: this.importRows().reduce((total, row) => total + row.errors.length, 0)
  }));

  protected readonly manualProviderForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required]],
    businessName: [''],
    email: ['', [Validators.email]],
    phone: ['', [Validators.required]],
    alternatePhone: [''],
    whatsappNumber: [''],
    area: ['', [Validators.required]],
    suburb: [''],
    address: [''],
    categories: ['', [Validators.required]],
    bio: [''],
    tags: [''],
    isVerified: [false],
    isFeatured: [false],
    availabilityStatus: ['available_today', [Validators.required]],
    notes: [''],
    website: [''],
    facebookUrl: [''],
    instagramUrl: ['']
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly providerImportService: ProviderImportService,
    private readonly providerAdminService: ProviderAdminService,
    private readonly authService: AuthService,
    private readonly userProfileService: UserProfileService
  ) {
    this.loadCategoryMap();
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.item(0);
    if (file) {
      this.useSelectedFile(file);
    }
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);

    if (file) {
      this.useSelectedFile(file);
    }
  }

  protected async parseUpload(): Promise<void> {
    if (!this.selectedFile() || this.isParsing()) {
      return;
    }

    this.parseError.set(null);
    this.importMessage.set(null);
    this.isParsing.set(true);

    try {
      const rows = await this.providerImportService.parseFile(this.selectedFile()!);
      const duplicateProbe = await this.providerAdminService.findPotentialDuplicateKeys(this.idToken);
      const result = this.providerImportService.validateRows(rows, this.knownCategoryMap(), duplicateProbe);
      this.importRows.set(result.rows);
    } catch (error: unknown) {
      this.parseError.set(error instanceof Error ? error.message : 'Unable to parse selected file.');
      this.importRows.set([]);
    } finally {
      this.isParsing.set(false);
    }
  }

  protected clearImport(): void {
    this.selectedFile.set(null);
    this.importRows.set([]);
    this.parseError.set(null);
    this.importMessage.set(null);
  }

  protected downloadTemplate(): void {
    this.providerImportService.downloadCsvTemplate();
  }

  protected async importValidRows(): Promise<void> {
    if (this.isImporting()) {
      return;
    }

    const validRows = this.importRows().filter((row) => row.isValid);
    if (!validRows.length) {
      return;
    }

    this.isImporting.set(true);
    this.importMessage.set(null);

    try {
      const adminUser = this.userProfileService.getCurrentUserProfile();
      if (!adminUser) {
        throw new Error('Current admin user is unavailable. Please log in again.');
      }

      const documents = validRows.map((row) =>
        toServiceProviderDocument(row.normalized, {
          adminUserId: adminUser.id,
          categoryNameToIdMap: this.knownCategoryMap()
        }).document
      );

      const result = await this.providerAdminService.importProviders(documents, this.idToken);
      this.importMessage.set(`Imported ${result.successCount} provider(s). Failed: ${result.failed.length}.`);
    } catch (error: unknown) {
      this.importMessage.set(error instanceof Error ? error.message : 'Failed to import providers.');
    } finally {
      this.isImporting.set(false);
    }
  }

  protected async saveSingleProvider(): Promise<void> {
    if (this.manualProviderForm.invalid) {
      this.manualProviderForm.markAllAsTouched();
      return;
    }

    const adminUser = this.userProfileService.getCurrentUserProfile();
    if (!adminUser) {
      this.importMessage.set('Current admin user is unavailable. Please log in again.');
      return;
    }

    const value = this.manualProviderForm.getRawValue();
    const built = toServiceProviderDocument(
      {
        rowNumber: 1,
        fullName: value.fullName.trim(),
        businessName: value.businessName.trim(),
        email: value.email.trim(),
        phone: value.phone.trim(),
        alternatePhone: value.alternatePhone.trim(),
        whatsappNumber: value.whatsappNumber.trim(),
        area: value.area.trim(),
        suburb: value.suburb.trim(),
        address: value.address.trim(),
        categoryNames: splitMultiValue(value.categories),
        bio: value.bio.trim(),
        tags: splitMultiValue(value.tags),
        isVerified: value.isVerified,
        isFeatured: value.isFeatured,
        availabilityStatus: value.availabilityStatus,
        notes: value.notes.trim(),
        website: value.website.trim(),
        facebookUrl: value.facebookUrl.trim(),
        instagramUrl: value.instagramUrl.trim()
      },
      {
        adminUserId: adminUser.id,
        categoryNameToIdMap: this.knownCategoryMap()
      }
    );

    await this.providerAdminService.createSingleProvider(built.document, this.idToken);
    this.importMessage.set('Provider saved successfully.');
    this.manualProviderForm.reset({
      fullName: '',
      businessName: '',
      email: '',
      phone: '',
      alternatePhone: '',
      whatsappNumber: '',
      area: '',
      suburb: '',
      address: '',
      categories: '',
      bio: '',
      tags: '',
      isVerified: false,
      isFeatured: false,
      availabilityStatus: 'available_today',
      notes: '',
      website: '',
      facebookUrl: '',
      instagramUrl: ''
    });
  }

  protected resetManualForm(): void {
    this.manualProviderForm.reset({
      fullName: '',
      businessName: '',
      email: '',
      phone: '',
      alternatePhone: '',
      whatsappNumber: '',
      area: '',
      suburb: '',
      address: '',
      categories: '',
      bio: '',
      tags: '',
      isVerified: false,
      isFeatured: false,
      availabilityStatus: 'available_today',
      notes: '',
      website: '',
      facebookUrl: '',
      instagramUrl: ''
    });
  }

  protected availabilityOptions = ALLOWED_AVAILABILITY;

  private get idToken(): string | undefined {
    return this.authService.authUser()?.idToken;
  }

  private async loadCategoryMap(): Promise<void> {
    const categoryMap = await this.providerAdminService.getCategoryNameMap(this.idToken);
    this.knownCategoryMap.set(categoryMap);
  }

  private useSelectedFile(file: File): void {
    this.selectedFile.set(file);
    this.parseError.set(null);
    this.importMessage.set(null);
  }
}
