import { useState } from "react";
import Modal from "./Modal";
import { IoMdClose } from "react-icons/io";

export const useConfirmModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>(() => () => {});

  // Function to trigger the modal with a specific message
  const confirmAction = (text: string): Promise<boolean> => {
    setMessage(text);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  // Function to handle user decision
  const handleConfirm = (result: boolean) => {
    setIsOpen(false);
    resolvePromise(result);
  };

  const ConfirmationModal = () => (
    isOpen && (
      <Modal modalIsOpen={isOpen} setModalIsOpen={setIsOpen} className="w-[100%] md:w-[50%] lg:w-[35%] px-10 py-10">
        <div className="w-full flex justify-end">
          <button onClick={() => handleConfirm(false)} className="cursor-pointer">
            <IoMdClose className="text-2xl" />
          </button>
        </div>
        <p className='py-6 font-semibold'>{message}</p>
        <div className="flex justify-end mt-5">
          <button
            onClick={() => handleConfirm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2 disabled:opacity-75"
          >
            Yes
          </button>
          <button
            onClick={() => handleConfirm(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            No
          </button>
        </div>
      </Modal>
    )
  );

  return { confirmAction, ConfirmationModal };
};
