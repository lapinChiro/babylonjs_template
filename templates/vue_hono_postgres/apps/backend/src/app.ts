import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { storeUserApi, storeItemApi, storeHealthApi, storeAuthApi } from './apis/index.js'

export const app = new OpenAPIHono()

// Middleware
app.use('*', logger())
app.use('*', cors())

// Routes
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

storeHealthApi(app)
storeUserApi(app)
storeItemApi(app)
storeAuthApi(app)


// OpenAPI仕様書の生成
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Project Manager API',
    description: 'Vue + Hono + PostgreSQL プロジェクト管理API'
  }
})

// Swagger UI エンドポイント
app.get('/swagger-ui', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Documentation</title>
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-bundle.js"></script>
      <script>
        SwaggerUIBundle({
          url: '/doc',
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.presets.standalone
          ]
        })
      </script>
    </body>
    </html>
  `)
})