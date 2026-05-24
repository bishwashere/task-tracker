import { IoMdClose } from "react-icons/io";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react";
import { useCreateInsights, useGetInsights, useUpdateInsights } from "@/queries/insights/hooks";
import desiredOutcomes from "@/constants/desiredOutcomes";
import { useProjectContext } from "../../_context";

const DesiredOutcomeDialog = ({
    modalIsOpen,
    setModalIsOpen,
}: {
    modalIsOpen: boolean;
    setModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {

    const { projectId } = useProjectContext();

    const { data: insightsData, isPending: isInsightsPending } = useGetInsights(projectId);
    const createInsights = useCreateInsights(projectId);
    const updateInsights = useUpdateInsights(projectId);

    const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>(insightsData?.insights?.desiredOutcome || []);

    const handleCheckboxChange = (outcome: string) => {
        setSelectedOutcomes((prev) =>
            prev.includes(outcome)
                ? prev.filter((item) => item !== outcome)
                : [...prev, outcome]
        );
    };

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOutcomes.length) return;
        console.log('Selected outcomes:', selectedOutcomes);
        if(insightsData?.insights) {
            try {
                await updateInsights.mutateAsync({
                    projectId,
                    newDesiredOutcome: selectedOutcomes,
                })
                setSelectedOutcomes(insightsData?.insights?.desiredOutcome || [])
                setModalIsOpen(false)
            } catch {}
        } else {
            try {
                await createInsights.mutateAsync({
                    projectId,
                    desiredOutcome: selectedOutcomes,
                })
                setSelectedOutcomes(insightsData?.insights?.desiredOutcome || [])
                setModalIsOpen(false)
            } catch {}
        }
        // You can send `selectedOutcomes` to API here
    };


    // const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     if (!formData.taskTitle.trim()) return;
    //     try {
    //         await save.mutateAsync({
    //             projectId: id,
    //             taskTitle: formData.taskTitle,
    //             taskDescription: formData.taskDescription,
    //         })
    //         setModalIsOpen(false);
    //         setSelectedOutcomes([])
    //     } catch { }
    // };

    return (
        <Dialog
            open={modalIsOpen}
            onOpenChange={setModalIsOpen}
        >
            <DialogContent
                className="w-[100%] md:w-96 px-10 py-10"
            >
                <div className="w-full flex">
                    <h3 className="text-2xl font-semibold">Edit Insights</h3>
                </div>
                <form className="mt-8" onSubmit={handleSubmit}>
                    <fieldset className="space-y-2">
                        <legend className="text-lg font-semibold">Select Desired Outcomes:</legend>
                        {desiredOutcomes.map((outcome) => (
                            <label key={outcome} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={selectedOutcomes.includes(outcome)}
                                    onChange={() => handleCheckboxChange(outcome)}
                                    className="form-checkbox"
                                />
                                <span>{outcome}</span>
                            </label>
                        ))}
                    </fieldset>
                    <div className="flex justify-end mt-5">
                        <Button
                            loading={updateInsights.isPending || createInsights.isPending}
                            className="mr-2">
                            Save
                        </Button>
                        <Button
                            type="reset"
                            onClick={() => {
                                setSelectedOutcomes(insightsData?.insights?.desiredOutcome || [])
                                setModalIsOpen(false)
                            }}
                            variant={"muted"}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>

    );
};

export default DesiredOutcomeDialog;
