import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// ה-export הזה קריטי! הוא מאפשר ל-app/page.js לייבא את ההגדרות
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await dbConnect();

          // חיפוש המשתמש
          const user = await User.findOne({ email: credentials.email }).lean();
          if (!user) {
            console.log("User not found in DB");
            return null;
          }

          // השוואת סיסמאות (מחייב שהסיסמה ב-DB תהיה מוצפנת ב-bcrypt)
          const passwordsMatch = await bcrypt.compare(credentials.password, user.password);
          if (!passwordsMatch) {
            console.log("Password mismatch");
            return null;
          }

          // החזרת המשתמש לסשן
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || "user",
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // מעביר את ה-ID וה-Role מהמשתמש ל-Token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // מעביר את המידע מה-Token ל-Session שזמין בדפדפן ובדפים
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };