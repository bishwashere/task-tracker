"use server";

import {
  getEffectiveUser,
  VIEW_AS_ORG_COOKIE,
  VIEW_AS_USER_COOKIE,
  type EffectiveUserContext,
} from "@/lib/effective-user";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type ViewAsState = {
  isViewingAs: boolean;
  viewingAsUser: EffectiveUserContext["viewingAsUser"] | null;
  role: "admin" | "member";
};

export async function getViewAsState(
  organizationId: string,
): Promise<{ success: true; state: ViewAsState } | { success: false; message: string }> {
  const ctx = await getEffectiveUser(organizationId);

  if ("error" in ctx) {
    return { success: false, message: ctx.error };
  }

  return {
    success: true,
    state: {
      isViewingAs: ctx.isViewingAs,
      viewingAsUser: ctx.viewingAsUser ?? null,
      role: ctx.role,
    },
  };
}

export async function setViewAsUser(
  organizationId: string,
  userId: string | null,
) {
  const ctx = await getEffectiveUser(organizationId);

  if ("error" in ctx) {
    return { success: false, message: ctx.error };
  }

  if (!ctx.isRealAdmin) {
    return { success: false, message: "Only admins can use View As." };
  }

  const cookieStore = await cookies();

  if (!userId) {
    cookieStore.delete(VIEW_AS_USER_COOKIE);
    cookieStore.delete(VIEW_AS_ORG_COOKIE);
    revalidatePath("/", "layout");
    return { success: true, message: "View As cleared." };
  }

  const targetMembership = await prisma.userOrganization.findFirst({
    where: {
      userId,
      organizationId,
      role: "MEMBER",
    },
  });

  if (!targetMembership) {
    return {
      success: false,
      message: "You can only view as non-admin members in this organization.",
    };
  }

  cookieStore.set(VIEW_AS_USER_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  cookieStore.set(VIEW_AS_ORG_COOKIE, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  revalidatePath("/", "layout");
  return { success: true, message: "View As updated." };
}

export type ViewAsMember = {
  id: string;
  name: string | null;
  email: string | null;
};

export async function getViewAsMembers(organizationId: string) {
  const ctx = await getEffectiveUser(organizationId);

  if ("error" in ctx) {
    return { success: false, message: ctx.error };
  }

  if (!ctx.isRealAdmin) {
    return { success: false, message: "Only admins can use View As." };
  }

  const members = await prisma.userOrganization.findMany({
    where: {
      organizationId,
      role: "MEMBER",
      userId: { not: ctx.realUserId },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  const sorted = members
    .map((entry) => ({
      id: entry.user.id,
      name: entry.user.name,
      email: entry.user.email,
    }))
    .sort((a, b) =>
      (a.name || a.email || "").localeCompare(b.name || b.email || ""),
    );

  return { success: true, members: sorted };
}
