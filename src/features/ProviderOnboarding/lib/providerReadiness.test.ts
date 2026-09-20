import { describe, expect, it } from 'vitest';
import {
	buildProviderReadinessSummary,
	getProviderReadinessLevel,
	type ProviderReadinessFacts
} from './providerReadiness';

const emptyFacts: ProviderReadinessFacts = {
	providerExists: true,
	providerKind: 'independent',
	hasProfessionalPhone: false,
	hasQualification: false,
	hasSport: false,
	hasPrimaryResort: false,
	hasBio: false,
	hasProfilePhoto: false,
	hasLanguages: false,
	hasDefaultOffer: false,
	hasAvailability: false,
	hasLocalSnowReview: false
};

const profilePrepared: ProviderReadinessFacts = {
	...emptyFacts,
	hasProfessionalPhone: true,
	hasBio: true,
	hasLanguages: true
};

const teachingAreaPrepared: ProviderReadinessFacts = {
	...profilePrepared,
	hasSport: true,
	hasPrimaryResort: true
};

describe('provider readiness', () => {
	it('starts providers in setup until public/professional profile basics exist', () => {
		expect(getProviderReadinessLevel(emptyFacts)).toBe('L0');
	});

	it('does not require qualification proof before basic onboarding can continue', () => {
		expect(getProviderReadinessLevel(profilePrepared)).toBe('L1');

		const summary = buildProviderReadinessSummary(profilePrepared);
		expect(summary.sections.find((section) => section.key === 'profile')?.completed).toBe(true);
		expect(
			summary.sections.find((section) => section.key === 'localsnow-review')?.description
		).toContain('qualification/proof can be collected before reviewed/trustworthy status');
	});

	it('requires one primary resort and sport before teaching area is prepared', () => {
		expect(getProviderReadinessLevel(profilePrepared)).toBe('L1');
		expect(getProviderReadinessLevel({ ...profilePrepared, hasSport: true })).toBe('L1');
		expect(getProviderReadinessLevel(teachingAreaPrepared)).toBe('L2');
	});

	it('promotes through default-offer and availability readiness without building payment rules', () => {
		expect(getProviderReadinessLevel({ ...teachingAreaPrepared, hasDefaultOffer: true })).toBe(
			'L3'
		);
		expect(
			getProviderReadinessLevel({
				...teachingAreaPrepared,
				hasDefaultOffer: true,
				hasAvailability: true
			})
		).toBe('L4');
	});

	it('returns the next provider-facing stage with Stage X of 5 metadata', () => {
		const summary = buildProviderReadinessSummary({
			...emptyFacts,
			hasProfessionalPhone: true
		});

		expect(summary.currentLevel).toBe('L0');
		expect(summary.currentStageNumber).toBe(1);
		expect(summary.totalStages).toBe(5);
		expect(summary.currentStageLabel).toBe('Profile');
		expect(summary.nextSection?.key).toBe('profile');
		expect(summary.nextSection?.href).toBe('/dashboard/profile');
	});

	it('keeps client fit inside the default-offer stage instead of a separate first-onboarding stage', () => {
		const summary = buildProviderReadinessSummary(emptyFacts);

		expect(summary.sections.map((section) => section.label)).toEqual([
			'Profile',
			'Teaching area',
			'Default offer',
			'Availability',
			'LocalSnow review'
		]);
		expect(
			summary.sections.find((section) => section.key === 'default-offer')?.description
		).toContain('client fit');
	});

	it('does not force school-affiliated instructors through independent default-offer pricing', () => {
		const summary = buildProviderReadinessSummary({
			...teachingAreaPrepared,
			providerKind: 'schoolAffiliatedInstructor'
		});

		expect(summary.currentLevel).toBe('L3');
		expect(summary.nextSection?.key).toBe('availability');
		expect(summary.sections.find((section) => section.key === 'default-offer')?.completed).toBe(
			true
		);
	});

	it('tracks LocalSnow review as the manual trust gate after availability', () => {
		const summary = buildProviderReadinessSummary({
			...teachingAreaPrepared,
			hasQualification: true,
			hasDefaultOffer: true,
			hasAvailability: true,
			hasLocalSnowReview: false
		});

		expect(summary.currentLevel).toBe('L4');
		expect(summary.nextSection?.key).toBe('localsnow-review');
		expect(summary.nextSection?.description).toContain('Manual founder review');
	});
});
