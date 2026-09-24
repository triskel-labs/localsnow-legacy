import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const readText = (path: string) => readFileSync(join(repoRoot, path), 'utf8');

describe('provider setup Stage 1 copy boundary', () => {
	it('explains private personal data versus public professional profile data', () => {
		const setupPage = readText('src/routes/dashboard/setup/+page.svelte');

		expect(setupPage).toContain('Private personal data');
		expect(setupPage).toContain('Public professional profile');
		expect(setupPage).toContain(
			'Independent instructors are shown as first name + surname initial'
		);
		expect(setupPage).not.toContain('full surname will be public');
	});
});
