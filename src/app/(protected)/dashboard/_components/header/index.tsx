"use client";
import React, { useEffect, useRef, useState } from "react";
import AddOrganizationModal from "./add-organization-modal";
import { useListUserOrganizations } from "@/queries/organizations/hooks";
import { Org, useDashboardContext } from "@/context/dashboard-context";
import ProfileMenu from "@/components/common/profile-menu";
import { IoIosAddCircleOutline } from "react-icons/io";
import GuidedOrganizationModal from "../guided-organization/guided-organization-modal";

const Header = () => {
  const orgs = useListUserOrganizations();
  const { selectedOrg, setSelectedOrg, guidedMode } = useDashboardContext();
  const [isAddOrganizationModalOpen, setIsAddOrganizationModalOpen] = useState(false);
  const [isGuidedAddOrganizationModalOpen, setIsGuidedAddOrganizationModalOpen] = useState(false);

  const openAddOrganizationModal = () => {
    if (guidedMode) setIsGuidedAddOrganizationModalOpen(true);
    else setIsAddOrganizationModalOpen(true);
  }

  return (
    <div className="flex justify-between items-center mb-6 flex-col sm:flex-row">
      <h1 className="text-lg sm:text-2xl md:text-3xl font-bold ">
        Project List
      </h1>
      <div className="flex items-center space-x-4 justify-center">
        {/* Add Organization */}
        <button onClick={openAddOrganizationModal} className="tooltip">
          <IoIosAddCircleOutline className="text-3xl cursor-pointer opacity-90 hover:opacity-100" />
          <p className="tooltiptext">Add Organization</p>
        </button>

        <AddOrganizationModal isOpen={isAddOrganizationModalOpen} onOpenChange={setIsAddOrganizationModalOpen} />
        <GuidedOrganizationModal isOpen={isGuidedAddOrganizationModalOpen} onOpenChange={setIsGuidedAddOrganizationModalOpen} />

        {/* Organization Selector */}
        {(orgs.data?.length || 0) > 0 && selectedOrg && (
          <select
            value={selectedOrg.id}
            onChange={(e) =>
              setSelectedOrg(
                orgs.data?.find((org) => org.id === e.target.value) as Org,
              )
            }
            className="border p-2 rounded"
          >
            {orgs.data?.map((org) => (
              <option key={org.id} value={org.id}>
                {org.organization?.name}
              </option>
            ))}
          </select>
        )}
        <ProfileMenu showSettings={true} />
      </div>
    </div>
  );
};

export default Header;
