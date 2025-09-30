import { supabase } from '../lib/supabase';

export const offlineService = {
  // Get user's offline content downloads
  async getUserOfflineContent(userId) {
    try {
      const { data, error } = await supabase
        ?.from('offline_content_downloads')
        ?.select(`
          *,
          lessons!inner (
            id,
            title,
            description,
            estimated_duration_minutes,
            difficulty,
            xp_reward
          ),
          learning_paths (
            id,
            name,
            discipline
          )
        `)
        ?.eq('user_id', userId)?.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching offline content:', error);
      throw error;
    }
  },

  // Get user's offline settings
  async getUserOfflineSettings(userId) {
    try {
      const { data, error } = await supabase
        ?.from('user_offline_settings')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.single();

      if (error && error?.code === 'PGRST116') {
        // Create default settings if none exist
        return await this.createDefaultOfflineSettings(userId);
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching offline settings:', error);
      throw error;
    }
  },

  // Create default offline settings
  async createDefaultOfflineSettings(userId) {
    try {
      const { data, error } = await supabase
        ?.from('user_offline_settings')
        ?.insert({
          user_id: userId,
          auto_download_enabled: false,
          max_storage_mb: 1024, // 1GB
          download_on_wifi_only: true,
          content_expiry_days: 30,
          preferred_quality: 'standard'
        })
        ?.select()
        ?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating default offline settings:', error);
      throw error;
    }
  },

  // Update user's offline settings
  async updateOfflineSettings(userId, settings) {
    try {
      const { data, error } = await supabase
        ?.from('user_offline_settings')?.update(settings)?.eq('user_id', userId)
        ?.select()
        ?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating offline settings:', error);
      throw error;
    }
  },

  // Request lesson download
  async requestLessonDownload(userId, lessonId, learningPathId = null) {
    try {
      // Check if already downloaded or downloading
      const { data: existing } = await supabase
        ?.from('offline_content_downloads')?.select('*')?.eq('user_id', userId)?.eq('lesson_id', lessonId)
        ?.single();

      if (existing?.status === 'downloaded' || existing?.status === 'downloading') {
        return existing;
      }

      // Get lesson details for size estimation
      const { data: lesson } = await supabase
        ?.from('lessons')?.select('title, content, estimated_duration_minutes')?.eq('id', lessonId)
        ?.single();

      // Estimate download size based on content
      const estimatedSize = this.estimateContentSize(lesson?.content);

      const downloadData = {
        user_id: userId,
        lesson_id: lessonId,
        learning_path_id: learningPathId,
        content_type: 'lesson',
        download_size_mb: estimatedSize,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)?.toISOString(), // 30 days
        storage_path: `${userId}/lessons/${lessonId}.zip`
      };

      const { data, error } = await supabase
        ?.from('offline_content_downloads')
        ?.upsert(downloadData, { onConflict: 'user_id,lesson_id' })
        ?.select()
        ?.single();

      if (error) throw error;

      // Simulate download process (in real app, this would be handled by a service worker)
      this.simulateDownload(data?.id);
      
      return data;
    } catch (error) {
      console.error('Error requesting lesson download:', error);
      throw error;
    }
  },

  // Simulate download progress (replace with actual download logic)
  async simulateDownload(downloadId) {
    try {
      // Update status to downloading
      await supabase
        ?.from('offline_content_downloads')
        ?.update({ 
          status: 'downloading',
          download_progress: 0 
        })
        ?.eq('id', downloadId);

      // Simulate progress updates
      for (let progress = 0; progress <= 100; progress += 20) {
        setTimeout(async () => {
          await supabase
            ?.from('offline_content_downloads')
            ?.update({ 
              download_progress: progress,
              ...(progress === 100 && { 
                status: 'downloaded', 
                downloaded_at: new Date()?.toISOString() 
              })
            })
            ?.eq('id', downloadId);
        }, progress * 50); // Simulate time delay
      }
    } catch (error) {
      console.error('Error simulating download:', error);
      // Mark download as failed
      await supabase
        ?.from('offline_content_downloads')
        ?.update({ status: 'failed' })
        ?.eq('id', downloadId);
    }
  },

  // Remove offline content
  async removeOfflineContent(userId, downloadId) {
    try {
      const { error } = await supabase
        ?.from('offline_content_downloads')
        ?.delete()
        ?.eq('id', downloadId)
        ?.eq('user_id', userId);

      if (error) throw error;

      // Also remove from storage
      const { data: download } = await supabase
        ?.from('offline_content_downloads')
        ?.select('storage_path')
        ?.eq('id', downloadId)
        ?.single();

      if (download?.storage_path) {
        await supabase?.storage
          ?.from('offline-content')
          ?.remove([download?.storage_path]);
      }

      return true;
    } catch (error) {
      console.error('Error removing offline content:', error);
      throw error;
    }
  },

  // Get storage usage
  async getStorageUsage(userId) {
    try {
      const { data, error } = await supabase
        ?.from('offline_storage_usage')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.single();

      if (error && error?.code === 'PGRST116') {
        // Calculate and create if doesn't exist
        await supabase?.rpc('calculate_storage_usage', { target_user_id: userId });
        return await this.getStorageUsage(userId);
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching storage usage:', error);
      throw error;
    }
  },

  // Sync offline progress
  async syncOfflineProgress(userId) {
    try {
      const { data, error } = await supabase
        ?.rpc('sync_offline_progress_to_main', { target_user_id: userId });

      if (error) throw error;
      return data; // Number of synced records
    } catch (error) {
      console.error('Error syncing offline progress:', error);
      throw error;
    }
  },

  // Check connectivity and return status
  checkConnectivity() {
    return {
      online: navigator?.onLine ?? true,
      effectiveType: navigator?.connection?.effectiveType || 'unknown',
      downlink: navigator?.connection?.downlink || 0
    };
  },

  // Get downloadable lessons for a learning path
  async getDownloadableLessons(userId, learningPathId) {
    try {
      const { data, error } = await supabase
        ?.from('lessons')
        ?.select(`
          id,
          title,
          description,
          difficulty,
          estimated_duration_minutes,
          xp_reward,
          access_level,
          offline_content_downloads!left (
            id,
            status,
            download_progress,
            downloaded_at,
            download_size_mb
          )
        `)
        ?.eq('learning_path_id', learningPathId)
        ?.eq('is_published', true)
        ?.order('order_index');

      if (error) throw error;
      
      return data?.map(lesson => ({
        ...lesson,
        isDownloaded: lesson?.offline_content_downloads?.some(d => 
          d?.status === 'downloaded'
        ),
        downloadInfo: lesson?.offline_content_downloads?.[0] || null
      })) || [];
    } catch (error) {
      console.error('Error fetching downloadable lessons:', error);
      throw error;
    }
  },

  // Estimate content size based on lesson content
  estimateContentSize(content) {
    if (!content) return 5; // Default 5MB
    
    const contentStr = JSON.stringify(content);
    const baseSize = contentStr?.length / (1024 * 1024); // Size in MB
    
    // Add extra for media content, simulations, etc.
    const hasMedia = contentStr?.includes('video') || contentStr?.includes('image');
    const hasInteractive = contentStr?.includes('interactive') || contentStr?.includes('simulation');
    
    let multiplier = 1;
    if (hasMedia) multiplier += 2;
    if (hasInteractive) multiplier += 1.5;
    
    return Math.max(baseSize * multiplier, 1); // Minimum 1MB
  },

  // Cache lesson progress offline
  async cacheOfflineProgress(userId, lessonId, progressData) {
    try {
      const { data, error } = await supabase
        ?.from('offline_progress_cache')
        ?.upsert({
          user_id: userId,
          lesson_id: lessonId,
          ...progressData,
          sync_status: 'offline_only',
          offline_timestamp: new Date()?.toISOString()
        }, { onConflict: 'user_id,lesson_id' })
        ?.select()
        ?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error caching offline progress:', error);
      throw error;
    }
  },

  // Get offline progress cache
  async getOfflineProgressCache(userId) {
    try {
      const { data, error } = await supabase
        ?.from('offline_progress_cache')
        ?.select(`
          *,
          lessons!inner (
            id,
            title,
            description
          )
        `)
        ?.eq('user_id', userId)
        ?.eq('sync_status', 'offline_only')
        ?.order('offline_timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching offline progress cache:', error);
      throw error;
    }
  },

  // Clean expired content
  async cleanExpiredContent() {
    try {
      const { error } = await supabase?.rpc('cleanup_expired_offline_content');
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error cleaning expired content:', error);
      throw error;
    }
  }
};