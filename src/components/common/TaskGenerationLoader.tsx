"use client"

import { useEffect, useState } from "react"
import { CheckmarkIcon, LoaderIcon } from "react-hot-toast"

const LOADING_STEPS = [
  "Analyzing project requirements...",
  "Generating task suggestions...",
  "Calculating task priorities...",
  "Estimating time requirements...",
  "Preparing final recommendations...",
]

type Props = {
  onComplete?: () => void
}

export default function TaskGenerationLoader({ onComplete }: Props) {
  const [progress, setProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 1
      })
    }, 50)

    return () => clearInterval(progressInterval)
  }, [])

  useEffect(() => {
    if (progress === 0) return

    const stepThreshold = 100 / LOADING_STEPS.length
    const currentStepIndex = Math.floor(progress / stepThreshold)

    if (currentStepIndex > currentStep && currentStep < LOADING_STEPS.length) {
      setCompletedSteps((prev) => [...prev, currentStep])
      setCurrentStep(currentStepIndex)
    }
  }, [progress, currentStep])

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => {
        onComplete?.()
      }, 400)
    }
  }, [progress])


  return (
    <div className="w-full max-w-md mx-auto p-6">
      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 rounded-full mb-8">
        <div
          className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress Percentage */}
      <div className="text-right text-sm text-gray-600 mb-6">{progress}% Complete</div>

      {/* Loading Steps */}
      <div className="space-y-4">
        {LOADING_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(index)
          const isCurrent = currentStep === index && !isCompleted

          return (
            <div
              key={step}
              className={`flex items-center space-x-3 transition-all duration-300
                ${index > currentStep ? "opacity-40" : "opacity-100"}
                ${isCurrent ? "text-emerald-600 font-medium" : ""}
                ${isCompleted ? "text-emerald-500" : "text-gray-600"}
              `}
            >
              <div className="w-6 h-6 flex-shrink-0">
                {isCompleted ? (
                  <CheckmarkIcon className="w-6 h-6 text-emerald-500" />
                ) : isCurrent ? (
                  <LoaderIcon className="w-6 h-6 text-emerald-600 animate-spin" />
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                )}
              </div>
              <span>{step}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

