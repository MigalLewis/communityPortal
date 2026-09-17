import { Injectable } from '@angular/core';
import {
  CategoryDocument,
  ContractorDocument,
  ServiceProviderDocument
} from '../../../core/firebase/models/firestore-data.models';
import { FirestoreDataService } from '../../../core/firebase/services/firestore-data.service';
import { AuthService } from '../auth/services/auth.service';
import { UserProfileService } from '../auth/services/user-profile.service';

export interface CategoryInput {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

export interface CategoryDependencies {
  contractors: number;
  serviceProviders: number;
}

export function normalizeCategorySlug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable({ providedIn: 'root' })
export class AdminCategoryService {
  constructor(
    private readonly data: FirestoreDataService,
    private readonly auth: AuthService,
    private readonly profiles: UserProfileService
  ) {}

  async list(): Promise<CategoryDocument[]> {
    return (await this.data.categories.list(this.adminToken())).sort((a, b) => a.name.localeCompare(b.name));
  }

  async create(input: CategoryInput): Promise<CategoryDocument> {
    const token = this.adminToken();
    const categories = await this.data.categories.list(token);
    const slug = this.validatedSlug(input, categories);
    const now = new Date().toISOString();
    return this.data.categories.upsert({
      id: crypto.randomUUID(),
      ...this.clean(input),
      slug,
      createdAt: now,
      updatedAt: now
    }, token);
  }

  async update(existing: CategoryDocument, input: CategoryInput): Promise<CategoryDocument> {
    const token = this.adminToken();
    const categories = await this.data.categories.list(token);
    const slug = this.validatedSlug(input, categories, existing.id);
    return this.data.categories.upsert({ ...existing, ...this.clean(input), slug }, token);
  }

  async setActive(category: CategoryDocument, isActive: boolean): Promise<CategoryDocument> {
    return this.data.categories.upsert({ ...category, isActive }, this.adminToken());
  }

  async dependencies(categoryId: string): Promise<CategoryDependencies> {
    const token = this.adminToken();
    const [contractors, providers] = await Promise.all([
      this.data.contractors.list(token),
      this.data.serviceProviders.list(token)
    ]);
    return {
      contractors: this.references(contractors, categoryId),
      serviceProviders: this.references(providers, categoryId)
    };
  }

  async remove(category: CategoryDocument): Promise<void> {
    const token = this.adminToken();
    const dependencies = await this.dependencies(category.id);
    if (dependencies.contractors || dependencies.serviceProviders) {
      throw new Error(
        `This category is in use by ${dependencies.contractors} contractor(s) and ${dependencies.serviceProviders} service provider(s). Deactivate it instead.`
      );
    }
    await this.data.categories.remove(category.id, token);
  }

  private references(items: Array<ContractorDocument | ServiceProviderDocument>, categoryId: string): number {
    return items.filter((item) => item.categoryIds.includes(categoryId)).length;
  }

  private validatedSlug(input: CategoryInput, categories: CategoryDocument[], currentId?: string): string {
    if (!input.name.trim()) throw new Error('Name is required.');
    const slug = normalizeCategorySlug(input.slug?.trim() || input.name);
    if (!slug) throw new Error('Enter a name or slug containing letters or numbers.');
    if (categories.some((category) => category.id !== currentId && normalizeCategorySlug(category.slug) === slug)) {
      throw new Error('Slug is already in use. Choose a unique slug.');
    }
    return slug;
  }

  private clean(input: CategoryInput): CategoryInput {
    return {
      name: input.name.trim(),
      description: input.description?.trim() || '',
      icon: input.icon?.trim() || '',
      isActive: input.isActive
    };
  }

  private adminToken(): string {
    const user = this.auth.authUser();
    if (!this.auth.isAuthenticated() || !this.profiles.isAdmin() || !user?.idToken) {
      throw new Error('Administrator access is required.');
    }
    return user.idToken;
  }
}
