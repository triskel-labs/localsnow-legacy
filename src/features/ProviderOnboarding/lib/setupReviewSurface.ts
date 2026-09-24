import type { ProviderReadinessSection, ProviderReadinessSummary } from './providerReadiness';

export type SetupReviewStageState = 'complete' | 'active' | 'later';

export interface SetupReviewStage {
	key: string;
	stageNumber: number;
	label: string;
	description: string;
	href: string;
	state: SetupReviewStageState;
	stateLabel: string;
	mobileCue: string;
	requiredForNextLevel: boolean;
}

export interface SetupReviewSurface {
	headline: string;
	subtitle: string;
	progressLabel: string;
	progressPercent: number;
	primaryCue: string;
	stages: SetupReviewStage[];
}

function getStageState(
	section: ProviderReadinessSection,
	nextSection: ProviderReadinessSection | null
): SetupReviewStageState {
	if (section.completed) return 'complete';
	if (nextSection?.key === section.key) return 'active';
	return 'later';
}

function getStateLabel(state: SetupReviewStageState): string {
	if (state === 'complete') return 'Ready';
	if (state === 'active') return 'Next';
	return 'Later';
}

const PROVIDER_FACING_DESCRIPTIONS: Record<string, string> = {
	profile:
		'Private contact plus public professional basics. Qualification proof can be added before LocalSnow approval.',
	'teaching-area': 'One primary resort plus the sports clients can request from you.',
	'default-offer':
		'Your first requestable lesson: client fit, duration, price, and simple group size.',
	availability:
		'Set availability when you can. If not, clients can still send lesson dates and details for LocalSnow to check.',
	'localsnow-review':
		'LocalSnow checks the profile, proof, offer, and contact boundary before public trust status.'
};

function getProviderFacingDescription(section: ProviderReadinessSection): string {
	return PROVIDER_FACING_DESCRIPTIONS[section.key] ?? section.description;
}

function getMobileCue(section: ProviderReadinessSection, state: SetupReviewStageState): string {
	if (state === 'complete') {
		return 'Good enough for now. You can still polish it later.';
	}

	if (state === 'active') {
		return `This is the next thing to decide: ${getProviderFacingDescription(section)}`;
	}

	if (!section.requiredForNextLevel) {
		return 'LocalSnow checks this before public trust status; it should stay simple for providers.';
	}

	return 'Keep it visible, but do not ask for it before the earlier steps are useful.';
}

export function buildSetupReviewSurface(summary: ProviderReadinessSummary): SetupReviewSurface {
	const progressPercent = Math.round((summary.completedSections / summary.totalSections) * 100);
	const stages = summary.sections.map((section) => {
		const state = getStageState(section, summary.nextSection);

		return {
			key: section.key,
			stageNumber: section.stageNumber,
			label: section.label,
			description: getProviderFacingDescription(section),
			href: section.href,
			state,
			stateLabel: getStateLabel(state),
			mobileCue: getMobileCue(section, state),
			requiredForNextLevel: section.requiredForNextLevel
		} satisfies SetupReviewStage;
	});

	return {
		headline: 'One provider setup path, five useful checks',
		subtitle:
			'Help the provider create a trustable profile, one teaching area, one requestable offer, availability, and a LocalSnow review gate.',
		progressLabel: `${summary.completedSections} of ${summary.totalSections} stages ready`,
		progressPercent,
		primaryCue: summary.nextSection
			? `Focus now: ${summary.nextSection.label}`
			: 'Setup is ready for LocalSnow review',
		stages
	};
}
