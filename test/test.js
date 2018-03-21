import test from 'ava'
import path from 'path'
import curry from 'lodash/curry'

import findFatGitLinks from '../lib/find-fat-git-links'

const assertDir = curry(function assertDir(t, gitLinkDeps, suffix, expectedDeps) {
	const key = Object.keys(gitLinkDeps).find(key => key.endsWith(suffix))
	t.truthy(key)

	const actualDeps = gitLinkDeps[key]
	t.deepEqual(actualDeps, expectedDeps, `${suffix} doesn't have expected dependencies`)
})

test('Finds Git linked dependencies recursively', t => {
	const gitLinkDeps = findFatGitLinks(path.resolve(__dirname, 'fixtures/parent'))
	const assertDirWithDeps = assertDir(t, gitLinkDeps)
	
	assertDirWithDeps('/parent', {
		hello: 'hello.git'
	})

	assertDirWithDeps('/child', {
		goodbye: 'goodbye.git'
	})

	assertDirWithDeps('/grandchild', {
		yooo: 'yooo.git'
	})
})

test('Allows exclusion globs', t => {
	const gitLinkDeps = findFatGitLinks(path.resolve(__dirname, 'fixtures/parent'), {
		excludes: '**/child'
	})

	assertDir(t, gitLinkDeps, '/parent', {
		hello: 'hello.git'
	})

	const childKey = Object.keys(gitLinkDeps).find(key => key.endsWith('/child'))
	const grandchildKey = Object.keys(gitLinkDeps).find(key => key.endsWith('/grandchild'))

	t.falsy(childKey)
	t.falsy(grandchildKey)
})

test('Ignores SyntaxErrors when parsing invalid JSON', t => {
	t.notThrows(() => {
		findFatGitLinks(path.resolve(__dirname, 'fixtures/invalid'))
	})
})

test('Ignores ENOENT erros when if no package.json present', t => {
	t.notThrows(() => {
		findFatGitLinks(path.resolve(__dirname, 'fixtures/no-package'))
	})
})
