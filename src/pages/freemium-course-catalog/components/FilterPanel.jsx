import React from 'react';
import { X, Grid, List } from 'lucide-react';

const FilterPanel = ({
  selectedAccessLevel,
  setSelectedAccessLevel,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onClose
}) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Access Level Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Access Level
          </label>
          <select
            value={selectedAccessLevel}
            onChange={(e) => setSelectedAccessLevel(e?.target?.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Courses</option>
            <option value="free">Free Only</option>
            <option value="premium">Premium Only</option>
            <option value="professional">Professional Only</option>
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e?.target?.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="relevance">Relevance</option>
            <option value="title">Title (A-Z)</option>
            <option value="difficulty">Difficulty</option>
            <option value="duration">Duration</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* View Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            View Mode
          </label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'grid' ?'bg-blue-600 text-white' :'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Grid className="w-4 h-4 inline mr-1" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                viewMode === 'list' ?'bg-blue-600 text-white' :'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4 inline mr-1" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Showing filtered results
        </div>
        <button
          onClick={() => {
            setSelectedAccessLevel('all');
            setSortBy('relevance');
            setViewMode('grid');
            onClose();
          }}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;