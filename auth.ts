import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"

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
          return null
        }

        // Mock user database (substituir por DB real em produção)
        const users = [
          {
            id: "1",
            email: "admin@cryptoacademy.com",
            name: "Admin",
            password: "$2b$12$dZxzgyIN3TGhYps44OhQc..pN1PrKnvDac7/S1tIM7qHkd8F1Wuam" // "admin123"
          }
        ]

        const user = users.find(u => u.email === credentials.email)

        if (!user) {
          return null
        }

        const isValid = await compare(credentials.password as string, user.password)

        if (isValid) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
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
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
})
