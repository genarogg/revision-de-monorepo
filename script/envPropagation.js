import { config } from 'dotenv'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

config({ path: resolve(process.cwd(), '.env') })

const env = {
  ...process.env,
}

// Directorios donde se duplicará el .env
const targets = [
  'backend',
  'frontend',
]

function propagateEnv() {
  const envContent = Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  for (const target of targets) {
    const targetPath = resolve(process.cwd(), target, '.env')
    writeFileSync(targetPath, envContent)
    console.log(`✓ .env propagado a /${target}`)
  }
}

propagateEnv()