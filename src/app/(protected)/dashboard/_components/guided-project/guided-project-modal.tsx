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
import {
    createInitialSprintConfig,
    isSprintConfigValid,
    ProjectSprintFields,
} from '@/components/common/project-sprint-fields';
import { InitialSprintConfig } from '@/queries/sprint/action';

type Props = {
    isOpen: boolean;
    onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
};

export const GuidedProjectModal = ({ isOpen, onOpenChange }: Props) => {
    const [formData, setFormData] = useState(guidedProjectQuestions);
    const [step, setStep] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [direction, setDirection] = useState(1);
    const [sprintConfig, setSprintConfig] = useState<InitialSprintConfig>(
        createInitialSprintConfig,
    );

    const { selectedOrg } = useDashboardContext();
    const add = useAddProject();
    const sprintStepIndex = formData.length;
    const isSprintStep = step === sprintStepIndex;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updated = [...formData];
        updated[step].answer = e.target.value;
        setFormData(updated);
    };

    const formSubmit = async () => {
        if (!selectedOrg?.id) return;
        if (!isSprintConfigValid(sprintConfig)) {
            toast.error("Complete all required sprint fields.");
            return;
        }

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
            sprint: {
                ...sprintConfig,
                name: sprintConfig.name.trim(),
                primaryGoal: sprintConfig.primaryGoal?.trim() || undefined,
                targetMetric: sprintConfig.targetMetric?.trim() || undefined,
            },
        };

        try {
            await add.mutateAsync(data);
            setSubmitted(true);
        } catch {
            toast.error("Failed to create project.");
        }
    }

    const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSprintStep) {
            formSubmit();
            return;
        }

        const currentItem = formData[step];
        if (currentItem.name === 'projectName' && !currentItem.answer.trim()) {
            toast.error("Project name is required.");
            return;
        }
        if (step < formData.length - 1) {
            setDirection(1);
            setStep(step + 1);
        } else {
            setDirection(1);
            setSprintConfig(createInitialSprintConfig());
            setStep(sprintStepIndex);
        }
    };

    const handleSkip = () => {
        if (isSprintStep) return;
        if (step < formData.length - 1) {
            setDirection(1);
            setStep(step + 1);
        } else {
            setDirection(1);
            setSprintConfig(createInitialSprintConfig());
            setStep(sprintStepIndex);
        }
    };

    const handleBack = () => {
        if (isSprintStep) {
            setDirection(-1);
            setStep(formData.length - 1);
            return;
        }
        if (step > 0) {
            setDirection(-1);
            setStep(step - 1);
        }
    };

    const closeModal = () => {
        setStep(0);
        setSubmitted(false);
        setSprintConfig(createInitialSprintConfig());
        setFormData(guidedProjectQuestions.map(q => ({ ...q, answer: '' })));
        onOpenChange(false);
    };

    const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');
    const contentRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.offsetHeight);
        }
    }, [step, formData, sprintConfig, isSprintStep]);

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
            <DialogContent className="w-[100%] md:w-[80%] xl:w-[50%] px-10 py-10 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl mb-2">
                        {submitted ? "Thank You" : "Add Project"}
                    </DialogTitle>
                    {!submitted && (
                        <p className="text-sm text-muted-foreground">
                            {isSprintStep
                                ? `Step ${sprintStepIndex + 1} of ${sprintStepIndex + 1} — Start sprint (required)`
                                : `Step ${step + 1} of ${sprintStepIndex + 1} — Project details`}
                        </p>
                    )}
                </DialogHeader>

                {!submitted ? (
                    <form onSubmit={handleNext}>
                        <div
                            style={
                                isSprintStep
                                    ? undefined
                                    : { height: contentHeight, transition: "height 0.3s ease" }
                            }
                            className={isSprintStep ? "relative" : "relative overflow-hidden"}
                        >
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.div
                                    key={isSprintStep ? "sprint" : step}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                    ref={contentRef}
                                >
                                    {isSprintStep ? (
                                        <>
                                            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm mb-4">
                                                <p className="font-medium text-green-800">Start Sprint</p>
                                                <p className="text-green-700 text-xs mt-0.5">
                                                    Required — your project won&apos;t appear in Sprint View without one.
                                                </p>
                                            </div>
                                            <ProjectSprintFields
                                                value={sprintConfig}
                                                onChange={setSprintConfig}
                                                idPrefix="guided-project"
                                                showPostCreateHint
                                            />
                                        </>
                                    ) : (
                                        <>
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
                                                required={formData[step].name === "projectName"}
                                            />
                                        </>
                                    )}

                                    <div className="flex justify-between mt-16 gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleBack}
                                            disabled={step === 0 && !isSprintStep}
                                        >
                                            Back
                                        </Button>

                                        <div className="flex gap-2 ml-auto">
                                            {!isSprintStep &&
                                                formData[step].name !== "projectName" && (
                                                <Button
                                                    type="button"
                                                    variant="muted"
                                                    onClick={handleSkip}
                                                >
                                                    Skip
                                                </Button>
                                            )}

                                            <Button type="submit" className="min-w-28" disabled={add.isPending}>
                                                {isSprintStep
                                                    ? "Create & Start Sprint"
                                                    : step === formData.length - 1
                                                      ? "Next: Start Sprint"
                                                      : "Next"}
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
