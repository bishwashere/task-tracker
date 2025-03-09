"use client";
import { addUserToOrganization, updateOrganizationName } from "@/actions/organization";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaRegUserCircle } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import FormSubmitButton from "./FormSubmitButton";
import Modal from "../Modal/Modal";
import { IoMdClose } from "react-icons/io";
import { Organization } from "@/types/organization";
import logOut from "@/actions/logOut";
import { Session } from "next-auth";

const ProfileMenu = ({ showSettings, session, selectedOrganization, fetchOrganizations }: { showSettings: boolean; session:Session; selectedOrganization?: Organization | null; fetchOrganizations?: () => Promise<void> }) => {

    const [isOpen, setIsOpen] = useState(false);
    const [editOrganizationModalIsOpen, setEditOrganizationModalIsOpen] = useState(false);

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

    const changeOrganizationName = async (formData: FormData) => {
        if (selectedOrganization) {
            const result = await updateOrganizationName(selectedOrganization.id, formData.get('newOrganizationName') as string)
            if (result.success) {
                toast.success(result.message);
                fetchOrganizations?.();
            }
            else {
                toast.error(result.message || 'An error occurred');
            }
        }
    }
    const addMemberToOrganization = async (formData: FormData) => {
        if (selectedOrganization) {
            const result = await addUserToOrganization(selectedOrganization.id, formData.get('memberEmail') as string)
            if (result.success) {
                toast.success(result.message);
                fetchOrganizations?.();
            }
            else {
                toast.error(result.message || 'An error occurred');
            }
        }
    }

    return (
        <div className="relative mt-2 w-fit" ref={menuRef}>
            {/* Edit Organizations */}
            {/* Only edit section if user is admin of that organization */}
            <button onClick={handleProfileClick}>
                {session?.user?.image ?
                    <Image src={session.user.image} width="30" height="30" alt="Profile" className="rounded-full" />
                    :
                    <FaRegUserCircle className="text-4xl cursor-pointer p-1" />
                }
            </button>
            {isOpen && (
                <div className="absolute right-0 min-w-48 bg-white rounded-lg py-2 w-fit" style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}>
                    <div className="block px-3 p-2">
                        <p className="text-md font-semibold">{session?.user?.name}</p>
                        <p className="text-sm font-semibold text-gray-500">{session?.user?.email}</p>
                    </div>
                    <hr className='border border-gray-300 my-1' />
                    {showSettings && selectedOrganization && selectedOrganization.members.some((member) => member.userId === session?.user?.id && member.role === "ADMIN") &&
                        <button onClick={() => { setIsOpen(false); setEditOrganizationModalIsOpen(true) }} className="flex flex-row gap-3 items-center w-full px-3 py-1 text-left hover:bg-gray-100 text-md"><IoSettingsOutline />Settings</button>
                    }
                    <button onClick={() => logOut()} className="flex flex-row gap-3 items-center w-full px-3 py-1 text-left hover:bg-gray-100 text-md"><MdLogout />Log out</button>
                </div>
            )}
            <Modal modalIsOpen={editOrganizationModalIsOpen} setModalIsOpen={setEditOrganizationModalIsOpen} className="w-[100%] md:w-[80%] xl:w-[50%] px-10 py-10">
                <div className="w-full flex justify-between">
                    <h3 className="text-2xl font-semibold">Edit</h3>
                    <button onClick={() => setEditOrganizationModalIsOpen(false)} className="cursor-pointer">
                        <IoMdClose className="text-2xl" />
                    </button>
                </div>
                {/* <hr className='border border-gray-300 my-6' /> */}
                <form className="mt-4" action={changeOrganizationName}>
                    <p className="font-semibold">Change Organization Name</p>
                    <input
                        type="text"
                        placeholder="Organization Name"
                        name="newOrganizationName"
                        id="newOrganizationName"
                        defaultValue={selectedOrganization?.name}
                        className="w-[95%] md:w-[80%] px-2 py-1 mx-2 my-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        required
                    />
                    <FormSubmitButton className="w-fit px-4 py-1 bg-green-600 text-white rounded-lg cursor-pointer">
                        Change
                    </FormSubmitButton>
                </form>
                {/* <hr className='border border-gray-300 my-6' /> */}
                <h3 className="text-2xl font-semibold mt-6">Add Members</h3>
                <form action={addMemberToOrganization}>
                    <input
                        type="text"
                        placeholder="Enter member email"
                        name="memberEmail"
                        id="memberEmail"
                        className="w-[95%] md:w-[80%] px-2 py-1 mx-2 my-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        required
                    />
                    <FormSubmitButton className="w-fit px-4 py-1 bg-green-600 text-white rounded-lg cursor-pointer">
                        Add
                    </FormSubmitButton>
                </form>
                {/* <hr className='border border-gray-300 my-6' /> */}
                <h3 className="text-2xl font-semibold mt-6">Current Members</h3>
                <ul className="list-disc ml-4">
                    {selectedOrganization?.members.map(member => (
                        <li key={member.id}>{member.user.name} ({member.user.email}) : {String(member.role).toLowerCase()}</li>
                    ))}
                </ul>
            </Modal>
        </div>
    )
}

export default ProfileMenu;