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
	hasResort: false,
	hasBio: false,
	hasProfilePhoto: false,
	hasLanguages: false,
	hasBaseOffer: false,
	hasAvailability: false
};

describe('provider readiness', () => {
	it('starts providers in setup until profile and teaching requirements exist', () => {
		expect(getProviderReadinessLevel(emptyFacts)).toBe('L0');
	});

	it('promotes to core profile started when contact, qualification, sport, and resort exist', () => {
		expect(
			getProviderReadinessLevel({
				...emptyFacts,
				hasProfessionalPhone: true,
				hasQualification: true,
				hasSport: true,
				hasResort: true
			})
		).toBe('L1');
	});

	it('requires trust profile fields before request data is prepared', () => {
		const profileAndTeachingStarted = {
			...emptyFacts,
			hasProfessionalPhone: true,
			hasQualification: true,
			hasSport: true,
			hasResort: true
		};

		expect(getProviderReadinessLevel(profileAndTeachingStarted)).toBe('L1');
		expect(
			getProviderReadinessLevel({
				...profileAndTeachingStarted,
				hasBio: true,
				hasLanguages: true
			})
		).toBe('L2');
	});

	it('promotes through default-offer and availability readiness without needing payment rules yet', () => {
		const requestDataPrepared = {
			...emptyFacts,
			hasProfessionalPhone: true,
			hasQualification: true,
			hasSport: true,
			hasResort: true,
			hasBio: true,
			hasLanguages: true
		};

		expect(getProviderReadinessLevel({ ...requestDataPrepared, hasBaseOffer: true })).toBe('L3');
		expect(
			getProviderReadinessLevel({
				...requestDataPrepared,
				hasBaseOffer: true,
				hasAvailability: true
			})
		).toBe('L4');
	});

	it('returns the next provider-facing stage with Stage X of 5 metadata', () => {
		const summary = buildProviderReadinessSummary({
			...emptyFacts,
			hasProfessionalPhone: true,
			hasQualification: true
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
		expect(summary.sections.find((section) => section.key === 'default-offer')?.description).toContain(
			'client fit'
		);
	});

	it('does not force school instructors through independent default-offer pricing before availability', () => {
		const summary = buildProviderReadinessSummary({
			...emptyFacts,
			providerKind: 'schoolInstructor',
			hasProfessionalPhone: true,
			hasQualification: true,
			hasSport: true,
			hasResort: true,
			hasBio: true,
			hasLanguages: true
		});

		expect(summary.currentLevel).toBe('L3');
		expect(summary.nextSection?.key).toBe('availability');
		expect(summary.sections.find((section) => section.key === 'default-offer')?.completed).toBe(true);
	});
});
