"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types/action";
import { Organization } from "@prisma/client";

export type CreateOrganizationProps = {
  name: string;
};

export const createOrganization = async ({
  name,
}: CreateOrganizationProps): Promise<ActionResponse<Organization>> => {
  try {
    const user = await auth();
    if (!user || !user.user || !user.user.id) {
      return { success: false, message: "Unauthorized !" };
    } else {
      const organization = await prisma.organization.create({
        data: {
          name,
          members: {
            create: {
              userId: user.user.id,
              role: "ADMIN", // Set user as admin
            },
          },
        },
      });
      return {
        success: true,
        message: "Organization created!",
        data: organization,
      };
    }
  } catch (error) {
    return { success: false, message: "Failed to create organization." };
  }
};

export const listAllUsersOrganizations = async () => {
  try {
    const user = await auth();
    if (!user || !user.user || !user.user.id) {
      return { success: false, message: "Unauthorized !" };
    } else {
      const memberships = await prisma.userOrganization.findMany({
        where: { userId: user.user.id },
        include: {
          organization: {
            include: {
              members: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true, image: true },
                  },
                },
              },
            },
          },
        },
      });

      return { success: true, data: memberships };
    }
  } catch (error) {
    return { success: false, message: "Failed to fetch organizations" };
  }
};

export type UpdateOrganizationNameProps = {
  organizationId: string;
  newName: string;
};

export const updateOrganizationName = async (
  data: UpdateOrganizationNameProps
) => {
  const user = await auth();

  if (!user || !user.user || !user.user.id) {
    return { success: false, message: "Unauthorized !" };
  }
  try {
    //Check if user is an ADMIN in the organization
    const adminCheck = await prisma.userOrganization.findFirst({
      where: {
        organizationId: data.organizationId,
        userId: user.user.id,
        role: "ADMIN",
      },
    });

    if (!adminCheck) {
      return {
        success: false,
        message: "Only admins can update organization name",
      };
    }
    //Update organization name
    await prisma.organization.update({
      where: { id: data.organizationId },
      data: { name: data.newName },
    });

    return {
      success: true,
      message: "Organization name updated successfully",
    };
  } catch (error) {
    console.error("Error updating organization name:", error);
    return { success: false, message: "Failed to update organization name" };
  }
};

export type AddUserToOrganizationProps = {
  organizationId: string;
  userEmail: string;
  role: "ADMIN" | "MEMBER";
};

export const addUserToOrganization = async ({
  organizationId,
  userEmail,
  role,
}: AddUserToOrganizationProps) => {
  const user = await auth();
  if (!user || !user.user || !user.user.id) {
    return { success: false, message: "Unauthorized !" };
  }

  try {
    // Check if the logged-in user is an admin in the organization
    const adminCheck = await prisma.userOrganization.findFirst({
      where: {
        userId: user.user.id,
        organizationId,
        role: "ADMIN",
      },
    });

    if (!adminCheck) {
      return {
        success: false,
        message: "Only admins can add users to the organization.",
      };
    }

    // Find the user to add by email
    const userToAdd = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!userToAdd) {
      return { success: false, message: "User not registered!" };
    }

    // Check if the user is already in the organization
    const existingMembership = await prisma.userOrganization.findFirst({
      where: {
        userId: userToAdd.id,
        organizationId,
      },
    });

    if (existingMembership) {
      return {
        success: false,
        message: "User is already a member of this organization.",
      };
    }
    // Add user to organization if not already in the organization.
    // todo fix error
    const member = await prisma.userOrganization.create({
      data: {
        userId: userToAdd.id,
        organizationId,
        role,
      },
    });

    return {
      success: true,
      message: "User added to organization successfully.",
      data: member,
    };
  } catch (error) {
    console.error("Error adding user to organization:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};
