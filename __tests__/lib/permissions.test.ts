/**
 * @jest-environment node
 */
import { hasPermission, hasRole, AuthUtils } from '@/lib/permissions'
import type { Session } from 'next-auth'

describe('hasRole', () => {
    it('returns true when role is in list', () => {
        expect(hasRole(['ADMIN', 'EDITOR'] as any, 'ADMIN' as any)).toBe(true)
    })
    it('returns false when role is missing', () => {
        expect(hasRole(['AUTHOR'] as any, 'ADMIN' as any)).toBe(false)
    })
})

describe('hasPermission', () => {
    it('ADMIN has MANAGE_USERS', () => {
        expect(hasPermission(['ADMIN'] as any, 'MANAGE_USERS' as any)).toBe(true)
    })
    it('AUTHOR does not have MANAGE_USERS', () => {
        expect(hasPermission(['AUTHOR'] as any, 'MANAGE_USERS' as any)).toBe(false)
    })
    it('EDITOR can MODERATE_COMMENTS', () => {
        expect(hasPermission(['EDITOR'] as any, 'MODERATE_COMMENTS' as any)).toBe(true)
    })
    it('AUTHOR can EDIT_OWN_POST', () => {
        expect(hasPermission(['AUTHOR'] as any, 'EDIT_OWN_POST' as any)).toBe(true)
    })
})

describe('AuthUtils', () => {
    const adminSession: Session = {
        user: { id: '1', name: 'A', email: 'a@b.co', roles: ['ADMIN'] as any },
        expires: '9999-12-31',
    } as any
    const authorSession: Session = {
        user: { id: '2', name: 'B', email: 'b@c.co', roles: ['AUTHOR'] as any },
        expires: '9999-12-31',
    } as any

    it('requireAuth throws on null session', () => {
        expect(() => AuthUtils.requireAuth(null)).toThrow('Authentication required')
    })

    it('requireRole(ADMIN) passes for admin', () => {
        expect(() => AuthUtils.requireRole(adminSession, 'ADMIN' as any)).not.toThrow()
    })

    it('requireRole(ADMIN) throws for author', () => {
        expect(() => AuthUtils.requireRole(authorSession, 'ADMIN' as any))
            .toThrow(/Forbidden/)
    })

    it('requirePermission(MANAGE_USERS) throws for author', () => {
        expect(() => AuthUtils.requirePermission(authorSession, 'MANAGE_USERS' as any))
            .toThrow(/Forbidden/)
    })

    it('requirePermission(EDIT_OWN_POST) passes for author', () => {
        expect(() => AuthUtils.requirePermission(authorSession, 'EDIT_OWN_POST' as any))
            .not.toThrow()
    })
})
