import { spawnSync } from 'child_process'

export function run(cmd: string, opts: { allowFail?: boolean } = {}): string {
  const result = spawnSync(cmd, { shell: true, encoding: 'utf-8' })
  if (!opts.allowFail && result.status !== 0) {
    throw new Error(`Command failed: ${cmd}\n${result.stderr}`)
  }
  return result.stdout.trim()
}

export function generateSchemas(): void {
  const swaggerUrl = process.env.SWAGGER_URL
  if (!swaggerUrl) throw new Error('SWAGGER_URL environment variable is required')
  console.log('Generating schemas from swagger...')
  run(`SWAGGER_URL="${swaggerUrl}" npx orval --config orval.config.ts`)
  run('npx ts-node scripts/generate-types.ts')
  run('npx ts-node scripts/generate-payloads.ts')
  console.log('Schema generation complete.')
}

export function detectDrift(): string {
  return run('git diff -- framework/api/schema/', { allowFail: true })
}

export function getChangedFiles(): string[] {
  const output = run('git diff --name-only -- framework/api/schema/', { allowFail: true })
  return output ? output.split('\n').filter(Boolean) : []
}

if (require.main === module) {
  generateSchemas()

  const drift = detectDrift()
  if (!drift) {
    console.log('No schema drift detected.')
    process.exit(0)
  }

  const changed = getChangedFiles()
  console.log(`Drift detected in ${changed.length} file(s):`)
  changed.forEach((f) => console.log(` • ${f}`))
}
