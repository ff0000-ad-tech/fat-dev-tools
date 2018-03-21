##### RED Interactive Agency - Ad Technology

FF0000 Ad Tech - Developer Tools
===============

Collection of command-line utilities to help with development

To use these tools from the command-line, install this repo globally:

`npm install -g @ff0000-ad-tech/fat-dev-tools`

## `sniff-git-links`

Checks for any Git-linked dependencies in recursively found `package.json`s as well as any cloned repos. Useful when working with multiple repos' feature branches

### Usage

`sniff-git-links [target] [--excludes excludeList] [--context target]`

`target` - the starting folder to search for Git linked dependencies. Can be passed as either the first argument or w/ the `--context` parameter.

If none provided, defaults to current working directory

`excludes` - a comma-separated list of globs to exclude. Should be surrounded by single quotes to send unexpanded glob string directly to script. For example:

`sniff-git-links --excludes '**/node_modules, **/useless_repo'`
