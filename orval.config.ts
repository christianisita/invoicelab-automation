import { defineConfig } from 'orval'

export default defineConfig({
  invoicelab: {
    input: {
      target: process.env.SWAGGER_URL || 'http://localhost:3001/openapi.json',
      unsafeDisableValidation: true,
    },
    output: {
      mode: 'tags',
      target: './framework/api/schema',
      client: 'zod',
      fileExtension: '.ts',
    },
  },
})
