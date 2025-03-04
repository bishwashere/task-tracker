import NextAuth, { CredentialsSignin } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { schema } from "./schema"
import bcrypt, { hash } from "bcryptjs"
import { v4 as uuid } from "uuid";
import { encode as defaultEncode } from "next-auth/jwt";

const adapter = PrismaAdapter(prisma);
class InvalidLoginError extends CredentialsSignin {
  code = "Invalid username or password"
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  providers: [Google, GitHub, Credentials({
    credentials: {
      username: {},
      password: {}
    },
    authorize: async (credentials) => {
      const validatedCredentials = schema.parse(credentials);
      
      const user = await prisma.user.findFirst({
        where: {
          username: validatedCredentials.username,
        }
      });
      const passwordMatch = await bcrypt.compare(validatedCredentials.password, user?.password || "");
      if(passwordMatch){
        return user;
      }
      throw new InvalidLoginError()
    }
  })],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.type === "credentials") {
        token.credentials = true;;
      }
      return token;
    }
  },
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = uuid();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
  pages:{
    signIn: '/login',
    error: '/login',
  }
})