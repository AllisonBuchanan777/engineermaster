import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import { Download, Play, Trash2, Filter, Search, BookOpen, Clock, Award, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { offlineService } from '../../../services/offlineService';
import { learningService } from '../../../services/learningService';

const OfflineContentLibrary = ({ user, offlineContent, onRemoveContent, onRefresh }) => {
  const [availableContent, setAvailableContent] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiscipline, setFilterDiscipline] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [downloading, setDownloading] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Load available content for download
  useEffect(() => {
    if (user?.id) {
      loadAvailableContent();
    }
  }, [user?.id]);

  const loadAvailableContent = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const learningPaths = await learningService?.getUserLearningPaths(user?.id);
      const allLessons = [];
      
      for (const path of learningPaths || []) {
        if (path?.lessons?.length > 0) {
          for (const lesson of path?.lessons) {
            // Check if lesson is already downloaded
            const existingDownload = offlineContent?.find(content => 
              content?.lesson_id === lesson?.id
            );
            
            allLessons?.push({
              ...lesson,
              learning_path_id: path?.id,
              learning_path_name: path?.name,
              discipline: path?.discipline,
              isDownloaded: existingDownload?.status === 'downloaded',
              downloadInfo: existingDownload || null
            });
          }
        }
      }
      
      setAvailableContent(allLessons);
    } catch (error) {
      console.error('Error loading available content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (lesson) => {
    if (!user?.id || downloading?.has(lesson?.id)) return;
    
    setDownloading(prev => new Set(prev?.add(lesson?.id)));
    
    try {
      await offlineService?.requestLessonDownload(
        user?.id, 
        lesson?.id, 
        lesson?.learning_path_id
      );
      
      // Refresh content after download request
      await onRefresh?.();
      await loadAvailableContent();
    } catch (error) {
      console.error('Error downloading lesson:', error);
    } finally {
      setDownloading(prev => {
        const newSet = new Set(prev);
        newSet?.delete(lesson?.id);
        return newSet;
      });
    }
  };

  const filteredContent = availableContent?.filter(lesson => {
    const matchesSearch = !searchTerm || 
      lesson?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      lesson?.learning_path_name?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesDiscipline = filterDiscipline === 'all' || 
      lesson?.discipline === filterDiscipline;
    
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'downloaded' && lesson?.isDownloaded) ||
      (filterStatus === 'available' && !lesson?.isDownloaded);
    
    return matchesSearch && matchesDiscipline && matchesStatus;
  });

  const getDisciplines = () => {
    const disciplines = [...new Set(availableContent?.map(lesson => lesson?.discipline)?.filter(Boolean))];
    return disciplines;
  };

  const getStatusIcon = (lesson) => {
    if (downloading?.has(lesson?.id)) {
      return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
    }
    
    if (lesson?.downloadInfo?.status === 'downloading') {
      return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
    }
    
    if (lesson?.isDownloaded) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    if (lesson?.downloadInfo?.status === 'failed') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    
    return null;
  };

  const formatSize = (mb) => {
    if (!mb) return 'Unknown size';
    if (mb >= 1024) {
      return `${(mb / 1024)?.toFixed(1)} GB`;
    }
    return `${mb?.toFixed(0)} MB`;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      advanced: 'bg-orange-100 text-orange-800 border-orange-200',
      expert: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors?.[difficulty] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-3">Loading available content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search lessons and courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Discipline Filter */}
          <select
            value={filterDiscipline}
            onChange={(e) => setFilterDiscipline(e?.target?.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Disciplines</option>
            {getDisciplines()?.map(discipline => (
              <option key={discipline} value={discipline}>
                {discipline?.charAt(0)?.toUpperCase() + discipline?.slice(1)}
              </option>
            ))}
          </select>
          
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e?.target?.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Content</option>
            <option value="downloaded">Downloaded</option>
            <option value="available">Available to Download</option>
          </select>
        </div>
      </div>
      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {availableContent?.length}
          </div>
          <div className="text-sm text-muted-foreground">Total Lessons</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {availableContent?.filter(l => l?.isDownloaded)?.length}
          </div>
          <div className="text-sm text-muted-foreground">Downloaded</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {availableContent?.filter(l => l?.downloadInfo?.status === 'downloading')?.length}
          </div>
          <div className="text-sm text-muted-foreground">Downloading</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {availableContent?.length - availableContent?.filter(l => l?.isDownloaded)?.length}
          </div>
          <div className="text-sm text-muted-foreground">Available</div>
        </div>
      </div>
      {/* Content Grid */}
      <div className="grid gap-4">
        {filteredContent?.length > 0 ? (
          filteredContent?.map(lesson => (
            <div key={lesson?.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Lesson Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
                        {lesson?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {lesson?.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {lesson?.learning_path_name}
                        </span>
                        
                        {lesson?.estimated_duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {lesson?.estimated_duration_minutes} min
                          </span>
                        )}
                        
                        {lesson?.xp_reward && (
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            {lesson?.xp_reward} XP
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(lesson?.difficulty)}`}>
                          {lesson?.difficulty?.charAt(0)?.toUpperCase() + lesson?.difficulty?.slice(1)}
                        </span>
                        
                        {lesson?.discipline && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {lesson?.discipline?.charAt(0)?.toUpperCase() + lesson?.discipline?.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Info & Actions */}
                <div className="flex-shrink-0">
                  <div className="flex flex-col items-end gap-3">
                    {/* Status and Size */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        {getStatusIcon(lesson)}
                        <span className="text-sm font-medium">
                          {lesson?.isDownloaded ? 'Downloaded' : 
                           lesson?.downloadInfo?.status === 'downloading' ? 'Downloading...' :
                           lesson?.downloadInfo?.status === 'failed' ? 'Failed' : 'Available'}
                        </span>
                      </div>
                      
                      {lesson?.downloadInfo?.download_size_mb && (
                        <div className="text-xs text-muted-foreground">
                          {formatSize(lesson?.downloadInfo?.download_size_mb)}
                        </div>
                      )}
                      
                      {lesson?.downloadInfo?.status === 'downloading' && (
                        <div className="text-xs text-blue-600 mt-1">
                          {lesson?.downloadInfo?.download_progress}% complete
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      {lesson?.isDownloaded ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => {
                              // Navigate to lesson (implement lesson navigation)
                              console.log('Open lesson:', lesson?.id);
                            }}
                          >
                            <Play className="w-4 h-4" />
                            Open
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                            onClick={() => onRemoveContent?.(lesson?.downloadInfo?.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleDownload(lesson)}
                          disabled={downloading?.has(lesson?.id) || lesson?.downloadInfo?.status === 'downloading'}
                          className="flex items-center gap-1"
                          size="sm"
                        >
                          <Download className="w-4 h-4" />
                          {downloading?.has(lesson?.id) ? 'Requesting...' : 'Download'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Download Progress Bar */}
              {lesson?.downloadInfo?.status === 'downloading' && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Download Progress</span>
                    <span className="text-sm font-medium">{lesson?.downloadInfo?.download_progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${lesson?.downloadInfo?.download_progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No content found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterDiscipline !== 'all' || filterStatus !== 'all' ?'Try adjusting your search or filters.' :'No lessons are available for download yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineContentLibrary;