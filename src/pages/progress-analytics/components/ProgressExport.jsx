import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ProgressExport = ({ analyticsData, onExport }) => {
  const [exportFormat, setExportFormat] = useState('json');
  const [includePersonalData, setIncludePersonalData] = useState(true);

  const handleExport = () => {
    if (!analyticsData) return;

    const exportData = {
      exportedAt: new Date()?.toISOString(),
      format: exportFormat,
      includesPersonalData: includePersonalData,
      summary: {
        totalXP: analyticsData?.progressStats?.total_xp || 0,
        currentLevel: analyticsData?.progressStats?.current_level || 1,
        lessonsCompleted: analyticsData?.progressStats?.lessons_completed || 0,
        totalAchievements: analyticsData?.achievements?.length || 0
      },
      ...(includePersonalData && {
        detailedProgress: analyticsData
      })
    };

    const filename = `progress-analytics-${new Date()?.toISOString()?.split('T')?.[0]}.${exportFormat}`;
    
    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      downloadFile(blob, filename);
    } else if (exportFormat === 'csv') {
      const csvData = convertToCSV(exportData);
      const blob = new Blob([csvData], { type: 'text/csv' });
      downloadFile(blob, filename);
    }
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    const rows = [];
    
    // Add summary data
    rows?.push(['Metric', 'Value']);
    rows?.push(['Export Date', data?.exportedAt]);
    rows?.push(['Total XP', data?.summary?.totalXP]);
    rows?.push(['Current Level', data?.summary?.currentLevel]);
    rows?.push(['Lessons Completed', data?.summary?.lessonsCompleted]);
    rows?.push(['Total Achievements', data?.summary?.totalAchievements]);
    
    if (includePersonalData && data?.detailedProgress?.xpHistory) {
      rows?.push(['']);
      rows?.push(['XP History']);
      rows?.push(['Date', 'XP Amount', 'Source', 'Description']);
      
      data?.detailedProgress?.xpHistory?.forEach(transaction => {
        rows?.push([
          new Date(transaction.created_at)?.toLocaleDateString(),
          transaction?.amount,
          transaction?.source,
          transaction?.description || ''
        ]);
      });
    }

    return rows?.map(row => 
      row?.map(field => 
        typeof field === 'string' && field?.includes(',') 
          ? `"${field}"` 
          : field
      )?.join(',')
    )?.join('\n');
  };

  if (!analyticsData) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center">
            <Icon name="Download" className="mr-3 text-blue-500" size={24} />
            Export Progress Report
          </h3>
          <p className="text-gray-600 mt-1">
            Download your learning analytics for personal records or portfolio use
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Options */}
        <div>
          <h4 className="font-medium mb-4">Export Options</h4>
          
          <div className="space-y-4">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="json">JSON (Full Data)</option>
                <option value="csv">CSV (Summary + History)</option>
              </select>
            </div>

            {/* Privacy Options */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includePersonalData}
                  onChange={(e) => setIncludePersonalData(e?.target?.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Include detailed progress data
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                Unchecking this will export only summary statistics
              </p>
            </div>
          </div>
        </div>

        {/* Export Preview */}
        <div>
          <h4 className="font-medium mb-4">What's Included</h4>
          
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Icon name="Check" size={16} className="text-green-500 mr-3" />
              <span>Learning progress summary</span>
            </div>
            <div className="flex items-center text-sm">
              <Icon name="Check" size={16} className="text-green-500 mr-3" />
              <span>XP and level progression</span>
            </div>
            <div className="flex items-center text-sm">
              <Icon name="Check" size={16} className="text-green-500 mr-3" />
              <span>Achievement timeline</span>
            </div>
            <div className="flex items-center text-sm">
              <Icon 
                name={includePersonalData ? "Check" : "X"} 
                size={16} 
                className={`${includePersonalData ? 'text-green-500' : 'text-gray-300'} mr-3`} 
              />
              <span className={includePersonalData ? '' : 'text-gray-400'}>
                Detailed lesson history
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Icon 
                name={includePersonalData ? "Check" : "X"} 
                size={16} 
                className={`${includePersonalData ? 'text-green-500' : 'text-gray-300'} mr-3`} 
              />
              <span className={includePersonalData ? '' : 'text-gray-400'}>
                Discipline competency data
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Export Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <Icon name="Shield" size={16} className="inline mr-2" />
            Your data is exported locally and never sent to external servers
          </div>
          
          <Button
            onClick={handleExport}
            iconName="Download"
            className="ml-4"
          >
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgressExport;