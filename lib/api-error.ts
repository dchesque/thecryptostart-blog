import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

type KnownError = Prisma.PrismaClientKnownRequestError

function formatTarget(meta: KnownError['meta']) {
    const target = meta?.target
    if (Array.isArray(target)) {
        return target.join(', ')
    }
    if (typeof target === 'string') {
        return target
    }
    return undefined
}

function logError(entity: string, error: unknown) {
    console.error(`[${entity} API Error]`, error)
}

export function handleApiError(error: unknown, entity: string) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const baseMeta = {
            code: error.code,
            target: formatTarget(error.meta),
        }

        switch (error.code) {
            case 'P2002':
                logError(entity, error)
                return NextResponse.json(
                    {
                        ...baseMeta,
                        error: `${entity} already exists with the same unique values`,
                        code: 'CONFLICT',
                    },
                    { status: 409 }
                )
            case 'P2003':
                logError(entity, error)
                return NextResponse.json(
                    {
                        error: `Invalid relationship while saving ${entity}`,
                        code: 'INVALID_REFERENCE',
                        field: (error.meta?.field_name as string) || undefined,
                    },
                    { status: 400 }
                )
            case 'P2025':
                logError(entity, error)
                return NextResponse.json(
                    {
                        error: `${entity} not found`,
                        code: 'NOT_FOUND',
                    },
                    { status: 404 }
                )
            default:
                logError(entity, error)
                return NextResponse.json(
                    {
                        ...baseMeta,
                        error: 'Database error',
                        code: error.code,
                    },
                    { status: 500 }
                )
        }
    }

    logError(entity, error)
    return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
    )
}
