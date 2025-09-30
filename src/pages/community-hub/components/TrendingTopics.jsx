import React from 'react';
import { TrendingUp, MessageCircle, Clock, Flame } from 'lucide-react';

const TrendingTopics = () => {
  const trendingTopics = [
    {
      id: 1,
      title: 'Machine Learning in Civil Engineering',
      category: 'AI/ML',
      replies: 45,
      views: 1200,
      timeAgo: '2h ago',
      isHot: true
    },
    {
      id: 2,
      title: 'Sustainable Energy Solutions',
      category: 'Environmental',
      replies: 32,
      views: 890,
      timeAgo: '4h ago',
      isHot: true
    },
    {
      id: 3,
      title: 'CAD Software Recommendations',
      category: 'Tools',
      replies: 67,
      views: 2100,
      timeAgo: '6h ago',
      isHot: false
    },
    {
      id: 4,
      title: 'Internship Interview Tips',
      category: 'Career',
      replies: 28,
      views: 745,
      timeAgo: '1d ago',
      isHot: false
    },
    {
      id: 5,
      title: 'Arduino vs Raspberry Pi',
      category: 'Electronics',
      replies: 51,
      views: 1530,
      timeAgo: '1d ago',
      isHot: false
    }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      'AI/ML': 'bg-purple-100 text-purple-700',
      'Environmental': 'bg-green-100 text-green-700',
      'Tools': 'bg-blue-100 text-blue-700',
      'Career': 'bg-orange-100 text-orange-700',
      'Electronics': 'bg-red-100 text-red-700'
    };
    return colors?.[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Trending Topics
        </h3>
        <span className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
          View All
        </span>
      </div>
      <div className="space-y-4">
        {trendingTopics?.map((topic, index) => (
          <div key={topic?.id} className="group cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-gray-600 mr-2">#{index + 1}</span>
                  {topic?.isHot && <Flame className="w-3 h-3 text-orange-500 mr-2" />}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(topic?.category)}`}>
                    {topic?.category}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                  {topic?.title}
                </h4>
                <div className="flex items-center text-xs text-gray-500 space-x-3">
                  <div className="flex items-center">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    <span>{topic?.replies}</span>
                  </div>
                  <div className="flex items-center">
                    <span>{(topic?.views / 1000)?.toFixed(1)}k views</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{topic?.timeAgo}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-100">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
          See More Trending Topics →
        </button>
      </div>
    </div>
  );
};

export default TrendingTopics;