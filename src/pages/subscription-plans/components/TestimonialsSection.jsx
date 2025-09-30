import React from 'react';
import Icon from '../../../components/AppIcon';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Mechanical Engineering Student',
      university: 'MIT',
      content: 'EngineerMaster transformed my understanding of thermodynamics. The interactive simulations made complex concepts click instantly.',
      rating: 5,
      plan: 'Professional'
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      role: 'Electrical Engineer',
      company: 'Tesla',
      content: 'The certification program helped me advance my career. The mentorship sessions were invaluable for real-world applications.',
      rating: 5,
      plan: 'Professional'
    },
    {
      id: 3,
      name: 'Dr. Emily Watson',
      role: 'Aerospace Engineering Professor',
      university: 'Stanford',
      content: 'I use EngineerMaster to supplement my courses. Students love the hands-on approach to learning fluid dynamics.',
      rating: 5,
      plan: 'Enterprise'
    }
  ];

  const stats = [
    {
      value: '50,000+',
      label: 'Engineers Trained',
      icon: 'Users'
    },
    {
      value: '95%',
      label: 'Success Rate',
      icon: 'TrendingUp'
    },
    {
      value: '4.9/5',
      label: 'Average Rating',
      icon: 'Star'
    },
    {
      value: '200+',
      label: 'Universities',
      icon: 'GraduationCap'
    }
  ];

  return (
    <div className="mb-16">
      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-12 text-white">
        <h3 className="text-2xl font-bold text-center mb-8">
          Trusted by Engineers Worldwide
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats?.map((stat) => (
            <div key={stat?.label} className="text-center">
              <Icon name={stat?.icon} size={32} className="mx-auto mb-2 text-blue-200" />
              <div className="text-2xl font-bold mb-1">{stat?.value}</div>
              <div className="text-blue-200 text-sm">{stat?.label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Testimonials */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-4">What Our Students Say</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Join thousands of engineers who have advanced their careers with EngineerMaster
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials?.map((testimonial) => (
          <div key={testimonial?.id} className="bg-white rounded-xl shadow-lg p-6">
            {/* Rating */}
            <div className="flex items-center mb-4">
              {[...Array(testimonial?.rating)]?.map((_, i) => (
                <Icon key={i} name="Star" size={16} className="text-yellow-400 fill-current" />
              ))}
            </div>

            {/* Content */}
            <p className="text-gray-700 mb-4 italic">
              "{testimonial?.content}"
            </p>

            {/* Author Info */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{testimonial?.name}</div>
                  <div className="text-sm text-gray-600">{testimonial?.role}</div>
                  <div className="text-sm text-gray-500">
                    {testimonial?.university || testimonial?.company}
                  </div>
                </div>
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  {testimonial?.plan}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* CTA Section */}
      <div className="text-center mt-12">
        <div className="bg-gray-50 rounded-2xl p-8 max-w-3xl mx-auto">
          <Icon name="Quote" size={40} className="text-gray-400 mx-auto mb-4" />
          <h4 className="text-xl font-semibold mb-4">
            Ready to join thousands of successful engineers?
          </h4>
          <p className="text-gray-600 mb-6">
            Start your 14-day free trial today and experience the difference EngineerMaster can make in your career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Start Free Trial
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              View Sample Lessons
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;