import { describe, expect, it } from 'vitest';
import { buildPublicProviderProfile } from './publicProviderProfile';

describe('buildPublicProviderProfile', () => {
	it('derives independent instructor public display name from first name and surname initial', () => {
		expect(
			buildPublicProviderProfile({
				providerKind: 'independent',
				firstName: 'Laura',
				lastName: 'Martínez'
			})
		).toMatchObject({
			displayName: 'Laura M.',
			displaySource: 'personal-name-initial'
		});
	});

	it('uses separate school public name for school providers', () => {
		expect(
			buildPublicProviderProfile({
				providerKind: 'schoolProvider',
				firstName: 'Marta',
				lastName: 'Soler',
				professionalName: 'Baqueira Snow School'
			})
		).toMatchObject({
			displayName: 'Baqueira Snow School',
			displaySource: 'professional-name'
		});
	});

	it('falls back to personal-name initial when a school-affiliated instructor has no separate professional name', () => {
		expect(
			buildPublicProviderProfile({
				providerKind: 'schoolAffiliatedInstructor',
				firstName: 'Álex',
				lastName: 'de la Cruz'
			})
		).toMatchObject({
			displayName: 'Álex D.',
			displaySource: 'personal-name-initial'
		});
	});

	it('does not use school name for a school-affiliated instructor public display', () => {
		expect(
			buildPublicProviderProfile({
				providerKind: 'schoolAffiliatedInstructor',
				firstName: 'Álex',
				lastName: 'de la Cruz',
				professionalName: 'Baqueira Snow School'
			})
		).toMatchObject({
			displayName: 'Álex D.',
			displaySource: 'personal-name-initial'
		});
	});

	it('copies languages without exposing mutable source arrays', () => {
		const languages = ['es', 'en'];
		const profile = buildPublicProviderProfile({
			providerKind: 'independent',
			firstName: 'Núria',
			lastName: 'Puig',
			languages
		});

		languages.push('fr');

		expect(profile.languages).toEqual(['es', 'en']);
	});
});
