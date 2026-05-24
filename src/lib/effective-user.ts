import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const VIEW_AS_USER_COOKIE = "view-as-user-id";
export const VIEW_AS_ORG_COOKIE = "view-as-org-id";

/** @deprecated Use VIEW_AS_USER_COOKIE */
export const VIEW_AS_COOKIE = VIEW_AS_USER_COOKIE;

export type EffectiveUserContext = {
  realUserId: string;
  effectiveUserId: string;
  isViewingAs: boolean;
  /** Whether the current request should use admin data paths. */
  isAdmin: boolean;
  /** Whether the signed-in user is an org admin (ignores view-as). */
  isRealAdmin: boolean;
  role: "admin" | "member";
  viewingAsUser?: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

export type EffectiveUserResult =
  | EffectiveUserContext
  | { error: string };

async function getRealAdminStatus(userId: string, organizationId?: string) {
  if (!organizationId) return false;

  const membership = await prisma.userOrganization.findFirst({
    where: { userId, organizationId },
    select: { role: true },
  });

  return membership?.role.toUpperCase() === "ADMIN";
}

function toRole(isAdmin: boolean): "admin" | "member" {
  return isAdmin ? "admin" : "member";
}

function buildSelfContext(
  realUserId: string,
  isRealAdmin: boolean,
): EffectiveUserContext {
  return {
    realUserId,
    effectiveUserId: realUserId,
    isViewingAs: false,
    isAdmin: isRealAdmin,
    isRealAdmin,
    role: toRole(isRealAdmin),
  };
}

async function resolveViewAsContext(
  realUserId: string,
  organizationId: string,
  viewAsUserId: string,
): Promise<EffectiveUserContext> {
  const [adminMembership, targetMembership, targetUser] = await Promise.all([
    prisma.userOrganization.findFirst({
      where: { userId: realUserId, organizationId, role: "ADMIN" },
    }),
    prisma.userOrganization.findFirst({
      where: { userId: viewAsUserId, organizationId },
    }),
    prisma.user.findUnique({
      where: { id: viewAsUserId },
      select: { id: true, name: true, email: true },
    }),
  ]);

  if (!adminMembership || !targetMembership || !targetUser) {
    const isRealAdmin = !!adminMembership;
    return buildSelfContext(realUserId, isRealAdmin);
  }

  if (targetMembership.role.toUpperCase() !== "MEMBER") {
    const isRealAdmin = !!adminMembership;
    return buildSelfContext(realUserId, isRealAdmin);
  }

  return {
    realUserId,
    effectiveUserId: viewAsUserId,
    isViewingAs: true,
    isAdmin: false,
    isRealAdmin: true,
    role: "member",
    viewingAsUser: targetUser,
  };
}

/**
 * Resolves the user identity and role for the current request.
 * View-as admins run through the same member paths as the impersonated user.
 */
export async function getEffectiveUser(
  organizationId?: string,
): Promise<EffectiveUserResult> {
  const user = await auth();
  if (!user?.user?.id) {
    return { error: "Unauthorized !" };
  }

  const realUserId = user.user.id;
  const cookieStore = await cookies();
  const viewAsUserId = cookieStore.get(VIEW_AS_USER_COOKIE)?.value;
  const viewAsOrgId = cookieStore.get(VIEW_AS_ORG_COOKIE)?.value;
  const orgId = organizationId ?? viewAsOrgId ?? undefined;

  if (!viewAsUserId || viewAsUserId === realUserId) {
    const isRealAdmin = await getRealAdminStatus(realUserId, orgId);
    return buildSelfContext(realUserId, isRealAdmin);
  }

  if (!orgId) {
    return buildSelfContext(realUserId, false);
  }

  return resolveViewAsContext(realUserId, orgId, viewAsUserId);
}

/** Shared access helper for project/org scoped server actions. */
export async function getOrgAccessContext(organizationId: string) {
  return getEffectiveUser(organizationId);
}

export async function getProjectAccessContext(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { organizationId: true },
  });

  if (!project) {
    return { error: "Project not found." as const };
  }

  const effective = await getEffectiveUser(project.organizationId);
  if ("error" in effective) {
    return effective;
  }

  const membership = await prisma.userOrganization.findFirst({
    where: {
      userId: effective.effectiveUserId,
      organizationId: project.organizationId,
    },
    select: { role: true },
  });

  if (!membership) {
    return { error: "You are not part of this organization." as const };
  }

  return {
    ...effective,
    organizationId: project.organizationId,
    projectId,
  };
}
