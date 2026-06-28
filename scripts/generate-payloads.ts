import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join, basename } from 'path'

const SCHEMA_DIR = join(__dirname, '../framework/api/schema')
const PAYLOAD_DIR = join(__dirname, '../framework/api/payload')

const BODY_SCHEMA_RE = /^export const ((Post|Put)[A-Z][A-Za-z0-9]+Body)\s*=/gm

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function factoryName(schemaName: string): string {
  return `generate${capitalize(schemaName.charAt(0))}${schemaName.slice(1)}`
}

function generatePayloadFile(tag: string, schemaNames: string[]): void {
  const imports = schemaNames.join(', ')
  const factories = schemaNames
    .map((name) => `export const ${factoryName(name)} = createPayloadFactory(${name})`)
    .join('\n')

  const content = [
    '// Generated — do not edit manually. Run `npm run schema:generate` to regenerate.',
    `import { ${imports} } from '../schema/${tag}'`,
    `import { createPayloadFactory } from './_utils'`,
    '',
    factories,
    '',
  ].join('\n')

  writeFileSync(join(PAYLOAD_DIR, `${tag}.ts`), content)
  console.log(`Payload generated: ${tag}.ts (${schemaNames.join(', ')})`)
}

const files = readdirSync(SCHEMA_DIR).filter(
  (f) => f.endsWith('.ts') && f !== 'index.ts' && !f.startsWith('_'),
)

for (const file of files) {
  const tag = basename(file, '.ts')
  const source = readFileSync(join(SCHEMA_DIR, file), 'utf-8')

  const matches: string[] = []
  let match: RegExpExecArray | null
  while ((match = BODY_SCHEMA_RE.exec(source)) !== null) {
    matches.push(match[1])
  }

  if (matches.length === 0) continue
  generatePayloadFile(tag, matches)
}
