"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { MdLogout } from "react-icons/md";
import { HiCurrencyDollar } from "react-icons/hi2";
import logOut from "@/queries/auth/action";
import { Edit2Icon, SettingsIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useDashboardContext } from "@/context/dashboard-context";
import { useAppRole, useIsRealAdmin } from "@/context/view-as-context";
import EditOrganizationModal from "./edit-organization-modal";
import SubscriptionStatus, {
  SubscriptionMenuItem,
} from "../subscription-status";
import { Avatar } from "@/components/ui/avatar";
import { IoSettingsOutline } from "react-icons/io5";
import DesiredOutcomeDialog from "@/app/(protected)/project/[slug]/tasks/_components/dialogs/desired-outcome-dialog";
import { ViewAsDialog, ViewAsMenuButton } from "./view-as-menu";
import { SprintBriefingMenuItem } from "@/app/(protected)/project/[slug]/tasks/_components/sprint-briefing-copy";
import { useGetPoints } from "@/queries/points/hooks";
import Link from "next/link";

const ProfileMenu = ({
  showSettings,
  onEditButtonClick,
  showInsightsOption,
  organizationId,
  points: pointsProp,
  pointsHref: pointsHrefProp,
  projectId,
}: {
  showSettings: boolean;
  onEditButtonClick?: () => void;
  showInsightsOption?: boolean;
  organizationId?: string;
  /** Project-specific or total points to display in the menu */
  points?: number;
  pointsHref?: string;
  /** When set, admins see "Copy sprint briefing" in the menu */
  projectId?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const { selectedOrg } = useDashboardContext();
  const isRealAdmin = useIsRealAdmin();
  const appRole = useAppRole();
  const [editOrganizationModalIsOpen, setEditOrganizationModalIsOpen] =
    useState(false);
  const [isDesiredOutcomeDialogOpen, setIsDesiredOutcomeDialogOpen] =
    useState(false);
  const [viewAsDialogOpen, setViewAsDialogOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  const { data: fetchedPointsData } = useGetPoints(undefined, {
    enabled: pointsProp === undefined,
  });
  const fetchedTotal =
    fetchedPointsData?.points?.reduce((sum, entry) => sum + entry.points, 0) ??
    0;
  const displayPoints = pointsProp ?? fetchedTotal;
  const pointsHref =
    pointsHrefProp ?? (appRole === "admin" ? "/allpoints" : "/points");

  const menuRef = useRef<HTMLDivElement>(null);
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

  const handleProfileClick = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative z-50 mt-2 w-fit" ref={menuRef}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <button
          type="button"
          onClick={handleProfileClick}
          aria-label="Settings"
        >
          <SettingsIcon className="size-7 cursor-pointer p-1" />
        </button>
      </div>
      <SubscriptionStatus
        showTrigger={false}
        open={subscriptionModalOpen}
        onOpenChange={setSubscriptionModalOpen}
      />
      {isOpen && (
        <div
          className="absolute right-0 z-50 min-w-48 bg-white rounded-lg py-2 w-fit shadow-lg"
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
          {showInsightsOption && selectedOrg && isRealAdmin && (
            <Fragment>
              <hr className="border border-gray-300 my-1" />
              <button
                onClick={() => {
                  setIsDesiredOutcomeDialogOpen(true);
                  setIsOpen(false);
                }}
                className="flex flex-row gap-3 items-center w-full px-3 py-1 text-left hover:bg-gray-100 text-md"
              >
                <Edit2Icon className="size-4" />
                Insights
              </button>
            </Fragment>
          )}
          <hr className="border border-gray-300 my-1" />
          <Link
            href={pointsHref}
            onClick={() => setIsOpen(false)}
            className="flex flex-row gap-3 items-center w-full px-3 py-1 text-left hover:bg-gray-100 text-md"
          >
            <HiCurrencyDollar className="size-5 text-[#fbbc05] shrink-0" />
            <span>
              Points{" "}
              <span className="font-semibold tabular-nums">{displayPoints}</span>
            </span>
          </Link>
          {projectId && isRealAdmin && (
            <>
              <hr className="border border-gray-300 my-1" />
              <SprintBriefingMenuItem
                projectId={projectId}
                onSelect={() => setIsOpen(false)}
              />
            </>
          )}
          <hr className="border border-gray-300 my-1" />
          <SubscriptionMenuItem
            onSelect={() => {
              setSubscriptionModalOpen(true);
              setIsOpen(false);
            }}
          />
          {showSettings && selectedOrg && isRealAdmin && (
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
          {selectedOrg && isRealAdmin && (
            <>
              <hr className="border border-gray-300 my-1" />
              <ViewAsMenuButton
                onOpen={() => {
                  setViewAsDialogOpen(true);
                  setIsOpen(false);
                }}
              />
            </>
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
      <ViewAsDialog
        open={viewAsDialogOpen}
        onOpenChange={setViewAsDialogOpen}
        organizationId={organizationId}
      />
      {isDesiredOutcomeDialogOpen && (
        <DesiredOutcomeDialog
          modalIsOpen={isDesiredOutcomeDialogOpen}
          setModalIsOpen={setIsDesiredOutcomeDialogOpen}
        />
      )}
    </div>
  );
};

export default ProfileMenu;
