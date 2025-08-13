
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useAuth } from '@/hooks/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { AnimatePresence, motion } from 'framer-motion';

const getWalkthroughSteps = (role: string | undefined) => {
    const founderSteps = [
        { selector: '[href="/dashboard"]', title: 'Dashboard', text: 'This is your mission control. Get a high-level overview of your compliance score, upcoming deadlines, and key alerts.' },
        { selector: '[href="/dashboard/ai-toolkit"]', title: 'AI Toolkit', text: 'Your most powerful area. Analyze contracts, generate legal docs, and ask our AI assistant complex legal questions.' },
        { selector: '[href="/dashboard/cap-table"]', title: 'Cap Table & ESOPs', text: 'Manage your company\'s ownership here. Track founders\' equity, investor shares, and your ESOP pool.' },
        { selector: '[href="/dashboard/financials"]', title: 'Runway & Scenarios', text: 'Calculate your financial runway, forecast your cash flow, and run different scenarios for hiring and expenses.' },
        { selector: '[href="/dashboard/ca-connect"]', title: 'Connections Hub', text: 'Collaborate with your CA or legal advisor. Manage document requests and communication in one place.' },
        { selector: '[href="/dashboard/documents"]', title: 'Doc Vault', text: 'Securely store and manage all your important documents. It syncs directly with your Google Drive.' },
        { selector: '[href="/dashboard/settings"]', title: 'Settings', text: 'Finally, manage your profile, companies, and billing information here. You\'re all set!' },
    ];
    const caSteps = [
         { selector: '[href="/dashboard"]', title: 'Dashboard', text: 'This is your command center. See a birds-eye view of all your clients and identify which ones need attention.' },
         { selector: '[href="/dashboard/clients"]', title: 'Client Management', text: 'View and manage all your clients. You can dive into any client\'s workspace from here.' },
         { selector: '[href="/dashboard/ai-toolkit"]', title: 'AI Practice Suite', text: 'Your AI-powered toolkit. Use it to analyze documents, reconcile filings, and generate reports for your clients.' },
         { selector: '[href="/dashboard/ca-connect"]', title: 'Connections Hub', text: 'Request and receive documents from your clients securely. No more chasing via email or WhatsApp.' },
         { selector: '[href="/dashboard/report-center"]', title: 'Report Center', text: 'Generate professional, white-labeled Compliance Health Reports for your clients to showcase value.' },
         { selector: '[href="/dashboard/settings"]', title: 'Settings', text: 'Manage your own profile and billing information here. You\'re ready to go!' },
    ];
    
    return role === 'CA' ? caSteps : founderSteps;
};

export const ProductWalkthrough = () => {
    const { userProfile, updateUserProfile } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const isMobile = useIsMobile();
    
    useEffect(() => {
        if (userProfile && !userProfile.hasCompletedWalkthrough) {
            // Delay showing the walkthrough to allow the UI to settle
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [userProfile]);
    
    const steps = getWalkthroughSteps(userProfile?.role);
    
    const finishTour = () => {
        setIsVisible(false);
        updateUserProfile({ hasCompletedWalkthrough: true });
    };

    const next = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            finishTour();
        }
    };

    const prev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    const getElementPosition = (selector: string) => {
        try {
            const element = document.querySelector(selector);
            if (!element) return { top: '50%', left: '50%', width: '0px', height: '0px' };
            const rect = element.getBoundingClientRect();
            return {
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
            };
        } catch (e) {
            return { top: '50%', left: '50%', width: '0px', height: '0px' };
        }
    };
    
    if (!isVisible) {
        return null;
    }
    
    const currentStepData = steps[currentStep];
    const targetElementPosition = getElementPosition(currentStepData.selector);
    const tooltipPositionStyle = isMobile ? { bottom: '1rem', left: '1rem', right: '1rem' } : { top: `calc(${targetElementPosition.height} + 10px)`, left: '0' };
    
    return (
        <div className="fixed inset-0 z-[100]">
            <AnimatePresence>
                <motion.div
                    key={currentStep}
                    className="absolute transition-all duration-300 ease-in-out border-2 border-primary border-dashed rounded-lg bg-primary/10"
                    initial={{ ...targetElementPosition, opacity: 0, scale: 0.8 }}
                    animate={{ ...targetElementPosition, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
                    }}
                >
                    <div className="absolute" style={tooltipPositionStyle}>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="bg-card p-4 rounded-lg shadow-2xl max-w-sm"
                        >
                            <h3 className="font-bold text-lg mb-1">{currentStepData.title}</h3>
                            <p className="text-sm text-muted-foreground">{currentStepData.text}</p>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-xs text-muted-foreground">{currentStep + 1} / {steps.length}</span>
                                <div className="flex gap-2">
                                    {currentStep > 0 && (
                                        <Button variant="ghost" size="sm" onClick={prev}>
                                            <ArrowLeft className="w-4 h-4 mr-2"/>
                                            Previous
                                        </Button>
                                    )}
                                    <Button size="sm" onClick={next}>
                                        {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                                        <ArrowRight className="w-4 h-4 ml-2"/>
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>
             <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:text-white hover:bg-white/10 z-[101]" onClick={finishTour}>
                <X/>
                <span className="sr-only">Skip Tour</span>
            </Button>
        </div>
    );
};
