"use client";
import { Button } from '@/components/ui/button';
import { guidedOrganizationQuestions, guidedProjectQuestions } from '@/constants/guidedModalQuestions';
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
import { useCreateOrganization, useListUserOrganizations } from '@/queries/organizations/hooks';
import { CreateOrganizationProps } from '@/queries/organizations/action';
import { signOut } from "next-auth/react";

type Props = {
    isOpen: boolean;
    onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
};

type OnboardingStep = 'organization' | 'project';

export const OnboardingModal = ({ isOpen, onOpenChange }: Props) => {
    const [currentPhase, setCurrentPhase] = useState<OnboardingStep>('organization');
    const [orgFormData, setOrgFormData] = useState(guidedOrganizationQuestions);
    const [projectFormData, setProjectFormData] = useState(guidedProjectQuestions);
    const [orgStep, setOrgStep] = useState(0);
    const [projectStep, setProjectStep] = useState(0);
    const [orgSubmitted, setOrgSubmitted] = useState(false);
    const [projectSubmitted, setProjectSubmitted] = useState(false);
    const [direction, setDirection] = useState(1);

    const { selectedOrg, setSelectedOrg } = useDashboardContext();
    const createOrg = useCreateOrganization();
    const createProject = useAddProject();
    const orgs = useListUserOrganizations();

    // Auto-select the newly created organization
    useEffect(() => {
        if (orgSubmitted && createOrg.data && orgs.data) {
            const newOrg = orgs.data.find((org) => org.organization.id === createOrg.data.id);
            if (newOrg) {
                setSelectedOrg(newOrg);
                // Move to project phase after a short delay
                setTimeout(() => {
                    setCurrentPhase('project');
                    setOrgStep(0);
                }, 1000);
            }
        }
    }, [orgSubmitted, createOrg.data, orgs.data, setSelectedOrg]);

    // Close modal when project is created
    useEffect(() => {
        if (projectSubmitted) {
            setTimeout(() => {
                onOpenChange(false);
                // Reset everything
                setCurrentPhase('organization');
                setOrgStep(0);
                setProjectStep(0);
                setOrgSubmitted(false);
                setProjectSubmitted(false);
                setOrgFormData(guidedOrganizationQuestions.map(q => ({ ...q, answer: '' })));
                setProjectFormData(guidedProjectQuestions.map(q => ({ ...q, answer: '' })));
            }, 2000);
        }
    }, [projectSubmitted, onOpenChange]);

    const handleOrgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updated = [...orgFormData];
        updated[orgStep].answer = e.target.value;
        setOrgFormData(updated);
    };

    const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updated = [...projectFormData];
        updated[projectStep].answer = e.target.value;
        setProjectFormData(updated);
    };

    const submitOrganization = async () => {
        const allowedKeys = ['name', 'type', 'field', 'need'] as const;
        type AllowedKey = typeof allowedKeys[number];
        const result = orgFormData.reduce((acc, item) => {
            if (item.answer && allowedKeys.includes(item.name as AllowedKey)) {
                acc[item.name as AllowedKey] = item.answer;
            }
            return acc;
        }, {} as Partial<Pick<CreateOrganizationProps, AllowedKey>>);

        const data: CreateOrganizationProps = {
            name: result.name ?? '',
            type: result.type,
            field: result.field,
            need: result.need
        };

        try {
            await createOrg.mutateAsync(data);
            setOrgSubmitted(true);
        } catch {
            toast.error("Failed to create organization.");
        }
    };

    const submitProject = async () => {
        const orgToUse = selectedOrg || orgs.data?.[0];
        if (!orgToUse?.organizationId) {
            toast.error("Please create an organization first.");
            return;
        }

        const allowedKeys = ['projectName', 'goal', 'focusArea', 'mainGoal'] as const;
        type AllowedKey = typeof allowedKeys[number];
        const result = projectFormData.reduce((acc, item) => {
            if (item.answer && allowedKeys.includes(item.name as AllowedKey)) {
                acc[item.name as AllowedKey] = item.answer;
            }
            return acc;
        }, {} as Partial<Pick<AddProjectProps, AllowedKey>>);

        const data: AddProjectProps = {
            organizationId: orgToUse.organizationId,
            projectDescription: '',
            projectName: result.projectName ?? '',
            goal: result.goal,
            focusArea: result.focusArea,
            mainGoal: result.mainGoal,
        };

        try {
            await createProject.mutateAsync(data);
            setProjectSubmitted(true);
        } catch {
            toast.error("Failed to create project.");
        }
    };

    const handleOrgNext = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const currentItem = orgFormData[orgStep];
        if (currentItem.name === 'name' && !currentItem.answer.trim()) {
            toast.error("Organization name is required.");
            return;
        }
        if (orgStep < orgFormData.length - 1) {
            setDirection(1);
            setOrgStep(orgStep + 1);
        } else {
            submitOrganization();
        }
    };

    const handleOrgBack = () => {
        if (orgStep > 0) {
            setDirection(-1);
            setOrgStep(orgStep - 1);
        }
    };

    const handleProjectNext = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const currentItem = projectFormData[projectStep];
        if (currentItem.name === 'projectName' && !currentItem.answer.trim()) {
            toast.error("Project name is required.");
            return;
        }
        if (projectStep < projectFormData.length - 1) {
            setDirection(1);
            setProjectStep(projectStep + 1);
        } else {
            submitProject();
        }
    };

    const handleProjectBack = () => {
        if (projectStep > 0) {
            setDirection(-1);
            setProjectStep(projectStep - 1);
        }
    };

    const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');
    const contentRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.offsetHeight);
        }
    }, [orgStep, projectStep, orgFormData, projectFormData, currentPhase]);

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

    const currentFormData = currentPhase === 'organization' ? orgFormData : projectFormData;
    const currentStep = currentPhase === 'organization' ? orgStep : projectStep;
    const isSubmitted = currentPhase === 'organization' ? orgSubmitted : projectSubmitted;
    const isLoading = currentPhase === 'organization' ? createOrg.isPending : createProject.isPending;

    const getTitle = () => {
        if (currentPhase === 'organization') {
            if (orgSubmitted) return "Organization Created!";
            return "Welcome! Let&apos;s Set Up Your Organization";
        } else {
            if (projectSubmitted) return "Project Created!";
            return "Now Let&apos;s Create Your First Project";
        }
    };

    const getCurrentQuestion = () => {
        if (currentPhase === 'organization') {
            return orgFormData[orgStep];
        } else {
            return projectFormData[projectStep];
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (currentPhase === 'organization') {
            handleOrgChange(e);
        } else {
            handleProjectChange(e);
        }
    };

    const handleOptionClick = (value: string) => {
        if (currentPhase === 'organization') {
            const updated = [...orgFormData];
            updated[orgStep].answer = value;
            setOrgFormData(updated);
        } else {
            const updated = [...projectFormData];
            updated[projectStep].answer = value;
            setProjectFormData(updated);
        }
    };

    const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
        if (currentPhase === 'organization') {
            handleOrgNext(e);
        } else {
            handleProjectNext(e);
        }
    };

    const handleBack = () => {
        if (currentPhase === 'organization') {
            handleOrgBack();
        } else {
            handleProjectBack();
        }
    };

    const handleSkip = () => {
        if (currentPhase === 'organization') {
            if (orgStep < orgFormData.length - 1) {
                setDirection(1);
                setOrgStep(orgStep + 1);
            } else {
                submitOrganization();
            }
        } else {
            if (projectStep < projectFormData.length - 1) {
                setDirection(1);
                setProjectStep(projectStep + 1);
            } else {
                submitProject();
            }
        }
    };

    const handleLogout = async () => {
        await signOut();
    };

    const currentQuestion = getCurrentQuestion();
    const isRequiredField = currentQuestion.name === 'name' || currentQuestion.name === 'projectName';

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent className="w-[100%] md:w-[80%] xl:w-[50%] px-10 py-10 max-h-[90vh] overflow-y-auto [&>button]:hidden">
                <DialogHeader className="relative">
                    <DialogTitle className="text-2xl mb-2">
                        {getTitle()}
                    </DialogTitle>
                    {currentPhase === 'organization' && !orgSubmitted && (
                        <p className="text-sm text-gray-500 mb-4">
                            Step {orgStep + 1} of {orgFormData.length} - Organization Setup
                        </p>
                    )}
                    {currentPhase === 'project' && !projectSubmitted && (
                        <p className="text-sm text-gray-500 mb-4">
                            Step {projectStep + 1} of {projectFormData.length} - Project Setup
                        </p>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleLogout}
                        className="absolute right-0 top-0 bg-red-500 text-white hover:bg-red-600 border-red-500"
                    >
                        Logout
                    </Button>
                </DialogHeader>

                {!isSubmitted ? (
                    <form onSubmit={handleNext}>
                        <div
                            style={{ height: contentHeight, transition: 'height 0.3s ease' }}
                            className="relative overflow-hidden"
                        >
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.div
                                    key={`${currentPhase}-${currentStep}`}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                    ref={contentRef}
                                >
                                    <p className="text-lg mb-4">{currentQuestion.question}</p>
                                    <input
                                        type="text"
                                        placeholder={
                                            currentQuestion.examples.length
                                                ? `eg. ${currentQuestion.examples.join(", ")}`
                                                : 'Your answer here'
                                        }
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
                                        value={currentQuestion.answer}
                                        onChange={handleChange}
                                        required={isRequiredField}
                                        autoFocus
                                    />
                                    {currentQuestion.examples.length > 0 && currentQuestion.name !== 'name' && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {currentQuestion.examples.map((example, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleOptionClick(example)}
                                                    className={`px-4 py-2 rounded-md border transition-colors ${
                                                        currentQuestion.answer === example
                                                            ? 'bg-blue-500 text-white border-blue-500'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                                    }`}
                                                >
                                                    {example}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-between mt-16 gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleBack}
                                            disabled={currentStep === 0}
                                        >
                                            Back
                                        </Button>

                                        <div className="flex gap-2 ml-auto">
                                            {currentPhase === 'organization' && currentQuestion.name === 'need' && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleSkip}
                                                >
                                                    Skip
                                                </Button>
                                            )}

                                            <Button type="submit" className="min-w-28" disabled={isLoading}>
                                                {isLoading
                                                    ? "Saving..."
                                                    : currentStep === currentFormData.length - 1
                                                    ? "Submit"
                                                    : "Next"}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </form>
                ) : (
                    <div className="text-center text-lg font-medium py-8">
                        {currentPhase === 'organization' ? (
                            <div>
                                <p className="mb-4">✓ Organization created successfully!</p>
                                <p className="text-sm text-gray-500">Setting up your first project...</p>
                            </div>
                        ) : (
                            <div>
                                <p className="mb-4">✓ Project created successfully!</p>
                                <p className="text-sm text-gray-500">You&apos;re all set! Welcome to your dashboard.</p>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default OnboardingModal;

