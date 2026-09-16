export type ProviderReadinessLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';

export interface ProviderReadinessFacts {
	providerExists: boolean;
	providerKind?: 'independent' | 'schoolInstructor';
	hasProfessionalPhone: boolean;
	hasQualification: boolean;
	hasSport: boolean;
	hasResort: boolean;
	hasBio: boolean;
	hasProfilePhoto: boolean;
	hasLanguages: boolean;
	hasBaseOffer: boolean;
	hasAvailability: boolean;
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
	L1: 'Core profile started',
	L2: 'Request data prepared',
	L3: 'Default offer prepared',
	L4: 'Availability prepared'
};

function hasL1(facts: ProviderReadinessFacts): boolean {
	return (
		facts.providerExists &&
		facts.hasProfessionalPhone &&
		facts.hasQualification &&
		facts.hasSport &&
		facts.hasResort
	);
}

function hasL2(facts: ProviderReadinessFacts): boolean {
	return hasL1(facts) && facts.hasBio && facts.hasLanguages;
}

function offerPricingApplies(facts: ProviderReadinessFacts): boolean {
	return facts.providerKind !== 'schoolInstructor';
}

function hasL3(facts: ProviderReadinessFacts): boolean {
	return hasL2(facts) && (!offerPricingApplies(facts) || facts.hasBaseOffer);
}

function hasL4(facts: ProviderReadinessFacts): boolean {
	return hasL3(facts) && facts.hasAvailability;
}

export function getProviderReadinessLevel(facts: ProviderReadinessFacts): ProviderReadinessLevel {
	if (hasL4(facts)) return 'L4';
	if (hasL3(facts)) return 'L3';
	if (hasL2(facts)) return 'L2';
	if (hasL1(facts)) return 'L1';
	return 'L0';
}

function getProfileHref(facts: ProviderReadinessFacts): string {
	if (!facts.hasProfessionalPhone || !facts.hasQualification) return '/dashboard/setup?step=1';
	return '/dashboard/profile';
}

export function buildProviderReadinessSummary(
	facts: ProviderReadinessFacts
): ProviderReadinessSummary {
	const pricingApplies = offerPricingApplies(facts);
	const sections: ProviderReadinessSection[] = [
		{
			key: 'profile',
			stageNumber: 1,
			label: 'Profile',
			description:
				'Contact, credentials, bio, languages, and optional photo for trust and profile preview.',
			level: 'L2',
			completed:
				facts.hasProfessionalPhone && facts.hasQualification && facts.hasBio && facts.hasLanguages,
			href: getProfileHref(facts),
			requiredForNextLevel: true
		},
		{
			key: 'teaching-area',
			stageNumber: 2,
			label: 'Teaching area',
			description: 'Resorts, zones, sports, and broad teaching scope LocalSnow can match against.',
			level: 'L1',
			completed: facts.hasSport && facts.hasResort,
			href: '/dashboard/setup?step=2',
			requiredForNextLevel: true
		},
		{
			key: 'default-offer',
			stageNumber: 3,
			label: 'Default offer',
			description: pricingApplies
				? 'Your first requestable lesson: client fit, duration, price, and simple group/duration options.'
				: 'Managed through your school relationship for this provider type.',
			level: 'L3',
			completed: !pricingApplies || facts.hasBaseOffer,
			href: pricingApplies ? '/dashboard/setup?step=3' : '/dashboard/my-school',
			requiredForNextLevel: pricingApplies
		},
		{
			key: 'availability',
			stageNumber: 4,
			label: 'Availability',
			description: 'Working hours or requestability signals LocalSnow can double-check for dates.',
			level: 'L4',
			completed: facts.hasAvailability,
			href: '/dashboard/availability',
			requiredForNextLevel: true
		},
		{
			key: 'localsnow-review',
			stageNumber: 5,
			label: 'LocalSnow review',
			description:
				'Final profile, offer, contact-boundary, and publication check before serious public exposure.',
			level: 'L4',
			completed: false,
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
