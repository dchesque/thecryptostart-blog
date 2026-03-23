import { auth } from "@/auth"
import { NextResponse } from "next/server"

/**
 * Checks if the request is authorized via session or ADMIN_API_KEY.
 * Returns null if authorized, or a NextResponse with 401 if not.
 */
export async function checkApiAuth(req: Request) {
    const session = await auth()
    
    // Check for API Key in headers or query params
    const url = new URL(req.url)
    const apiKeyParam = url.searchParams.get('key')
    const apiKeyHeader = req.headers.get('x-api-key')
    
    const isValidApiKey = (apiKeyParam === process.env.ADMIN_API_KEY) || (apiKeyHeader === process.env.ADMIN_API_KEY)

    if (!session?.user && !isValidApiKey) {
        return NextResponse.json({ 
            error: 'Unauthorized', 
            message: 'Requisição requer autenticação de sessão ou uma ADMIN_API_KEY válida.' 
        }, { status: 401 })
    }

    return null
}
