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
      normalize(contractor.name).includes(search) ||
      normalize(contractor.company).includes(search) ||
      contractor.tags.some((contractorTag) => normalize(contractorTag).includes(search));

    const matchesCategory = !category || normalize(contractor.category) === category;
    const matchesTag = !tag || contractor.tags.some((contractorTag) => normalize(contractorTag).includes(tag));
    const matchesArea = !area || normalize(contractor.area) === area;
    const matchesVerified = !filters.verifiedOnly || contractor.verified;
    const matchesAvailability = !filters.availableToday || contractor.availableToday;
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
