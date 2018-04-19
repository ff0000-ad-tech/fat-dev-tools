import test from 'ava'
import path from 'path'
import curry from 'lodash/curry'

import findFatGitInfo from '../lib/find-fat-git-info'

const assertDir = curry(function assertDir(t, gitInfoByDir, suffix, expectedDeps) {
	const key = Object.keys(gitInfoByDir).find(key => key.endsWith(suffix))
	t.truthy(key)

	const actualDeps = gitInfoByDir[key] && gitInfoByDir[key].gitLinkDeps
	t.deepEqual(actualDeps, expectedDeps, `${suffix} doesn't have expected dependencies`)
})

test('Finds Git linked dependencies recursively', t => {
	const gitInfoByDir = findFatGitInfo(path.resolve(__dirname, 'fixtures/parent'))
	const assertDirWithDeps = assertDir(t, gitInfoByDir)
	
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

test.skip('Includes cloned repos (i.e. has .git folder)', t => {
	const gitInfoByDir = findFatGitInfo(path.resolve(__dirname, 'fixtures/gitRepo'))

	const gitRepoKey = Object.keys(gitInfoByDir).find(key => key.includes('gitRepo'))
	const gitRepoInfo = gitInfoByDir[gitRepoKey]

	t.deepEqual(gitRepoInfo, {
		gitLinkDeps: {},
		hasGit: true
	})
})

test('Allows exclusion globs', t => {
	const gitInfoByDir = findFatGitInfo(path.resolve(__dirname, 'fixtures/parent'), {
		excludes: '**/child'
	})

	assertDir(t, gitInfoByDir, '/parent', {
		hello: 'hello.git'
	})

	const childKey = Object.keys(gitInfoByDir).find(key => key.endsWith('/child'))
	const grandchildKey = Object.keys(gitInfoByDir).find(key => key.endsWith('/grandchild'))

	t.falsy(childKey)
	t.falsy(grandchildKey)
})

test('Ignores SyntaxErrors when parsing invalid JSON', t => {
	t.notThrows(() => {
		findFatGitInfo(path.resolve(__dirname, 'fixtures/invalid'))
	})
})

test('Ignores ENOENT errors when if no package.json present', t => {
	t.notThrows(() => {
		findFatGitInfo(path.resolve(__dirname, 'fixtures/no-package'))
	})
})