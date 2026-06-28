import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const SCHEMA_DIR = join(__dirname, '../framework/api/schema')

// Matches: export const FooBar = zod.object(...) or zod.array(...) etc.
const SCHEMA_EXPORT_RE = /^export const ([A-Z][A-Za-z0-9]+)\s*=/gm

function appendTypes(filePath: string): void {
  const source = readFileSync(filePath, 'utf-8')

  const schemaNames: string[] = []
  let match: RegExpExecArray | null
  while ((match = SCHEMA_EXPORT_RE.exec(source)) !== null) {
    schemaNames.push(match[1])
  }

  if (schemaNames.length === 0) return

  const typeBlock = [
    '',
    '// Inferred TypeScript types',
    ...schemaNames.map((name) => `export type ${name} = zod.infer<typeof ${name}>`),
    '',
  ].join('\n')

  // Avoid duplicating the type block on regeneration
  const marker = '// Inferred TypeScript types'
  const existing = source.includes(marker) ? source.slice(0, source.indexOf(marker)).trimEnd() : source.trimEnd()

  writeFileSync(filePath, existing + '\n' + typeBlock)
  console.log(`Types appended: ${filePath}`)
}

const files = readdirSync(SCHEMA_DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts')
files.forEach((f) => appendTypes(join(SCHEMA_DIR, f)))
