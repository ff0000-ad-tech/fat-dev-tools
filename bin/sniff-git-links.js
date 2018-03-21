#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const pickBy = require('lodash/pickBy')
const pick = require('lodash/pick')
const colors = require('colors/safe')

function isGitLink(version) {
	return /\.git(#[\w\d-]*)?$/.test(version)
}

function isFAT(depName) {
	return /^\@ff0000-ad-tech/.test(depName)
}

function findGitLinksInDeps(deps) {
	return pickBy(deps, isGitLink)
}

function onlyFATDeps(deps) {
	const fatDepNames = Object.keys(deps).filter(isFAT)
	return pick(deps, fatDepNames)
}

function findGitLinksInDirectories(dirs) {
	return dirs
		.reduce((accum, dir) => {
			const packageJson = path.resolve(dir, 'package.json')
			try {
				const pkgJsonContents = fs.readFileSync(packageJson, 'utf8')
				const parsedObj = JSON.parse(pkgJsonContents)
				const deps = Object.assign({},
					parsedObj.dependencies || {},
					parsedObj.devDependencies || {},
					parsedObj.peerDependencies || {}
				)
				const fatDeps = onlyFATDeps(deps)
				const gitLinkDeps = findGitLinksInDeps(fatDeps)
				Object.keys(gitLinkDeps).length && (accum[dir] = gitLinkDeps)
				return accum
			} catch (err) {
				if (err.code !== 'ENOENT') throw err
				return accum
			}
		}, {})
}

function findFatGitLinks(target) {
	const files = fs.readdirSync(target)
	const dirPaths = files
		.map(file => path.resolve(target, file))
		.filter(filepath => {
			const stats = fs.statSync(filepath)
			return stats.isDirectory()
		})
	const gitLinkDepsByDir = findGitLinksInDirectories(dirPaths)

	Object.keys(gitLinkDepsByDir).forEach(dirPath => {
		console.log()
		console.log(colors.blue.underline(dirPath))
		const gitLinkDeps = gitLinkDepsByDir[dirPath]
		Object.keys(gitLinkDeps).forEach(depName => {
			const gitLink = gitLinkDeps[depName]
			const styledDepName = colors.green(depName)
			const styledGitLink = colors.yellow(gitLink)
			console.log(`${styledDepName} => ${styledGitLink}`)
		})
	})
}
