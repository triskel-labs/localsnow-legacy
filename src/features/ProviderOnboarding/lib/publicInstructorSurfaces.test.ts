import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const readText = (path: string) => readFileSync(join(repoRoot, path), 'utf8');

describe('public instructor surfaces', () => {
	it('do not classify instructor cards or person profiles as school provider display surfaces', () => {
		const instructorCard = readText('src/features/Instructors/components/InstructorCard.svelte');
		const instructorProfile = readText('src/routes/instructors/[slug]/+page.svelte');

		expect(instructorCard).not.toContain("? 'schoolProvider'");
		expect(instructorProfile).not.toContain("? 'schoolProvider'");
		expect(instructorCard).toContain("providerKind: 'schoolAffiliatedInstructor'");
		expect(instructorProfile).toContain("providerKind: 'schoolAffiliatedInstructor'");
	});
});
