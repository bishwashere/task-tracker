"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { MdLogout } from "react-icons/md";
import logOut from "@/queries/auth/action";
import { Edit2Icon, SettingsIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useDashboardContext } from "@/context/dashboard-context";
import EditOrganizationModal from "./edit-organization-modal";
import SubscriptionStatus from "../subsrription-status";
import { Avatar } from "@/components/ui/avatar";
import { IoSettingsOutline } from "react-icons/io5";

const ProfileMenu = ({
  showSettings,
  onEditButtonClick,
}: {
  showSettings: boolean;
  onEditButtonClick?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const { selectedOrg, setSelectedOrg } = useDashboardContext();
  const [editOrganizationModalIsOpen, setEditOrganizationModalIsOpen] =
    useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle dropdown and ensure it closes when clicking the button again
  const handleProfileClick = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative mt-2 w-fit" ref={menuRef}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <SubscriptionStatus />
        {/* Edit Organizations */}
        {/* Only edit section if user is admin of that organization */}
        <button onClick={handleProfileClick}>
          <SettingsIcon className="size-7 cursor-pointer p-1" />
        </button>
      </div>
      {isOpen && (
        <div
          className="absolute right-0 min-w-48 bg-white rounded-lg py-2 w-fit"
          style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
        >
          <div className="px-3 p-2  flex gap-2.5">
            <Avatar
              src={session?.user?.image || ""}
              alt={session?.user?.name || ""}
              size="sm"
            />
            <div className="flex flex-col">
              <p className="text-md font-semibold">{session?.user?.name}</p>
              <p className="text-sm font-semibold text-gray-500">
                {session?.user?.email}
              </p>
            </div>
          </div>
          {onEditButtonClick && (
            <Fragment>
              <hr className="border border-gray-300 my-1" />
              <button
                onClick={() => {
                  onEditButtonClick();
                  setIsOpen(false);
                }}
                className="flex flex-row gap-3 items-center w-full px-3 py-1 text-left hover:bg-gray-100 text-md"
              >
                <Edit2Icon className="size-4" />
                Edit
              </button>
            </Fragment>
          )}
          <hr className="border border-gray-300 my-1" />
          {showSettings && selectedOrg && selectedOrg?.role === "ADMIN" && (
            <button
              className="flex flex-row gap-3 items-center w-full px-3 py-1 text-left hover:bg-gray-100 text-md"
              onClick={() => {
                setEditOrganizationModalIsOpen(true);
                setIsOpen(false);
              }}
            >
              <IoSettingsOutline />
              Settings
            </button>
          )}
          <button
            onClick={() => logOut()}
            className="flex flex-row gap-3 items-center w-full px-3 py-1 text-left hover:bg-gray-100 text-md"
          >
            <MdLogout />
            Log out
          </button>
        </div>
      )}
      <EditOrganizationModal
        isOpen={editOrganizationModalIsOpen}
        onOpenChange={setEditOrganizationModalIsOpen}
      />
    </div>
  );
};

export default ProfileMenu;
