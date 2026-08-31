import { Contractor, ContractorFilters } from '../models/contractor.model';

const normalize = (value: string): string => value.trim().toLowerCase();

export const filterContractors = (contractors: Contractor[], filters: ContractorFilters): Contractor[] => {
  const search = normalize(filters.search);
  const category = normalize(filters.category);
  const tag = normalize(filters.tag);
  const area = normalize(filters.area);

  return contractors.filter((contractor) => {
    const matchesSearch =
      !search ||
      normalize(contractor.fullName).includes(search) ||
      normalize(contractor.businessName).includes(search) ||
      [...contractor.services, ...contractor.serviceAreas].some((value) => normalize(value).includes(search));

    const matchesCategory = !category || contractor.categoryIds.some((value) => normalize(value) === category);
    const matchesTag = !tag || contractor.services.some((value) => normalize(value).includes(tag));
    const matchesArea = !area || contractor.serviceAreas.some((value) => normalize(value) === area);
    const matchesVerified = !filters.verifiedOnly || contractor.verified;
    const matchesAvailability = !filters.availableToday || contractor.jobAvailability === 'available';
    const matchesMinRating = contractor.rating >= filters.minRating;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesTag &&
      matchesArea &&
      matchesVerified &&
      matchesAvailability &&
      matchesMinRating
    );
  });
};
