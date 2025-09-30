import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, CheckCircle, Play, Target, Award, BookOpen, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import WelcomeStep from './components/WelcomeStep';
import DisciplineSelection from './components/DisciplineSelection';
import SkillAssessment from './components/SkillAssessment';
import LearningGoals from './components/LearningGoals';
import FeatureTour from './components/FeatureTour';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    preferredDiscipline: null,
    skillLevel: 'beginner',
    learningGoals: [],
    dailyTimeCommitment: 30,
    motivations: [],
    hasCompletedTour: false
  });
  const [user, setUser] = useState(null);

  const steps = [
    { id: 'welcome', title: 'Welcome', icon: Play, component: WelcomeStep },
    { id: 'discipline', title: 'Choose Discipline', icon: BookOpen, component: DisciplineSelection },
    { id: 'assessment', title: 'Skill Level', icon: Target, component: SkillAssessment },
    { id: 'goals', title: 'Learning Goals', icon: Award, component: LearningGoals },
    { id: 'tour', title: 'Feature Tour', icon: Users, component: FeatureTour }
  ];

  useEffect(() => {
    checkUser();
    loadOnboardingProgress();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase?.auth?.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session?.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/login');
    }
  };

  const loadOnboardingProgress = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase?.from('user_onboarding')?.select('*')?.eq('user_id', user?.id)?.single();

      if (error && error?.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCurrentStep(data?.current_step || 0);
        setOnboardingData(prev => ({
          ...prev,
          ...data?.preferences
        }));
      }
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
    }
  };

  const saveOnboardingProgress = async (stepData) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const updatedData = { ...onboardingData, ...stepData };
      setOnboardingData(updatedData);

      const { error } = await supabase?.from('user_onboarding')?.upsert({
          user_id: user?.id,
          status: currentStep === steps?.length - 1 ? 'completed' : 'in_progress',
          current_step: currentStep,
          completed_steps: steps?.slice(0, currentStep + 1)?.map(step => step?.id),
          preferences: updatedData,
          completed_at: currentStep === steps?.length - 1 ? new Date()?.toISOString() : null
        });

      if (error) throw error;

      // Also update user profile preferences
      if (updatedData?.preferredDiscipline) {
        await supabase?.from('user_profiles')?.update({ 
            specialization: updatedData?.preferredDiscipline,
            preferences: updatedData 
          })?.eq('id', user?.id);
      }

    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async (stepData = {}) => {
    await saveOnboardingProgress(stepData);
    
    if (currentStep < steps?.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding completed, redirect to dashboard
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    if (!user?.id) return;

    try {
      await supabase?.from('user_onboarding')?.upsert({
          user_id: user?.id,
          status: 'skipped',
          current_step: steps?.length,
          completed_at: new Date()?.toISOString()
        });

      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    }
  };

  const CurrentStepComponent = steps?.[currentStep]?.component;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Progress Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Welcome to EngineerMaster</h1>
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps?.length}
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Skip Setup
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              {steps?.map((step, index) => {
                const StepIcon = step?.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const isUpcoming = index > currentStep;

                return (
                  <React.Fragment key={step?.id}>
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                      ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                      ${isCurrent ? 'bg-blue-500 border-blue-500 text-white' : ''}
                      ${isUpcoming ? 'bg-gray-100 border-gray-300 text-gray-400' : ''}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    {index < steps?.length - 1 && (
                      <div className={`
                        h-1 w-12 transition-all
                        ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}
                      `} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2">
              {steps?.map((step, index) => (
                <div key={step?.id} className="text-xs text-gray-500 w-10 text-center">
                  {step?.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            {CurrentStepComponent && (
              <CurrentStepComponent
                data={onboardingData}
                onNext={handleNext}
                onBack={currentStep > 0 ? handleBack : null}
                isLoading={isLoading}
                user={user}
              />
            )}
          </div>

          {/* Navigation Footer */}
          <div className="bg-gray-50 px-8 py-6 flex items-center justify-between border-t">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${currentStep === 0 
                  ? 'text-gray-400 cursor-not-allowed' :'text-gray-700 hover:bg-gray-200'}
              `}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                {currentStep === steps?.length - 1 
                  ? 'Complete setup to start learning' 
                  : `${steps?.length - currentStep - 1} steps remaining`}
              </p>
            </div>

            <button
              onClick={() => handleNext()}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              <span>
                {isLoading ? 'Saving...' : currentStep === steps?.length - 1 ? 'Complete' : 'Continue'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;