"use client";
import { useEffect, useState } from "react";
import {
  Organization,
  TaskType,
  SubtaskType,
  ProjectType,
} from "@/types/organization";
import { IoIosAddCircleOutline } from "react-icons/io";
import Modal from "@/components/Modal/Modal";
import { IoMdClose } from "react-icons/io";
import { createOrganization } from "@/actions/organization";
import toast from "react-hot-toast";
import FormSubmitButton from "@/components/common/FormSubmitButton";
import { getOrganization } from "@/data/ogranization";
import { addProject } from "@/actions/project";
import { useRouter } from "next/navigation";
import ProfileMenu from "@/components/common/ProfileMenu";
import ProgressBar from "@/components/common/ProgressBar";
import { Session } from "next-auth";
import DashboardDraggableProjectList from "./DashboardDraggableProjectList";

const Dashboard = ({ session }: { session: Session }) => {
  const router = useRouter();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);

  const [addOrganizationModalIsOpen, setAddOrganizationModalIsOpen] =
    useState(false);
  const [addProjectModalIsOpen, setAddProjectModalIsOpen] = useState(false);

  const selectCurrentOrganization = (
    organization: Organization | Organization[],
  ) => {
    const storedOrganizationId = localStorage.getItem("rememberOrganizationId");
    if (Array.isArray(organization)) {
      const selectedOrg = organization.find(
        (org) => org.id === storedOrganizationId,
      );
      if (selectedOrg) {
        setSelectedOrganization(selectedOrg);
      } else {
        setSelectedOrganization(organization[0]);
        localStorage.setItem("rememberOrganizationId", organization[0].id);
      }
    } else {
      setSelectedOrganization(organization);
      localStorage.setItem("rememberOrganizationId", organization.id);
    }
  };

  const fetchOrganizations = async () => {
    const res = await getOrganization();
    if (res.success && res.organizations?.length) {
      setOrganizations(res.organizations as unknown as Organization[]);
      selectCurrentOrganization(res.organizations as unknown as Organization[]);
      // setSelectedOrganization(res.organizations[0] as Organization)
    }
    setInitialLoading(false);
  };
  // useEffect(() => {
  //     console.log("ORG")
  //     console.log(organizations)
  // }, [organizations])
  useEffect(() => {
    fetchOrganizations();
  }, []);

  if (initialLoading) {
    return <div className="text-center text-xl font-bold">Loading...</div>;
  }

  const saveOrganization = async (formData: FormData) => {
    const result = await createOrganization(formData);
    if (result.success) {
      toast.success(result.message);
      setOrganizations([
        ...organizations,
        result.organization as unknown as Organization,
      ]);
      selectCurrentOrganization(result.organization as unknown as Organization);
      setAddOrganizationModalIsOpen(false);
    } else {
      toast.error(result.message || "An error occurred");
    }
  };
  const addOrganizationProject = async (formData: FormData) => {
    if (selectedOrganization) {
      const result = await addProject(
        selectedOrganization.id,
        formData.get("projectTitle") as string,
        formData.get("projectDescription") as string,
      );
      if (result.success) {
        toast.success(result.message);
        // fetchOrganizations();
        setOrganizations((prevOrganizations) =>
          prevOrganizations.map((org) =>
            org.id === selectedOrganization.id
              ? {
                  ...org,
                  projects: [...org.projects, result.project as ProjectType],
                }
              : org,
          ),
        );
        setSelectedOrganization({
          ...selectedOrganization,
          projects: [
            ...selectedOrganization.projects,
            result.project as ProjectType,
          ],
        });
        setAddProjectModalIsOpen(false);
      } else {
        toast.error(result.message || "An error occurred");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 flex-col sm:flex-row">
        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold ">
          Admin Dashboard
        </h1>
        <div className="flex items-center space-x-4 justify-center">
          {/* Add Organization */}
          <button
            className="tooltip"
            onClick={() => setAddOrganizationModalIsOpen(true)}
          >
            <IoIosAddCircleOutline className="text-3xl cursor-pointer opacity-90 hover:opacity-100" />
            <p className="tooltiptext">Add Organization</p>
          </button>
          <Modal
            modalIsOpen={addOrganizationModalIsOpen}
            setModalIsOpen={setAddOrganizationModalIsOpen}
            className="w-[100%] md:w-[80%] xl:w-[50%] px-10 py-10"
          >
            <div className="w-full flex justify-between">
              <h3 className="text-2xl font-semibold">Add Organization</h3>
              <button
                onClick={() => setAddOrganizationModalIsOpen(false)}
                className="cursor-pointer"
              >
                <IoMdClose className="text-2xl" />
              </button>
            </div>
            {/* <hr className='border border-gray-300 my-6' /> */}
            <form className="mt-4" action={saveOrganization}>
              <input
                type="text"
                placeholder="Organization Name"
                name="organizationName"
                id="organizationName"
                className="w-[95%] md:w-[80%] p-2 mx-2 my-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
              {/* <hr className='border border-gray-300 my-6' /> */}
              <div className="flex mt-6">
                <FormSubmitButton className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
                  Save
                </FormSubmitButton>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  onClick={() => setAddOrganizationModalIsOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>

          {/* Organization Selector */}
          {organizations.length > 0 && selectedOrganization && (
            <select
              value={selectedOrganization.id}
              onChange={(e) =>
                selectCurrentOrganization(
                  organizations.find(
                    (org) => org.id === e.target.value,
                  ) as Organization,
                )
              }
              className="border p-2 rounded"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          )}
          <ProfileMenu
            showSettings={true}
            session={session}
            selectedOrganization={selectedOrganization}
            fetchOrganizations={fetchOrganizations}
          />
        </div>
      </div>

      {/* Sample Organization */}
      {!selectedOrganization && (
        <div
          className="bg-white p-6 rounded shadow-md border-l-4 border-blue-500 cursor-pointer"
          onClick={() => setAddOrganizationModalIsOpen(true)}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Step 1: Add Organization</h3>
          </div>
        </div>
      )}

      {/* Add a project */}
      {selectedOrganization && (
        <div>
          <button
            className="bg-blue-500 rounded-md text-white py-1 px-2 cursor-pointer"
            onClick={() => setAddProjectModalIsOpen(true)}
          >
            Add a project
          </button>
          <Modal
            modalIsOpen={addProjectModalIsOpen}
            setModalIsOpen={setAddProjectModalIsOpen}
            className="w-[100%] md:w-96 px-10 py-10"
          >
            <div className="w-full flex justify-between">
              <h3 className="text-2xl font-semibold">Add Project</h3>
              <button
                onClick={() => setAddProjectModalIsOpen(false)}
                className="cursor-pointer"
              >
                <IoMdClose className="text-2xl" />
              </button>
            </div>
            {/* <hr className='border border-gray-300 my-6' /> */}
            <form className="mt-4" action={addOrganizationProject}>
              <input
                type="text"
                placeholder="Project Title"
                name="projectTitle"
                id="projectTitle"
                className="w-full p-2 my-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
              <textarea
                placeholder="Project Description"
                name="projectDescription"
                id="projectDescription"
                className="w-full h-24 p-2 my-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
              />
              {/* <hr className='border border-gray-300 my-6' /> */}
              <div className="flex mt-5">
                <FormSubmitButton className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
                  Add
                </FormSubmitButton>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  onClick={() => setAddProjectModalIsOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        </div>
      )}
      {/* Display projects for Selected Organization */}
      {selectedOrganization && selectedOrganization.projects.length > 0 && (
        <DashboardDraggableProjectList
          projects={selectedOrganization.projects}
        />
      )}
      {/* Sample Project */}
      {selectedOrganization && selectedOrganization.projects.length === 0 && (
        <div
          className="bg-white p-6 rounded shadow-md border-l-4 border-blue-500 cursor-pointer"
          onClick={() => setAddProjectModalIsOpen(true)}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Step 2: Add a project</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
