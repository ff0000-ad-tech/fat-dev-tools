#!/usr/bin/env node
const argv = require('minimist')(process.argv.slice(2))
const colors = require('colors/safe')
const findFatGitLinks = require('../lib/find-fat-git-links.js')

const target = (
	// first CLI arg
	(argv._ && argv._[0])
	// thru --context 
	|| argv.context
	// default to cwd
	|| process.cwd()
)

const gitLinkDepsByDir = findFatGitLinks(target, {
	excludes: argv.excludes
})

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