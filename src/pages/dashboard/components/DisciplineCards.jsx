import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Zap, Cpu, Plane } from 'lucide-react';

const DisciplineCards = () => {
  const disciplines = [
    {
      id: 'electrical',
      name: 'Electrical Engineering',
      description: 'Master circuits, power systems, and electronics',
      progress: 65,
      totalLessons: 45,
      completedLessons: 29,
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      route: '/electrical-engineering-curriculum'
    },
    {
      id: 'mechanical',
      name: 'Mechanical Engineering',
      description: 'Explore mechanics, thermodynamics, and design',
      progress: 42,
      totalLessons: 52,
      completedLessons: 22,
      icon: TrendingUp,
      color: 'from-blue-500 to-indigo-500',
      route: '/mechanical-engineering-curriculum'
    },
    {
      id: 'mechatronic',
      name: 'Mechatronic Engineering',
      description: 'Integrate mechanical, electrical, and computer systems',
      progress: 28,
      totalLessons: 38,
      completedLessons: 11,
      icon: Cpu,
      color: 'from-purple-500 to-pink-500',
      route: '/mechatronic-engineering-curriculum'
    },
    {
      id: 'aerospace',
      name: 'Aerospace Engineering',
      description: 'Design aircraft, spacecraft, and propulsion systems',
      progress: 15,
      totalLessons: 48,
      completedLessons: 7,
      icon: Plane,
      color: 'from-sky-500 to-cyan-500',
      route: '/aerospace-engineering-curriculum'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Engineering Disciplines</h2>
        <Link 
          to="/comprehensive-lesson-library" 
          className="text-primary hover:text-primary/80 text-sm font-medium"
        >
          View All →
        </Link>
      </div>
      <div className="grid gap-6">
        {disciplines?.map((discipline) => (
          <Link
            key={discipline?.id}
            to={discipline?.route}
            className="group"
          >
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${discipline?.color} flex items-center justify-center text-white shadow-lg`}>
                    <discipline.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {discipline?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {discipline?.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">{discipline?.progress}%</div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">
                    {discipline?.completedLessons}/{discipline?.totalLessons} lessons
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${discipline?.color} transition-all duration-300`}
                    style={{ width: `${discipline?.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DisciplineCards;