/**
 * 发布工作流脚本
 * 1.更改版本号（package.version）
 * 2.更新changelog（在上一个tag之后的所有commit中，提取对应插件或者组件的信息）
 * 3.git提交1和2的修改
 * 4.git推送
 * 5.git生成tag，推送tag
 * 6.发布到npm
 *
 * eg: 更新名为plugin-xx的工作流如下
 * 1. 修改plugin-xx
 * 2. git commit -m 'feat(plugin-xx): 新增多选功能'
 *    ...
 *    git commit -m 'fix(plugin-xx): 修复ie下样式错乱'
 * 3. 生成pr，合入master
 * 4. 发版人员切到master
 * 5. npm run release:plugin plugin-xx
 */

// import 'source-map-support/register'
import { join } from 'node:path'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import parser from 'conventional-commits-parser'
import chalk from 'chalk'
import execa from 'execa'
import semver from 'semver'
import writePackage from 'write-pkg'
import yargs from 'yargs-parser'
import enquirer from 'enquirer'

const require = createRequire(import.meta.url)
const { log } = console
const parserOptions = {
  noteKeywords: ['BREAKING CHANGE', 'Breaking Change'],
}
const reBreaking = new RegExp(`(${parserOptions.noteKeywords.join(')|(')})`)
const dryRun = process.argv.includes('--dry')
const noPublish = process.argv.includes('--no-publish')
const noTag = process.argv.includes('--no-tag')
let step = ''

type Commit = parser.Commit<string | number | symbol>

interface BreakingCommit {
  breaking: boolean
}

interface Notes {
  breaking: string[]
  features: string[]
  fixes: string[]
  updates: string[]
}

interface RepoPackage {
  [key: string]: any
  name: string
  version: string
}

const commitChanges = async (shortName: string, version: string) => {
  step = 'commitChanges'
  if (dryRun) {
    log(chalk.yellow`Skipping Git Commit`)
    return
  }

  log(chalk.cyan('Committing CHANGELOG.md, package.json'))

  const params = ['commit', '--m', `chore(release): ${shortName} v${version}`]
  await execa('git', params)
}

const getCommits = async (shortName: string) => {
  log(chalk.cyan('Gathering Commits'))

  let params = ['tag', '--list', `${shortName}-v*`, '--sort', '-v:refname']
  const { stdout: tags } = await execa('git', params)
  const [latestTag] = tags.split('\n')

  log(chalk.green(`Release Tag: ${latestTag || '<none>'}`))

  params = ['--no-pager', 'log', `${latestTag}..HEAD`, '--format=%B%n-hash-%n%H🐒💨🙊']
  const rePlugin = new RegExp(`^[\\w\\!]+\\(([\\w,-]+)?${shortName}([\\w,-]+)?\\)`, 'i')
  let { stdout } = await execa('git', params)

  if (!stdout) {
    if (latestTag) params.splice(2, 1, `${latestTag}`)
    else params.splice(2, 1, 'HEAD');
    ({ stdout } = await execa('git', params))
  }

  const commits = stdout
    .split('🐒💨🙊')
    .filter((commit: string) => {
      const chunk = commit.trim()
      return chunk && rePlugin.test(chunk)
    })
    .map((commit) => {
      const node = parser.sync(commit)
      const body = (node.body || node.footer) as string

      if (!node.type) node.type = parser.sync(node.header?.replace(/\(.+\)!?:/, ':') || '').type;

      (node as unknown as BreakingCommit).breaking
        = reBreaking.test(body) || /!:/.test(node.header as string)

      return node
    })

  return commits
}

const getNewVersion = (version: string, commits: Commit[]): string | null => {
  log(chalk.cyan('New Version'))
  const intersection = process.argv.filter(arg =>
    ['--major', '--minor', '--patch'].includes(arg),
  )
  if (intersection.length) {
    return semver.inc(version, intersection[0].substring(2) as semver.ReleaseType)
  }

  const types = new Set(commits.map(({ type }) => type))
  const breaking = commits.some(commit => !!commit.breaking)
  const level = breaking ? 'major' : types.has('feat') || types.has('feature') ? 'minor' : 'patch'

  return semver.inc(version, level)
}

const publish = async (cwd: string) => {
  step = 'publish'
  if (dryRun || noPublish) {
    log(chalk.yellow`Skipping Publish`)
    return
  }

  log(chalk`Publishing to NPM`)

  await execa('npm', ['publish', '--no-git-checks'], { cwd, stdio: 'inherit' })
}

const tag = async (cwd: string, shortName: string, version: string) => {
  step = 'tag'
  if (dryRun || noTag) {
    log(chalk.yellow('Skipping Git Tag'))
    return
  }

  const tagName = `${shortName}-v${version}`
  log(chalk.green(`tagName: ${tagName}`))
  await execa('git', ['tag', tagName], { cwd, stdio: 'inherit' })
  return tagName
}

