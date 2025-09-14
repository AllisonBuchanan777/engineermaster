import React from 'react';
import { Helmet } from 'react-helmet';
import RegistrationForm from './components/RegistrationForm';
import AchievementShowcase from './components/AchievementShowcase';

const Register = () => {
  return (
    <>
      <Helmet>
        <title>Register - EngineerMaster | Start Your Engineering Journey</title>
        <meta name="description" content="Join EngineerMaster and begin your gamified engineering education journey. Create your account and unlock interactive lessons across Electrical, Mechanical, Mechatronics, and Aerospace Engineering." />
        <meta name="keywords" content="engineering education, register, sign up, gamified learning, electrical engineering, mechanical engineering, aerospace engineering, mechatronics" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
            {/* Registration Form */}
            <div className="lg:sticky lg:top-8">
              <RegistrationForm />
            </div>

            {/* Achievement Showcase */}
            <div className="hidden lg:block">
              <AchievementShowcase />
            </div>
          </div>

          {/* Mobile Achievement Showcase */}
          <div className="lg:hidden mt-12">
            <AchievementShowcase />
          </div>
        </div>

        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </>
  );
};

export default Register;