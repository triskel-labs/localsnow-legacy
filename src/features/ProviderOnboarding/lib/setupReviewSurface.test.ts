import { describe, expect, it } from 'vitest';
import { buildProviderReadinessSummary } from './providerReadiness';
import { buildSetupReviewSurface } from './setupReviewSurface';

function baseSummary() {
	return buildProviderReadinessSummary({
		providerExists: true,
		providerKind: 'independent',
		hasProfessionalPhone: true,
		hasQualification: false,
		hasSport: true,
		hasPrimaryResort: true,
		hasBio: true,
		hasProfilePhoto: false,
		hasLanguages: true,
		hasDefaultOffer: false,
		hasAvailability: false,
		hasLocalSnowReview: false
	});
}

describe('setup review surface', () => {
	it('turns provider readiness into a phone-friendly five-stage surface', () => {
		const surface = buildSetupReviewSurface(baseSummary());

		expect(surface.headline.toLowerCase()).toContain('one provider setup path');
		expect(surface.progressLabel).toBe('2 of 5 stages ready');
		expect(surface.progressPercent).toBe(40);
		expect(surface.stages).toHaveLength(5);
		expect(surface.stages.map((stage) => stage.label)).toEqual([
			'Profile',
			'Teaching area',
			'Default offer',
			'Availability',
			'LocalSnow review'
		]);
	});

	it('marks completed, active, and later stages without leaking internal implementation language', () => {
		const surface = buildSetupReviewSurface(baseSummary());
		const [profile, teachingArea, defaultOffer, availability, review] = surface.stages;

		expect(profile.state).toBe('complete');
		expect(teachingArea.state).toBe('complete');
		expect(defaultOffer.state).toBe('active');
		expect(availability.state).toBe('later');
		expect(review.state).toBe('later');
		expect(defaultOffer.mobileCue).toContain('next thing to decide');

		const renderedCopy = JSON.stringify(surface).toLowerCase();
		expect(renderedCopy).not.toMatch(/schema|database|scaffold|coming soon|webgl|shader/);
	});

	it('keeps the phone review card provider-facing instead of operator/internal', () => {
		const surface = buildSetupReviewSurface(baseSummary());
		const renderedCopy = JSON.stringify(surface).toLowerCase();

		expect(renderedCopy).not.toMatch(
			/route against|slot confidence|founder|publication boundary|reviewed\/trustworthy|manual founder/
		);
	});
});
