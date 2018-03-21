import test from 'ava'
import path from 'path'

import findFatGitLinks from '../lib/find-fat-git-links'

test('Finds Git linked dependencies recursively', t => {
	const gitLinkDeps = findFatGitLinks(path.resolve(__dirname, 'fixtures/parent'))
	
	// check for parent package.json
	const parentKey = Object.keys(gitLinkDeps).find(key => key.endsWith('parent'))
	t.truthy(parentKey)

	const parentDeps = gitLinkDeps[parentKey]
	t.deepEqual(parentDeps, {
		hello: 'hello.git'
	})

	// check for child package.json
	const childKey = Object.keys(gitLinkDeps).find(key => key.endsWith('child'))
	t.truthy(childKey)

	const childDeps = gitLinkDeps[childKey]
	t.deepEqual(childDeps, {
		goodbye: 'goodbye.git'
	})
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
