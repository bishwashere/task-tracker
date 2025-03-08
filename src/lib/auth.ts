"use server";
import NextAuth, { CredentialsSignin } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { schema } from "./schema"
import bcrypt from "bcryptjs"

const adapter = PrismaAdapter(prisma);
class InvalidLoginError extends CredentialsSignin {
  code = "Invalid username or password"
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  providers: [Google, GitHub, Credentials({
    credentials: {
      email: {},
      password: {}
    },
    authorize: async (credentials) => {
      const validatedCredentials = schema.parse(credentials);
      
      const user = await prisma.user.findFirst({
        where: {
          email: validatedCredentials.email,
        }
      });
      const passwordMatch = await bcrypt.compare(validatedCredentials.password, user?.password || "");
      if(passwordMatch){
        return {id: user?.id, name: user?.name, email: user?.email, image: user?.image};;
      }
      throw new InvalidLoginError()
    }
  })],
  session: {strategy: "jwt"},
  callbacks: {
    async session({ session, token }) {
      return{
        ...session,
        user: {
          ...session.user,
          id: token.sub
        }
      }
    }
  },
  // callbacks: {
  //   async jwt({ token, account, user }) {
  //     // if (account?.type === "credentials") {
  //     //   token.credentials = true;
  //     // }
  //     if(user){
  //       token.id = user.id;
  //     }
  //     return token;
  //   },
  //   async session({ session, token }) {
  //     if(session.user){
  //       session.user.id = token.id as string;
  //     }
  //     return session;
  //   }
  // },
  // jwt: {
  //   encode: async function (params) {
  //     if (params.token?.credentials) {
  //       const sessionToken = uuid();

  //       if (!params.token.sub) {
  //         throw new Error("No user ID found in token");
  //       }

  //       const createdSession = await adapter?.createSession?.({
  //         sessionToken: sessionToken,
  //         userId: params.token.sub,
  //         expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  //       });

  //       if (!createdSession) {
  //         throw new Error("Failed to create session");
  //       }

  //       return sessionToken;
  //     }
  //     return defaultEncode(params);
  //   },
  // },
  pages:{
    signIn: '/login',
    error: '/login',
  }
})