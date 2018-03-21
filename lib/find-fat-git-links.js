const fs = require('fs')
const path = require('path')
const glob = require('glob')
const pickBy = require('lodash/pickBy')

function isGitLink(version) {
	return /\.git(#[\w\d-]*)?$/.test(version)
}

function isFAT(depName) {
	return /^\@ff0000-ad-tech/.test(depName)
}

function findGitLinksInDeps(deps) {
	return pickBy(deps, isGitLink)
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
				const gitLinkDeps = findGitLinksInDeps(deps)
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
	return gitLinkDepsByDir
}

module.exports = findFatGitLinks