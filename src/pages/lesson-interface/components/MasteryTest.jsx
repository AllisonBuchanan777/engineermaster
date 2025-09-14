import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MasteryTest = ({ isVisible, onClose, onComplete, questions }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    questions?.forEach((question, index) => {
      if (selectedAnswers?.[index] === question?.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / questions?.length) * 100);
    setScore(finalScore);
    setShowResults(true);
  };

  const handleComplete = () => {
    onComplete(score);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {!showResults ? (
          <>
            {/* Header */}
            <div className="border-b border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Mastery Test</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Question {currentQuestion + 1} of {questions?.length}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <Icon name="X" size={20} />
                </Button>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions?.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-foreground mb-4">
                  {questions?.[currentQuestion]?.question}
                </h3>
                
                {questions?.[currentQuestion]?.image && (
                  <div className="mb-4">
                    <img
                      src={questions?.[currentQuestion]?.image}
                      alt="Question diagram"
                      className="max-w-full h-auto rounded-lg border border-border"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  {questions?.[currentQuestion]?.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion, index)}
                      className={`w-full text-left p-4 rounded-lg border transition-all duration-150 ${
                        selectedAnswers?.[currentQuestion] === index
                          ? 'border-primary bg-primary/5 text-primary' :'border-border hover:border-primary/50 hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswers?.[currentQuestion] === index
                            ? 'border-primary bg-primary' :'border-muted-foreground'
                        }`}>
                          {selectedAnswers?.[currentQuestion] === index && (
                            <Icon name="Check" size={12} color="white" />
                          )}
                        </div>
                        <span className="text-foreground">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="border-t border-border p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  iconName="ChevronLeft"
                  iconPosition="left"
                >
                  Previous
                </Button>

                {currentQuestion === questions?.length - 1 ? (
                  <Button
                    variant="default"
                    onClick={handleSubmit}
                    disabled={Object.keys(selectedAnswers)?.length !== questions?.length}
                    iconName="CheckCircle"
                    iconPosition="left"
                  >
                    Submit Test
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => setCurrentQuestion(prev => Math.min(questions?.length - 1, prev + 1))}
                    disabled={selectedAnswers?.[currentQuestion] === undefined}
                    iconName="ChevronRight"
                    iconPosition="right"
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Results Screen */
          (<div className="p-6">
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                score >= 80 ? 'bg-success/20' : score >= 60 ? 'bg-warning/20' : 'bg-error/20'
              }`}>
                <Icon 
                  name={score >= 80 ? "Trophy" : score >= 60 ? "Award" : "AlertCircle"} 
                  size={40} 
                  className={score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-error'}
                />
              </div>
              
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                {score >= 80 ? 'Excellent Work!' : score >= 60 ? 'Good Job!' : 'Keep Practicing!'}
              </h2>
              
              <p className="text-lg text-muted-foreground mb-6">
                You scored {score}% ({Object.values(selectedAnswers)?.filter((answer, index) => 
                  answer === questions?.[index]?.correctAnswer
                )?.length} out of {questions?.length} correct)
              </p>

              {score >= 80 ? (
                <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6">
                  <p className="text-success font-medium">🎉 Mastery Achieved!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You've demonstrated mastery of this topic. You can now progress to the next lesson.
                  </p>
                </div>
              ) : (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
                  <p className="text-warning font-medium">Review Recommended</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Consider reviewing the lesson material before moving on to ensure solid understanding.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Review Lesson
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleComplete}
                  disabled={score < 60}
                >
                  Continue Learning
                </Button>
              </div>
            </div>
          </div>)
        )}
      </div>
    </div>
  );
};

export default MasteryTest;