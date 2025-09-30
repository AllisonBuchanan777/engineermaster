import React, { useState, useEffect } from 'react';
import { X, Clock, Star, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';

const ChallengeModal = ({ 
  isOpen, 
  onClose, 
  challenge, 
  onComplete,
  getDifficultyColor,
  getDisciplineIcon 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes in seconds
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock questions based on challenge type
  const generateQuestions = (challengeType, discipline) => {
    const baseQuestions = {
      quiz: [
        {
          id: 1,
          type: 'multiple_choice',
          question: `What is a fundamental principle in ${discipline} engineering?`,
          options: [
            'Conservation of energy',
            'Optimization of cost',
            'Maximum efficiency',
            'All of the above'
          ],
          correct: 3,
          explanation: 'All these principles are fundamental to engineering practice.',
          points: 20
        },
        {
          id: 2,
          type: 'multiple_choice',
          question: `Which material property is most important for structural design?`,
          options: [
            'Color',
            'Density',
            'Strength',
            'Texture'
          ],
          correct: 2,
          explanation: 'Strength is the primary consideration for structural integrity.',
          points: 20
        },
        {
          id: 3,
          type: 'true_false',
          question: `Safety factors are used to account for uncertainties in design.`,
          options: ['True', 'False'],
          correct: 0,
          explanation: 'Safety factors provide margin for unknown variables and ensure reliability.',
          points: 20
        },
        {
          id: 4,
          type: 'multiple_choice',
          question: `What is the primary purpose of engineering analysis?`,
          options: [
            'To increase project cost',
            'To predict system behavior',
            'To complicate the design',
            'To delay the project'
          ],
          correct: 1,
          explanation: 'Engineering analysis helps predict how systems will perform under various conditions.',
          points: 20
        },
        {
          id: 5,
          type: 'multiple_choice',
          question: `Which phase comes first in the engineering design process?`,
          options: [
            'Testing',
            'Implementation',
            'Problem identification',
            'Solution optimization'
          ],
          correct: 2,
          explanation: 'Understanding and clearly defining the problem is the crucial first step.',
          points: 20
        }
      ],
      simulation: [
        {
          id: 1,
          type: 'simulation_task',
          question: `Configure the system parameters for optimal performance`,
          task: 'simulation_setup',
          correct: 'optimal_config',
          points: 30
        }
      ],
      problem_solving: [
        {
          id: 1,
          type: 'numerical',
          question: `Calculate the required safety factor for a beam supporting 1000 N with a maximum safe load of 1500 N.`,
          answer: 1.5,
          tolerance: 0.1,
          explanation: 'Safety Factor = Maximum Safe Load / Applied Load = 1500 N / 1000 N = 1.5',
          points: 25
        }
      ]
    };

    return baseQuestions?.[challengeType] || baseQuestions?.quiz;
  };

  const [questions] = useState(() => generateQuestions(challenge?.challenge_type, challenge?.discipline));

  // Timer effect
  useEffect(() => {
    if (!isOpen || showResults) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, showResults]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestion(0);
      setAnswers({});
      setTimeRemaining(900);
      setShowResults(false);
      setScore(0);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions?.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    questions?.forEach((question) => {
      totalPoints += question?.points || 20;
      const userAnswer = answers?.[question?.id];
      
      if (userAnswer !== undefined && userAnswer === question?.correct) {
        earnedPoints += question?.points || 20;
      }
    });

    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
    
    // Calculate XP earned (base XP * score multiplier)
    const baseXP = challenge?.xp_reward || 25;
    const xpMultiplier = finalScore / 100;
    const earnedXP = Math.round(baseXP * Math.max(0.1, xpMultiplier)); // Minimum 10% XP
    
    // Complete the challenge
    await onComplete(challenge?.id, finalScore, earnedXP);
    setIsSubmitting(false);
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setTimeRemaining(900);
    setShowResults(false);
    setScore(0);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  const currentQ = questions?.[currentQuestion];
  const progress = ((currentQuestion + 1) / questions?.length) * 100;
  const isLastQuestion = currentQuestion === questions?.length - 1;
  const canProceed = answers?.[currentQ?.id] !== undefined;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getDisciplineIcon(challenge?.discipline)}</span>
              <div>
                <h2 className="text-xl font-semibold">{challenge?.title}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">
                    {challenge?.challenge_type?.replace('_', ' ')}
                  </span>
                  <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full capitalize">
                    {challenge?.difficulty}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm opacity-90">Time Remaining</div>
                <div className="text-lg font-bold flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(timeRemaining)}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!showResults ? (
            <div className="p-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Question {currentQuestion + 1} of {questions?.length}
                  </span>
                  <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              {currentQ && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {currentQ?.question}
                  </h3>

                  {/* Multiple Choice */}
                  {(currentQ?.type === 'multiple_choice' || currentQ?.type === 'true_false') && (
                    <div className="space-y-3">
                      {currentQ?.options?.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(currentQ?.id, index)}
                          className={`
                            w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                            ${answers?.[currentQ?.id] === index
                              ? 'border-blue-500 bg-blue-50 text-blue-900' :'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="flex items-center">
                            <div className={`
                              w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center
                              ${answers?.[currentQ?.id] === index
                                ? 'border-blue-500 bg-blue-500' :'border-gray-300'
                              }
                            `}>
                              {answers?.[currentQ?.id] === index && (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <span className="font-medium">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Numerical Input */}
                  {currentQ?.type === 'numerical' && (
                    <div>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Enter your answer"
                        value={answers?.[currentQ?.id] || ''}
                        onChange={(e) => handleAnswerSelect(currentQ?.id, parseFloat(e?.target?.value))}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className={`
                    px-6 py-3 rounded-lg font-medium transition-colors
                    ${currentQuestion === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }
                  `}
                >
                  Previous
                </button>

                <div className="flex space-x-3">
                  {isLastQuestion ? (
                    <button
                      onClick={handleSubmit}
                      disabled={!canProceed || isSubmitting}
                      className={`
                        px-8 py-3 rounded-lg font-medium transition-colors
                        ${!canProceed || isSubmitting
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
                        }
                      `}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Challenge'}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      disabled={!canProceed}
                      className={`
                        px-8 py-3 rounded-lg font-medium transition-colors
                        ${!canProceed
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        }
                      `}
                    >
                      Next Question
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Results Screen */
            (<div className="p-6 text-center">
              <div className="mb-6">
                {score >= 70 ? (
                  <div className="text-green-600 mb-4">
                    <CheckCircle className="w-16 h-16 mx-auto mb-2" />
                    <h3 className="text-2xl font-bold">Excellent Work!</h3>
                  </div>
                ) : (
                  <div className="text-orange-600 mb-4">
                    <AlertCircle className="w-16 h-16 mx-auto mb-2" />
                    <h3 className="text-2xl font-bold">Good Effort!</h3>
                  </div>
                )}
              </div>
              {/* Score Display */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">{score}%</div>
                <div className="text-gray-600 mb-4">Final Score</div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {Object.keys(answers)?.length}
                    </div>
                    <div className="text-sm text-gray-500">Answered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {questions?.filter(q => answers?.[q?.id] === q?.correct)?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600 flex items-center justify-center">
                      <Star className="w-5 h-5 mr-1" />
                      {Math.round((challenge?.xp_reward || 25) * Math.max(0.1, score / 100))}
                    </div>
                    <div className="text-sm text-gray-500">XP Earned</div>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  Continue Learning
                </button>
              </div>
            </div>)
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;