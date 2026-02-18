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
        console.log("🔐 Login attempt for:", credentials?.email)
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          return null
        }

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
          console.log("❌ User not found:", credentials.email)
          return null
        }

        console.log("👤 User found, checking password...")

        if (!user.passwordHash) {
          console.log("❌ User has no password hash")
          return null
        }

        const isValid = await compare(credentials.password as string, user.passwordHash)
        console.log("🔑 Password valid:", isValid)

        if (isValid) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles.map((r: { role: any }) => r.role),
          }
        }

        return null
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
