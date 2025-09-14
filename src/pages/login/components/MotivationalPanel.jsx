import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const MotivationalPanel = () => {
  const features = [
    {
      icon: 'Gamepad2',
      title: 'Gamified Learning',
      description: 'Earn XP, unlock achievements, and level up your engineering skills'
    },
    {
      icon: 'Users',
      title: 'Interactive Community',
      description: 'Connect with fellow engineers and collaborate on challenging projects'
    },
    {
      icon: 'Zap',
      title: 'Real-World Simulations',
      description: 'Practice with industry-grade tools and realistic engineering scenarios'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Active Learners' },
    { value: '1000+', label: 'Engineering Challenges' },
    { value: '95%', label: 'Success Rate' }
  ];

  return (
    <div className="hidden lg:flex lg:flex-col lg:justify-center lg:px-12 xl:px-16 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border border-primary rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border border-accent rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 border border-secondary rounded-full"></div>
      </div>
      <div className="relative z-10">
        {/* Hero Image */}
        <div className="mb-8">
          <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop"
              alt="Engineering workspace with circuits and components"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Master Engineering Through Interactive Learning
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Join thousands of engineers who are advancing their careers through our gamified learning platform. From circuits to spacecraft, master every discipline.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            {features?.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={feature?.icon} size={20} color="var(--color-primary)" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{feature?.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature?.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
            {stats?.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">{stat?.value}</div>
                <div className="text-sm text-muted-foreground">{stat?.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <Icon name="User" size={20} color="white" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Sarah Martinez</div>
                <div className="text-sm text-muted-foreground">Aerospace Engineer at SpaceX</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic">
              "EngineerMaster transformed how I approach complex problems. The gamified approach made learning advanced concepts actually enjoyable!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotivationalPanel;