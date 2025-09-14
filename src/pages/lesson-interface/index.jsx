import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import LessonHeader from './components/LessonHeader';
import ContentPanel from './components/ContentPanel';
import NotesPanel from './components/NotesPanel';
import XPTracker from './components/XPTracker';
import MasteryTest from './components/MasteryTest';

const LessonInterface = () => {
  const [showNotes, setShowNotes] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState(new Set());
  const [showMasteryTest, setShowMasteryTest] = useState(false);
  const [userXP, setUserXP] = useState(2450);
  const [earnedXP, setEarnedXP] = useState(0);

  // Mock lesson data
  const lesson = {
    id: 'ee-101-ohms-law',
    title: "Understanding Ohm\'s Law",
    discipline: 'Electrical Engineering',
    difficulty: 'Beginner',
    duration: 25,
    description: `Master the fundamental relationship between voltage, current, and resistance in electrical circuits through interactive simulations and hands-on challenges.`,
    sections: [
      {
        id: 'intro',
        title: 'Introduction to Ohm\'s Law',
        type: 'text',
        content: 'Basic concepts and historical context',
        isFirst: true,
        isLast: false
      },
      {
        id: 'theory',
        title: 'Mathematical Foundation',
        type: 'video',
        videoUrl: '/videos/ohms-law-theory.mp4',
        isFirst: false,
        isLast: false
      },
      {
        id: 'simulation',
        title: 'Interactive Circuit Simulation',
        type: 'simulation',
        isFirst: false,
        isLast: false
      },
      {
        id: 'practice',
        title: 'Hands-on Assembly',
        type: 'interactive',
        isFirst: false,
        isLast: true
      }
    ]
  };

  // Mock mastery test questions
  const masteryQuestions = [
    {
      question: "According to Ohm's Law, if voltage increases and resistance stays constant, what happens to current?",
      options: [
        "Current decreases",
        "Current increases", 
        "Current stays the same",
        "Current becomes zero"
      ],
      correctAnswer: 1,
      image: null
    },
    {
      question: "What is the current through a 100Ω resistor with 12V applied across it?",
      options: [
        "0.12 A",
        "1.2 A",
        "12 A", 
        "1200 A"
      ],
      correctAnswer: 0,
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop"
    },
    {
      question: "Which formula correctly represents Ohm\'s Law?",
      options: [
        "V = I + R",
        "V = I - R",
        "V = I × R",
        "V = I ÷ R"
      ],
      correctAnswer: 2,
      image: null
    }
  ];

  const progress = {
    current: completedSections?.size,
    total: lesson?.sections?.length
  };

  const currentSection = lesson?.sections?.[currentSectionIndex];

  const handleSectionComplete = () => {
    const newCompleted = new Set(completedSections);
    newCompleted?.add(currentSection?.id);
    setCompletedSections(newCompleted);
    
    // Award XP for completion
    setEarnedXP(25);
    setUserXP(prev => prev + 25);
    
    // Check if all sections are complete
    if (newCompleted?.size === lesson?.sections?.length) {
      setTimeout(() => {
        setShowMasteryTest(true);
      }, 1500);
    }
  };

  const handleNavigation = (direction) => {
    if (direction === 'next' && currentSectionIndex < lesson?.sections?.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else if (direction === 'previous' && currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const handleMasteryTestComplete = (score) => {
    const bonusXP = score >= 80 ? 100 : score >= 60 ? 50 : 25;
    setEarnedXP(bonusXP);
    setUserXP(prev => prev + bonusXP);
  };

  // Reset earned XP after animation
  useEffect(() => {
    if (earnedXP > 0) {
      const timer = setTimeout(() => {
        setEarnedXP(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [earnedXP]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Lesson Header */}
        <LessonHeader
          lesson={lesson}
          progress={progress}
          onToggleNotes={() => setShowNotes(!showNotes)}
          showNotes={showNotes}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Content Panel */}
          <div className={`flex-1 overflow-y-auto ${showNotes ? 'mr-0' : ''}`}>
            <div className="p-6">
              <Breadcrumb />
              
              <ContentPanel
                currentSection={currentSection}
                onSectionComplete={handleSectionComplete}
                onNavigate={handleNavigation}
              />
            </div>
          </div>

          {/* Notes Panel */}
          <NotesPanel
            lesson={lesson}
            isVisible={showNotes}
          />
        </div>
      </div>

      {/* XP Tracker */}
      <XPTracker
        currentXP={userXP}
        earnedXP={earnedXP}
        streak={7}
      />

      {/* Mastery Test Modal */}
      <MasteryTest
        isVisible={showMasteryTest}
        onClose={() => setShowMasteryTest(false)}
        onComplete={handleMasteryTestComplete}
        questions={masteryQuestions}
      />

      {/* Mobile Bottom Navigation Spacer */}
      <div className="md:hidden h-16" />
    </div>
  );
};

export default LessonInterface;