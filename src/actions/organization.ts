"use server";
import { prisma } from "@/lib/prisma";
import { isUserValid } from "./isUserValid";

export const createOrganization = async (formData: FormData) => {
  const userId = await isUserValid();
  if (!userId) {
    return { success: false, message: "Unauthorized !" };
  }
  try {
    const name = formData.get("organizationName") as string;

    if (!name || name.trim() === "") {
      return { success: false, message: "Organization name is required." };
    }

    // Create organization and set the user as an admin
    const organization = await prisma.organization.create({
      data: {
        name,
        members: {
          create: {
            userId,
            role: "ADMIN", // Set user as admin
          },
        },
      },
      select: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
        },
        projects: true,
        name: true,
        id: true,
        createdAt: true
      }
    });

    return { success: true, message: "Organization created!", organization };
  } catch (error) {
    console.error("Error creating organization:", error);
    return { success: false, message: "Failed to create organization." };
  }
}

export const updateOrganizationName = async (organizationId: string, newName: string) => {
  const userId = await isUserValid();
  if (!userId) {
    return { success: false, message: "Unauthorized !" };
  }
  try {
    //Check if user is an ADMIN in the organization
    const adminCheck = await prisma.userOrganization.findFirst({
      where: {
        organizationId,
        userId,
        role: "ADMIN",
      },
    });
    if (!adminCheck) {
      return { success: false, message: "Only admins can update organization name" };
    }
    //Update organization name
    await prisma.organization.update({
      where: { id: organizationId },
      data: { name: newName },
    });
    return { success: true, message: "Organization name updated successfully" };
  } catch (error) {
    console.error("Error updating organization name:", error);
    return { success: false, message: "Failed to update organization name" };
  }
};

export const addUserToOrganization = async (organizationId: string, userEmail: string, role: "ADMIN" | "MEMBER" = "MEMBER") => {
  const userId = await isUserValid();
  if (!userId) {
    return { success: false, message: "Unauthorized !" };
  }
  try {
    // Check if the logged-in user is an admin in the organization
    const adminCheck = await prisma.userOrganization.findFirst({
      where: {
        userId: userId,
        organizationId,
        role: "ADMIN",
      },
    });
    if (!adminCheck) {
      return { success: false, message: "Only admins can add users to the organization." };
    }
    // Find the user to add by email
    const userToAdd = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!userToAdd) {
      return { success: false, message: "User not found." };
    }
    // Check if the user is already in the organization
    const existingMembership = await prisma.userOrganization.findFirst({
      where: {
        userId: userToAdd.id,
        organizationId,
      },
    });
    if (existingMembership) {
      return { success: false, message: "User is already a member of this organization." };
    }
    // Add user to organization
    await prisma.userOrganization.create({
      data: {
        userId: userToAdd.id,
        organizationId,
        role,
      },
    });

    return { success: true, message: "User added to organization successfully." };
  } catch (error) {
    console.error("Error adding user to organization:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
};
