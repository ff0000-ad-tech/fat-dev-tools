const fs = require('fs')
const path = require('path')
const glob = require('glob')
const pickBy = require('lodash/pickBy')
const log = require('debug')('fat')

function isGitLink(version) {
	return /\.git(#[\w\d-]*)?$/.test(version)
}

function findGitLinksInDeps(deps) {
	return pickBy(deps, isGitLink)
}

function getDirectories(target) {
	const files = fs.readdirSync(target)
	return files
		.map(file => path.resolve(target, file))
		.filter(filepath => {
			const stats = fs.statSync(filepath)
			return stats.isDirectory()
		})
}

function checkPkgJsonInDir(dir) {
	const packageJson = path.resolve(dir, 'package.json')
	try {
		const pkgJsonContents = fs.readFileSync(packageJson, 'utf8')
		const parsedObj = JSON.parse(pkgJsonContents)
		const deps = Object.assign({},
			parsedObj.dependencies || {},
			parsedObj.devDependencies || {},
			parsedObj.peerDependencies || {}
		)
		const gitLinkDeps = findGitLinksInDeps(deps)
		return gitLinkDeps
	} catch (err) {
		if (
			err.code !== 'ENOENT'
			&& !(err instanceof SyntaxError)
		) {
			log(packageJson)
			throw err
		}
		return {}
	}
}

function findGitLinksInDir(dir) {
	const topLevelGitLinkDeps = checkPkgJsonInDir(dir)
	const childDirs = getDirectories(dir)
	const recursivelyFoundDeps = childDirs
		.reduce((accum, childDir) => {
			// check for any deps in child directories
			const childDeps = findGitLinksInDir(childDir)
			return Object.assign(accum, childDeps)
		}, {})

	const allDeps = Object.assign({}, recursivelyFoundDeps)

	// add parent's Git link deps
	if (Object.keys(topLevelGitLinkDeps).length) {
		allDeps[dir] = topLevelGitLinkDeps
	}

	return allDeps
}

function findFatGitLinks(target) {
	const gitLinkDepsByDir = findGitLinksInDir(target)
	return gitLinkDepsByDir
}

module.exports = findFatGitLinks