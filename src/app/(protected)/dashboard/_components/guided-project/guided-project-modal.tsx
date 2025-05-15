import { Button } from '@/components/ui/button';
import { guidedProjectQuestions } from '@/constants/guidedModalQuestions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardContext } from '@/context/dashboard-context';
import { useAddProject } from '@/queries/project/hooks';
import toast from 'react-hot-toast';
import { AddProjectProps } from '@/queries/project/action';

type Props = {
    isOpen: boolean;
    onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
};

export const GuidedProjectModal = ({ isOpen, onOpenChange }: Props) => {
    const [formData, setFormData] = useState(guidedProjectQuestions);
    const [step, setStep] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

    const { selectedOrg } = useDashboardContext();
    const add = useAddProject();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updated = [...formData];
        updated[step].answer = e.target.value;
        setFormData(updated);
    };

    const formSubmit = async () => {
        if (!selectedOrg?.id) return;
        const allowedKeys = ['projectName', 'goal', 'focusArea', 'mainGoal'] as const;
        type AllowedKey = typeof allowedKeys[number];
        const result = formData.reduce((acc, item) => {
            if (item.answer && allowedKeys.includes(item.name as AllowedKey)) {
                acc[item.name as AllowedKey] = item.answer;
            }
            return acc;
        }, {} as Partial<Pick<AddProjectProps, AllowedKey>>);

        const data: AddProjectProps = {
            organizationId: selectedOrg?.organizationId ?? '',
            projectDescription: '',
            projectName: result.projectName ?? '',
            goal: result.goal,
            focusArea: result.focusArea,
            mainGoal: result.mainGoal,
        };
        console.log(data)
        try {
            await add.mutateAsync(data);
            setSubmitted(true);
        } catch {
            toast.error("Failed to create project.");
        }
    }

    const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const currentItem = formData[step];
        if (currentItem.name === 'projectName' && !currentItem.answer.trim()) {
            toast.error("Project name is required.");
            return;
        }
        if (step < formData.length - 1) {
            setDirection(1);
            setStep(step + 1);
        } else {
            formSubmit();
        }
    };

    const handleSkip = () => {
        if (step < formData.length - 1) {
            setDirection(1);
            setStep(step + 1);
        } else {
            formSubmit();
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setDirection(-1);
            setStep(step - 1);
        }
    };

    const closeModal = () => {
        setStep(0);
        setSubmitted(false);
        setFormData(guidedProjectQuestions.map(q => ({ ...q, answer: '' })));
        onOpenChange(false);
    };

    const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');
    const contentRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.offsetHeight);
        }
    }, [step, formData]);
    const variants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir: number) => ({
            x: dir < 0 ? 100 : -100,
            opacity: 0,
        }),
    };

    return (
        <Dialog open={isOpen} onOpenChange={closeModal}>
            <DialogContent className="w-[100%] md:w-[80%] xl:w-[50%] px-10 py-10">
                <DialogHeader>
                    <DialogTitle className="text-2xl mb-8">
                        {submitted ? "Thank You" : "Add Project"}
                    </DialogTitle>
                </DialogHeader>

                {!submitted ? (
                    <form onSubmit={handleNext}>
                        <div
                            style={{ height: contentHeight, transition: 'height 0.3s ease' }}
                            className="relative overflow-hidden"
                        >
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.div
                                    key={step}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                    ref={contentRef}
                                >
                                    <p className="text-lg mb-4">{formData[step].question}</p>
                                    <input
                                        type="text"
                                        placeholder={
                                            formData[step].examples.length
                                                ? `eg. ${formData[step].examples.join(", ")}`
                                                : 'Your answer here'
                                        }
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
                                        value={formData[step].answer}
                                        onChange={handleChange}
                                        required
                                    />

                                    <div className="flex justify-between mt-16 gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleBack}
                                            disabled={step === 0}
                                        >
                                            Back
                                        </Button>

                                        <div className="flex gap-2 ml-auto">
                                            {formData[step].name !== "projectName" &&
                                                <Button
                                                    type="button"
                                                    variant="muted"
                                                    onClick={handleSkip}
                                                >
                                                    Skip
                                                </Button>
                                            }

                                            <Button type="submit" className="min-w-28" disabled={add.isPending}>
                                                {step === formData.length - 1 ? "Submit" : "Next"}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </form>

                ) : (
                    <div className="text-center text-lg font-medium">
                        Thank you for answering the questions. Your project is created.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default GuidedProjectModal;
