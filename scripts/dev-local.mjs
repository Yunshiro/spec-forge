import { spawn } from 'node:child_process'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const processes = [
  spawn(npmCommand, ['run', 'api'], { stdio: 'inherit', shell: false }),
  spawn(npmCommand, ['run', 'dev'], { stdio: 'inherit', shell: false }),
]

for (const child of processes) {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      shutdown(code)
    }
  })
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

function shutdown(code) {
  for (const child of processes) {
    if (!child.killed) child.kill()
  }

  process.exit(code)
}
