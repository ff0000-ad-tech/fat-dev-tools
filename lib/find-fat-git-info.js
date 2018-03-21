const fs = require("fs");
const path = require("path");
const glob = require("glob");
const pickBy = require("lodash/pickBy");
const log = require("debug")("fat");
const minimatch = require("minimatch");

function isGitLink(version) {
  return /\.git(#[\w\d-]*)?$/.test(version);
}

function isDirectory(file) {
  const stats = fs.statSync(file);
  return stats.isDirectory();
}

function findGitLinksInDeps(deps) {
  return pickBy(deps, isGitLink);
}

function getDirectories(target) {
  const files = fs.readdirSync(target);
  return files.map(file => path.resolve(target, file)).filter(isDirectory);
}

function checkPkgJsonInDir(dir) {
  const packageJson = path.resolve(dir, "package.json");
  try {
    const pkgJsonContents = fs.readFileSync(packageJson, "utf8");
    const parsedObj = JSON.parse(pkgJsonContents);
    const deps = Object.assign(
      {},
      parsedObj.dependencies || {},
      parsedObj.devDependencies || {},
      parsedObj.peerDependencies || {}
    );
    const gitLinkDeps = findGitLinksInDeps(deps);
    return gitLinkDeps;
  } catch (err) {
    if (err.code !== "ENOENT" && !(err instanceof SyntaxError)) {
      log(packageJson);
      throw err;
    }
    return {};
  }
}

function dirHasGit(dir) {
  const files = fs.readdirSync(dir)
  const dotGit = files.find(file => file === '.git')
  if (!dotGit) return false

  const dotGitPath = path.resolve(dir, dotGit)
  return isDirectory(dotGitPath)
}

function findGitInfoInDir(dir, { excludeFilter } = {}) {
  const allDeps = {};

  if (excludeFilter && excludeFilter(dir)) {
    return allDeps;
  }
  
  const topLevelGitLinkDeps = checkPkgJsonInDir(dir);
  const hasGit = dirHasGit(dir)

  // add parent's Git link deps and whether has .git folder
  if (Object.keys(topLevelGitLinkDeps).length || hasGit) {
    allDeps[dir] = {
      gitLinkDeps: topLevelGitLinkDeps,
      hasGit
    }
  }
	
  const childDirs = getDirectories(dir);
  const recursivelyFoundDeps = childDirs.reduce((accum, childDir) => {
    // check for any deps in child directories
    const childDeps = findGitInfoInDir(childDir, { excludeFilter });
    return Object.assign(accum, childDeps);
  }, {});

  Object.assign(allDeps, recursivelyFoundDeps);

  return allDeps;
}

const createExcludeFilter = excludes => {
	const excludeList = excludes.split(',')
	return dir => {
		const matchesAnyExclude = excludeList.reduce((isMatch, exclude) => {
			return isMatch || minimatch(dir, exclude, { matchBase: true });
		}, false)
		return matchesAnyExclude
	}
}

function findFatGitInfo(target, { excludes } = {}) {
  const gitInfoByDir = findGitInfoInDir(target, {
    excludeFilter: excludes && createExcludeFilter(excludes)
  });
  return gitInfoByDir;
}

module.exports = findFatGitInfo;
