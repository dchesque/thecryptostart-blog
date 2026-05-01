import { NextResponse } from 'next/server'

export const dynamic = 'force-static'
export const revalidate = 3600

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>API Docs — The Crypto Start</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css">
    <style>body { margin:0; background:#fafafa; } #swagger { padding: 16px; }</style>
</head>
<body>
    <div id="swagger"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function() {
        window.ui = SwaggerUIBundle({
          url: "/api/openapi.json",
          dom_id: "#swagger",
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: "StandaloneLayout",
          persistAuthorization: true
        });
      };
    </script>
</body>
</html>`

export async function GET() {
    return new NextResponse(HTML, {
        headers: {
            'content-type': 'text/html; charset=utf-8',
            'X-Robots-Tag': 'noindex',
        },
    })
}
