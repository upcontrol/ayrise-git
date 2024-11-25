// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const { db } = await connectToDatabase()
        const user = await db.collection("users").findOne({ email: credentials.email })

        if (!user) {
          return null
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordCorrect) {
          return null
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          username: user.username,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.username = token.username
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }