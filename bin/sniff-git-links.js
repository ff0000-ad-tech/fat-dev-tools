#!/usr/bin/env node
const argv = require('minimist')(process.argv.slice(2))
const colors = require('colors/safe')
const findFatGitLinks = require('../lib/find-fat-git-links.js')

const gitLinkDepsByDir = findFatGitLinks(argv.context || process.cwd())

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