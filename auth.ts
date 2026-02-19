import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Missing credentials");
          return null
        }

        try {
          console.log(`[Auth] Attempting login for: ${credentials.email}`);
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            include: {
              roles: {
                select: {
                  role: true
                }
              }
            }
          })

          if (!user) {
            console.log(`[Auth] User not found: ${credentials.email}`);
            return null
          }

          if (!user.passwordHash) {
            console.log(`[Auth] User has no password hash: ${credentials.email}`);
            return null
          }

          const isValid = await compare(credentials.password as string, user.passwordHash)

          if (isValid) {
            console.log(`[Auth] Login successful: ${credentials.email}`);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              roles: user.roles.map((r: { role: any }) => r.role),
            }
          }

          console.log(`[Auth] Invalid password for: ${credentials.email}`);
          return null
        } catch (error) {
          console.error("[Auth] Database error during authorize:", error);
          throw error; // Rethrow to let NextAuth handle it or show in logs
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.roles = user.roles
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.roles = (token.roles as any) || []
      }
      return session
    }
  },
  trustHost: true
})
