export type ProviderReadinessLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';

export type ProviderKind = 'independent' | 'schoolProvider' | 'schoolAffiliatedInstructor';

export interface ProviderReadinessFacts {
	providerExists: boolean;
	providerKind?: ProviderKind;
	hasProfessionalPhone: boolean;
	hasQualification: boolean;
	hasSport: boolean;
	hasPrimaryResort: boolean;
	hasBio: boolean;
	hasProfilePhoto: boolean;
	hasLanguages: boolean;
	hasDefaultOffer: boolean;
	hasAvailability: boolean;
	hasLocalSnowReview?: boolean;
}

export interface ProviderReadinessSection {
	key: string;
	stageNumber: number;
	label: string;
	description: string;
	level: ProviderReadinessLevel;
	completed: boolean;
	href: string;
	requiredForNextLevel: boolean;
}

export interface ProviderReadinessSummary {
	currentLevel: ProviderReadinessLevel;
	currentLabel: string;
	nextLevel: ProviderReadinessLevel | null;
	nextLabel: string | null;
	currentStageNumber: number;
	totalStages: number;
	currentStageLabel: string;
	sections: ProviderReadinessSection[];
	nextSection: ProviderReadinessSection | null;
	completedSections: number;
	totalSections: number;
}

const LEVEL_LABELS: Record<ProviderReadinessLevel, string> = {
	L0: 'Setup in progress',
	L1: 'Profile prepared',
	L2: 'Teaching area prepared',
	L3: 'Default offer prepared',
	L4: 'Availability prepared'
};

function hasProfileStage(facts: ProviderReadinessFacts): boolean {
	return facts.providerExists && facts.hasProfessionalPhone && facts.hasBio && facts.hasLanguages;
}

function hasTeachingAreaStage(facts: ProviderReadinessFacts): boolean {
	return hasProfileStage(facts) && facts.hasSport && facts.hasPrimaryResort;
}

function defaultOfferApplies(facts: ProviderReadinessFacts): boolean {
	return facts.providerKind !== 'schoolAffiliatedInstructor';
}

function hasDefaultOfferStage(facts: ProviderReadinessFacts): boolean {
	return hasTeachingAreaStage(facts) && (!defaultOfferApplies(facts) || facts.hasDefaultOffer);
}

function hasAvailabilityStage(facts: ProviderReadinessFacts): boolean {
	return hasDefaultOfferStage(facts) && facts.hasAvailability;
}

export function getProviderReadinessLevel(facts: ProviderReadinessFacts): ProviderReadinessLevel {
	if (hasAvailabilityStage(facts)) return 'L4';
	if (hasDefaultOfferStage(facts)) return 'L3';
	if (hasTeachingAreaStage(facts)) return 'L2';
	if (hasProfileStage(facts)) return 'L1';
	return 'L0';
}

function getProfileHref(facts: ProviderReadinessFacts): string {
	if (!facts.hasProfessionalPhone) return '/dashboard/setup?step=1';
	return '/dashboard/profile';
}

function getDefaultOfferDescription(facts: ProviderReadinessFacts): string {
	if (facts.providerKind === 'schoolAffiliatedInstructor') {
		return 'Inherited from the school unless this instructor later needs their own offer.';
	}

	return 'Your first requestable lesson: client fit, duration, price, and simple group/duration rules.';
}

export function buildProviderReadinessSummary(
	facts: ProviderReadinessFacts
): ProviderReadinessSummary {
	const offerApplies = defaultOfferApplies(facts);
	const sections: ProviderReadinessSection[] = [
		{
			key: 'profile',
			stageNumber: 1,
			label: 'Profile',
			description:
				'Private contact plus public professional basics. Qualification proof helps review, but does not block submission.',
			level: 'L1',
			completed: hasProfileStage(facts),
			href: getProfileHref(facts),
			requiredForNextLevel: true
		},
		{
			key: 'teaching-area',
			stageNumber: 2,
			label: 'Teaching area',
			description:
				'One primary resort plus sports and broad teaching scope LocalSnow can route against.',
			level: 'L2',
			completed: facts.hasSport && facts.hasPrimaryResort,
			href: '/dashboard/setup?step=2',
			requiredForNextLevel: true
		},
		{
			key: 'default-offer',
			stageNumber: 3,
			label: 'Default offer',
			description: getDefaultOfferDescription(facts),
			level: 'L3',
			completed: !offerApplies || facts.hasDefaultOffer,
			href: offerApplies ? '/dashboard/setup?step=3' : '/dashboard/setup',
			requiredForNextLevel: offerApplies
		},
		{
			key: 'availability',
			stageNumber: 4,
			label: 'Availability',
			description:
				'Structured availability when possible; otherwise LocalSnow can still route structured lesson requests without slot confidence.',
			level: 'L4',
			completed: facts.hasAvailability,
			href: '/dashboard/availability',
			requiredForNextLevel: true
		},
		{
			key: 'localsnow-review',
			stageNumber: 5,
			label: 'LocalSnow review',
			description: facts.hasQualification
				? 'Manual founder review of identity, qualification/proof, profile, offer, and publication boundary.'
				: 'Manual founder review is still needed; qualification/proof can be collected before reviewed/trustworthy status.',
			level: 'L4',
			completed: facts.hasLocalSnowReview === true,
			href: '/dashboard/setup',
			requiredForNextLevel: false
		}
	];

	const currentLevel = getProviderReadinessLevel(facts);
	const levelOrder: ProviderReadinessLevel[] = ['L0', 'L1', 'L2', 'L3', 'L4'];
	const currentIndex = levelOrder.indexOf(currentLevel);
	const nextLevel = currentIndex < levelOrder.length - 1 ? levelOrder[currentIndex + 1] : null;
	const nextSection = sections.find((section) => !section.completed) ?? null;
	const currentSection = nextSection ?? sections[sections.length - 1];

	return {
		currentLevel,
		currentLabel: LEVEL_LABELS[currentLevel],
		nextLevel,
		nextLabel: nextLevel ? LEVEL_LABELS[nextLevel] : null,
		currentStageNumber: currentSection.stageNumber,
		totalStages: sections.length,
		currentStageLabel: currentSection.label,
		sections,
		nextSection,
		completedSections: sections.filter((section) => section.completed).length,
		totalSections: sections.length
	};
}
