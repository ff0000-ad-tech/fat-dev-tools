#!/usr/bin/env node
const argv = require('minimist')(process.argv.slice(2))
const colors = require('colors/safe')
const findFatGitInfo = require('../lib/find-fat-git-info.js')

const target = (
	// first CLI arg
	(argv._ && argv._[0])
	// thru --context 
	|| argv.context
	// default to cwd
	|| process.cwd()
)

const gitInfoByDir = findFatGitInfo(target, {
	excludes: argv.excludes
})

function showGitLink(depName, gitLink) {
	const styledDepName = colors.green(depName)
	const styledGitLink = colors.yellow(gitLink)
	console.log(`${styledDepName} => ${styledGitLink}`)
}

function showDeps(deps) {
	Object.keys(deps).forEach(depName => {
		const gitLink = deps[depName]
		showGitLink(depName, gitLink)
	})
}

Object.keys(gitInfoByDir).forEach(dirPath => {
	console.log()
	console.log(colors.blue.underline(dirPath))
	const { hasGit, gitLinkDeps } = gitInfoByDir[dirPath]
	
	if (hasGit) {
		console.log(colors.magenta('This is a cloned or working repo, since it has a .git directory'))
	}

	if (Object.keys(gitLinkDeps).length) {
		showDeps(gitLinkDeps)
	}
})