const updateChangelog = async (commits: Commit[], cwd: string, shortName: string, version: string) => {
  step = 'updateChangelog'
  if (commits.length === 0) return
  log(chalk.cyan('Gathering Changes'))
  const plugin = `${shortName}`
  const title = `# ${plugin} ChangeLog`
  const [date] = new Date().toISOString().split('T')
  const logPath = join(cwd, `${shortName}.md`)
  const logFile = existsSync(logPath) ? readFileSync(logPath, 'utf-8') : ''
  const oldNotes = logFile.startsWith(title) ? logFile.slice(title.length).trim() : logFile
  const notes: Notes = { breaking: [], features: [], fixes: [], updates: [] }

  for (const commit of commits) {
    const { breaking, hash, header, type } = commit
    const ref = /\(#\d+\)/.test(header as string)
      ? ''
      : ` ([${hash?.substring(0, 7)}](http://gitlab.galaxy-immi.com/Front-end-group/Public/materials-fe/commit/${hash}))`
    const message
      = header
        ?.trim()
        .replace(/\(.+\)!?:/, ':')
        .replace(/\((#(\d+))\)/, '[$1](http://gitlab.galaxy-immi.com/Front-end-group/Public/materials-fe/pull/$2)') + ref

    if (breaking) {
      notes.breaking.push(message)
    }
    else if (type === 'fix') {
      notes.fixes.push(message)
    }
    else if (type === 'feat' || type === 'feature') {
      notes.features.push(message)
    }
    else {
      notes.updates.push(message)
    }
  }

  const parts = [
    `## v${version}`,
    `_${date}_`,
    notes.breaking.length ? `### Breaking Changes\n\n- ${notes.breaking.join('\n- ')}`.trim() : '',
    notes.fixes.length ? `### Bugfixes\n\n- ${notes.fixes.join('\n- ')}`.trim() : '',
    notes.features.length ? `### Features\n\n- ${notes.features.join('\n- ')}`.trim() : '',
    notes.updates.length ? `### Updates\n\n- ${notes.updates.join('\n- ')}`.trim() : '',
  ].filter(Boolean)

  const newLog = parts.join('\n\n')

  if (dryRun) {
    log(chalk.cyan(`New ChangeLog: ${newLog}`))
    return
  }

  log(chalk.cyan('Updating CHANGELOG.md'))
  let content = [title, newLog, oldNotes].filter(Boolean).join('\n\n')
  if (!content.endsWith('\n')) content += '\n'
  writeFileSync(logPath, content, 'utf-8')
  await execa('git', ['add', logPath])
}

const updatePackage = async (cwd: string, pkg: RepoPackage, version: string) => {
  step = 'updatePackage'

  if (dryRun) {
    log(chalk.yellow('Skipping package.json Update'))
    return
  }

  log(chalk.cyan('Updating package.json'))

  pkg.version = version
  await writePackage(cwd, pkg)
  await execa('git', ['add', cwd])
}

const pushGit = async (cwd: string, tagName: string) => {
  step = 'pushGit'
  const { stdout: currentBranch } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
  await execa('git', ['push', 'origin', `refs/tags/${tagName}`], { cwd, stdio: 'inherit' })
  await execa('git', ['push', 'origin', currentBranch], { cwd, stdio: 'inherit' })
}

async function confirmResult() {
  const { yes } = await enquirer.prompt<{ yes: boolean }>({
    type: 'confirm',
    name: 'yes',
    message: '已为您生成本次工作流所有内容，是否正确？(tips: 确认之前可以修改)',
  })
  return yes
}

(async () => {
  try {
    log(chalk.green('release start'))
    const argv = yargs(process.argv.slice(2))
    const type = argv.type
    const packagePath = argv.packagePath || `packages/${type}`
    const packageName = argv.name
    const shortName = packageName.replace(/^@.+\//, '')
    const packageCwd = join(`/${packagePath}/`, type === 'plugins' ? shortName : '')
    const cwd = join(process.cwd(), packageCwd)
    const changelogCwd = join(process.cwd(), 'site-vitepress/docs/changelog')

    if (!cwd || !existsSync(cwd)) {
      throw new RangeError(`Could not find directory for package: ${packageName}`)
    }

    const pkg: RepoPackage = require(join('../', packageCwd, 'package.json'))

    if (dryRun) {
      log(chalk.yellow('{magenta DRY RUN}: No files will be modified'))
    }

    log(chalk.green(`{Releasing \`${packageName}\`} from {/${`${packagePath}/${shortName}`}}`))

    const commits = await getCommits(shortName)

    if (!commits.length) {
      log(chalk.yellow(`{red No Commits Found}. Did you mean to publish ${packageName}?`))
    }

    log(`${commits.length} Commits`)

    const newVersion = getNewVersion(pkg.version, commits) as string

    log(chalk.green(`{New Version}: ${newVersion}`))
    await updatePackage(cwd, pkg, newVersion)
    updateChangelog(commits, changelogCwd, shortName, newVersion)
    const res = await confirmResult()
    if (!res) return
    await commitChanges(shortName, newVersion)
    const tagName = await tag(cwd, shortName, newVersion)
    await pushGit(cwd, tagName)
    await publish(cwd)
  }
  catch (e) {
    log(chalk.red(`执行${step}失败：请手动更新剩余步骤`))
    log(e)
    process.exit(1)
  }
})()
