export type PublicProviderKind = 'independent' | 'schoolProvider' | 'schoolAffiliatedInstructor';

export type PublicProviderDisplaySource = 'personal-name-initial' | 'professional-name';

export interface PublicProviderProfileInput {
	providerKind: PublicProviderKind;
	firstName: string | null | undefined;
	lastName: string | null | undefined;
	professionalName?: string | null;
	languages?: string[] | null;
	profileImageUrl?: string | null;
}

export interface PublicProviderProfile {
	displayName: string;
	displaySource: PublicProviderDisplaySource;
	languages: string[];
	profileImageUrl?: string | null;
}

function normalizeText(value: string | null | undefined): string {
	return value?.trim().replace(/\s+/g, ' ') ?? '';
}

function getSurnameInitial(lastName: string): string {
	const normalized = normalizeText(lastName);
	const firstLetter = Array.from(normalized).find((char) => /\p{L}/u.test(char));
	return firstLetter ? firstLetter.toLocaleUpperCase() : '';
}

function buildPersonalInitialDisplayName(
	firstName: string | null | undefined,
	lastName: string | null | undefined
): string {
	const normalizedFirstName = normalizeText(firstName);
	const surnameInitial = getSurnameInitial(normalizeText(lastName));

	if (normalizedFirstName && surnameInitial) return `${normalizedFirstName} ${surnameInitial}.`;
	if (normalizedFirstName) return normalizedFirstName;
	if (surnameInitial) return `${surnameInitial}.`;
	return 'LocalSnow provider';
}

export function buildPublicProviderProfile(
	input: PublicProviderProfileInput
): PublicProviderProfile {
	const professionalName = normalizeText(input.professionalName);
	const shouldUseProfessionalName =
		input.providerKind === 'schoolProvider' && professionalName.length > 0;

	return {
		displayName: shouldUseProfessionalName
			? professionalName
			: buildPersonalInitialDisplayName(input.firstName, input.lastName),
		displaySource: shouldUseProfessionalName ? 'professional-name' : 'personal-name-initial',
		languages: [...(input.languages ?? [])],
		profileImageUrl: input.profileImageUrl
	};
}
