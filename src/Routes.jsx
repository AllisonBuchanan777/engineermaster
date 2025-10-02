import React from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

// Existing pages
import Dashboard from './pages/dashboard';
import LearningRoadmap from './pages/learning-roadmap';
import LessonInterface from './pages/lesson-interface';
import SimulationLab from './pages/simulation-lab';
import Login from './pages/login';
import Register from './pages/register';
import NotFound from './pages/NotFound';

// Subscription page (existing)
import SubscriptionPage from './pages/subscription';

// New pages
import SubscriptionPlansPage from './pages/subscription-plans';
import ProgressAnalyticsPage from './pages/progress-analytics';
import DailyChallengesHub from './pages/daily-challenges-hub';

// Comprehensive Lesson Library with Skill Trees and Achievement Levels
import ComprehensiveLessonLibrary from './pages/comprehensive-lesson-library';

// New individual feature pages
import SkillTrees from './pages/skill-trees';
import AchievementLevels from './pages/achievement-levels';

// Community Hub - NEW
import CommunityHub from './pages/community-hub';

// New onboarding and profile management pages
import OnboardingFlow from './pages/onboarding-flow';
import UserProfileManagement from './pages/user-profile-management';

// Add new imports
import AdminCMSDashboard from './pages/admin-cms-dashboard';
import NotificationCenter from './pages/notification-center';
import OfflineLearningMode from './pages/offline-learning-mode';

// NEW PAGES - Enhanced Dashboard
import EnhancedDashboard from './pages/enhanced-dashboard';

// NEW PAGE - Electrical Engineering Curriculum
import ElectricalEngineeringCurriculum from './pages/electrical-engineering-curriculum';

// NEW PAGE - Mechanical Engineering Curriculum
import MechanicalEngineeringCurriculum from './pages/mechanical-engineering-curriculum';

// NEW PAGE - Mechatronic Engineering Curriculum
import MechatronicEngineeringCurriculum from './pages/mechatronic-engineering-curriculum';

// NEW PAGE - Aerospace Engineering Curriculum
import AerospaceEngineeringCurriculum from './pages/aerospace-engineering-curriculum';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/enhanced-dashboard" element={<EnhancedDashboard />} />
          <Route path="/learning-roadmap" element={<LearningRoadmap />} />
          <Route path="/lesson/:lessonId" element={<LessonInterface />} />
          <Route path="/simulation-lab" element={<SimulationLab />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/subscription-plans" element={<SubscriptionPlansPage />} />
          <Route path="/progress-analytics" element={<ProgressAnalyticsPage />} />
          <Route path="/daily-challenges-hub" element={<DailyChallengesHub />} />
          <Route path="/comprehensive-lesson-library" element={<ComprehensiveLessonLibrary />} />
          <Route path="/skill-trees" element={<SkillTrees />} />
          <Route path="/achievement-levels" element={<AchievementLevels />} />
          <Route path="/community-hub" element={<CommunityHub />} />
          <Route path="/onboarding-flow" element={<OnboardingFlow />} />
          <Route path="/user-profile-management" element={<UserProfileManagement />} />
          
          <Route path="/admin-cms-dashboard" element={<AdminCMSDashboard />} />
          <Route path="/notification-center" element={<NotificationCenter />} />
          <Route path="/offline-learning-mode" element={<OfflineLearningMode />} />
          
          {/* NEW ROUTE - Electrical Engineering Curriculum */}
          <Route path="/electrical-engineering-curriculum" element={<ElectricalEngineeringCurriculum />} />
          
          {/* NEW ROUTE - Mechanical Engineering Curriculum */}
          <Route path="/mechanical-engineering-curriculum" element={<MechanicalEngineeringCurriculum />} />
          
          {/* NEW ROUTE - Mechatronic Engineering Curriculum */}
          <Route path="/mechatronic-engineering-curriculum" element={<MechatronicEngineeringCurriculum />} />
          
          {/* NEW ROUTE - Aerospace Engineering Curriculum */}
          <Route path="/aerospace-engineering-curriculum" element={<AerospaceEngineeringCurriculum />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;