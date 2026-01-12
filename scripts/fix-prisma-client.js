// Post-install script to fix Prisma client default.js export
const fs = require('fs')
const path = require('path')

const clientPath = path.join(__dirname, '../node_modules/.prisma/client')
const defaultJsPath = path.join(clientPath, 'default.js')

if (fs.existsSync(clientPath)) {
  // Create a proper default.js that exports from client.ts
  const defaultJsContent = `// Auto-generated fix for Prisma client
// This file re-exports from the TypeScript client
// Next.js will handle the TypeScript compilation

// Use dynamic import for ES modules
if (typeof require !== 'undefined' && require.extensions['.ts']) {
  module.exports = require('./client.ts')
} else {
  // Fallback: try to require the compiled version or use a workaround
  try {
    // Try to load via @prisma/client which should handle the resolution
    const prismaClient = require('@prisma/client')
    module.exports = prismaClient
  } catch (e) {
    // Last resort: export a proxy that will be resolved at runtime
    module.exports = new Proxy({}, {
      get(target, prop) {
        // This will be resolved by Next.js/Turbopack
        const client = require('./client')
        return client[prop]
      }
    })
  }
}
`

  fs.writeFileSync(defaultJsPath, defaultJsContent)
  console.log('✅ Fixed Prisma client default.js')
} else {
  console.log('⚠️  Prisma client not found, run "npx prisma generate" first')
}
