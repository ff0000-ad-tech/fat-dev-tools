#!/usr/bin/env node

/* 
	Utility for pushing changes from one file to another

	Main motivation is for working on a file in a repo and
	syncing changes with a file in a project
*/

const argv = require('minimist')(process.argv.slice(2))
const colors = require('colors/safe')

if (argv._.length < 2) {
	console.log(colors.red(`\
Please provide a file path to watch and a file path to update

Like so:
push-file-changes.js workingFile.js fileToUpdate.js
	`))
	process.exit(1)
}

const path = require('path')
const fs = require('fs')

const cwd = process.cwd()
const watchFile = path.resolve(cwd, argv._[0])
const updatingFile = path.resolve(cwd, argv._[1])

console.log(colors.cyan(`\
Watching file changes on ${watchFile}
and propagating them to ${updatingFile}
`))

console.log(colors.yellow(`\
* NOTE: file update event often fires twice since fs.watch is not 100% stable
See: https://nodejs.org/docs/latest/api/fs.html#fs_caveats
`))

function writeToUpdatingFile(data) {
	fs.writeFile(updatingFile, data, (err) => {
		if (err) {
			throw err
		}
		console.log(colors.green('File updated'))
	})
}

function pushChanges() {
	fs.readFile(watchFile, (err, data) => {
		if (err) {
			throw err
		}
		writeToUpdatingFile(data)
	})
}

fs.watch(watchFile, (eventType, filename) => {
	if (eventType === 'change') {
		pushChanges()
	}
})