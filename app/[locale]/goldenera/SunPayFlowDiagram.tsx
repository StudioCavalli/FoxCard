'use client'

import { useEffect, useState } from 'react'
import { User, Store, Wallet, Blocks, Building2 } from 'lucide-react'

interface SunPayFlowDiagramProps {
  labels: {
    customer: string
    customerDesc: string
    marketplace: string
    marketplaceDesc: string
    wallet: string
    walletDesc: string
    blockchain: string
    blockchainDesc: string
    merchant: string
    merchantDesc: string
    amount: string
    equivalent: string
    confirmed: string
    confirmations: string
  }
}

const STEPS = 5
const STEP_DELAY = 1400
const PAUSE = 2000

export default function SunPayFlowDiagram({ labels }: SunPayFlowDiagramProps) {
  const [activeStep, setActiveStep] = useState(-1)
  const [confirmCount, setConfirmCount] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    let step = -1
    let timer: NodeJS.Timeout

    const advance = () => {
      step++
      if (step < STEPS) {
        setActiveStep(step)
        setShowSuccess(false)
        if (step === 3) {
          let count = 0
          const ci = setInterval(() => {
            count++
            setConfirmCount(count)
            if (count >= 6) clearInterval(ci)
          }, 180)
        }
        timer = setTimeout(advance, STEP_DELAY)
      } else {
        setShowSuccess(true)
        timer = setTimeout(() => {
          step = -1
          setActiveStep(-1)
          setConfirmCount(0)
          setShowSuccess(false)
          timer = setTimeout(advance, 600)
        }, PAUSE)
      }
    }

    timer = setTimeout(advance, 800)
    return () => clearTimeout(timer)
  }, [])

  const steps = [
    { Icon: User, label: labels.customer, desc: labels.customerDesc },
    { Icon: Store, label: labels.marketplace, desc: labels.marketplaceDesc },
    { Icon: Wallet, label: labels.wallet, desc: labels.walletDesc },
    { Icon: Blocks, label: labels.blockchain, desc: labels.blockchainDesc },
    { Icon: Building2, label: labels.merchant, desc: labels.merchantDesc },
  ]

  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden lg:flex items-start justify-center gap-0">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start">
            {/* Card */}
            <div className="flex flex-col items-center w-44">
              {/* Step number */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-3 transition-all duration-500 ${
                  showSuccess
                    ? 'bg-emerald-500 text-white scale-110'
                    : activeStep >= i
                    ? 'bg-amber-500 text-white scale-110'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {showSuccess ? '✓' : i + 1}
              </div>

              {/* Icon box */}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-all duration-500 ${
                  showSuccess
                    ? 'bg-emerald-100 shadow-lg shadow-emerald-200/50 scale-110'
                    : activeStep >= i
                    ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-300/40 scale-110'
                    : 'bg-slate-100'
                }`}
              >
                <step.Icon className={`w-7 h-7 ${activeStep >= i || showSuccess ? 'text-white' : 'text-slate-400'}`} />
              </div>

              {/* Label */}
              <h4
                className={`text-sm font-bold mb-1 text-center transition-colors duration-500 ${
                  activeStep >= i ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {step.label}
              </h4>
              <p
                className={`text-xs text-center leading-relaxed transition-colors duration-500 ${
                  activeStep >= i ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                {step.desc}
              </p>

              {/* Blockchain confirmations */}
              {i === 3 && activeStep >= 3 && (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[...Array(6)].map((_, b) => (
                      <div
                        key={b}
                        className={`w-2 h-3 rounded-sm transition-all duration-200 ${
                          b < confirmCount
                            ? showSuccess
                              ? 'bg-emerald-400'
                              : 'bg-amber-400'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${showSuccess ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {confirmCount}/6
                  </span>
                </div>
              )}
            </div>

            {/* Arrow between cards */}
            {i < STEPS - 1 && (
              <div className="flex items-center self-center mt-[-40px] w-12">
                <div className="relative flex-1 h-[2px]">
                  <div className="absolute inset-0 bg-slate-200 rounded-full" />
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                      showSuccess ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    style={{ width: activeStep > i ? '100%' : '0%' }}
                  />
                  {activeStep === i + 1 && !showSuccess && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-400 rounded-full shadow-sm shadow-amber-400/50"
                      style={{ animation: 'travelDot 0.7s ease-out forwards' }}
                    />
                  )}
                </div>
                <div
                  className={`w-0 h-0 flex-shrink-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent transition-colors duration-500 ${
                    activeStep > i
                      ? showSuccess
                        ? 'border-l-[7px] border-l-emerald-400'
                        : 'border-l-[7px] border-l-amber-400'
                      : 'border-l-[7px] border-l-slate-200'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="flex lg:hidden flex-col items-center gap-0">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center">
            {/* Card */}
            <div className="flex items-center gap-4 w-full max-w-xs">
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-all duration-500 ${
                  showSuccess
                    ? 'bg-emerald-100 scale-105'
                    : activeStep >= i
                    ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-md shadow-amber-300/30 scale-105'
                    : 'bg-slate-100'
                }`}
              >
                <step.Icon className={`w-7 h-7 ${activeStep >= i || showSuccess ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      showSuccess
                        ? 'bg-emerald-500 text-white'
                        : activeStep >= i
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {showSuccess ? '✓' : i + 1}
                  </span>
                  <h4
                    className={`text-sm font-bold ${
                      activeStep >= i ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                </div>
                <p
                  className={`text-xs mt-0.5 ${
                    activeStep >= i ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {step.desc}
                </p>
                {i === 3 && activeStep >= 3 && (
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(6)].map((_, b) => (
                      <div
                        key={b}
                        className={`w-1.5 h-2.5 rounded-sm ${
                          b < confirmCount
                            ? showSuccess ? 'bg-emerald-400' : 'bg-amber-400'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                    <span className={`text-[10px] font-mono font-bold ${showSuccess ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {confirmCount}/6
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Vertical connector */}
            {i < STEPS - 1 && (
              <div className="relative w-[2px] h-8 my-1">
                <div className="absolute inset-0 bg-slate-200 rounded-full" />
                <div
                  className={`absolute inset-x-0 top-0 rounded-full transition-all duration-500 ${
                    showSuccess ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  style={{ height: activeStep > i ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Success badge */}
      {showSuccess && (
        <div className="flex justify-center mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold animate-bounce">
            ✓ {labels.confirmed}
          </div>
        </div>
      )}

      <style>{`
        @keyframes travelDot {
          0% { left: 0%; }
          100% { left: calc(100% - 10px); }
        }
      `}</style>
    </div>
  )
}
