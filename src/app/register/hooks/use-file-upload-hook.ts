import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/storage/supabase';

interface UseFileUploadOptions {
  bucket: string;
  maxFileSize?: number; // in bytes, default 5MB
  allowedTypes?: string[]; // MIME types
  cleanupOnUnmount?: boolean; // Whether to cleanup files on unmount
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  url: string | null;
}

export function useFileUpload(options: UseFileUploadOptions) {
  const {
    bucket,
    maxFileSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
    cleanupOnUnmount = true
  } = options;

  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    url: null,
  });

  // Track uploaded files for cleanup
  const uploadedFilesRef = useRef<Set<string>>(new Set());
  const isSubmittedRef = useRef(false);

  const supabase = createClient();

  // Only cleanup on unmount if explicitly requested (not during normal form navigation)
  useEffect(() => {
    return () => {
      // Don't auto-cleanup on unmount - only cleanup when explicitly called
      // This prevents deletion when user navigates between form steps
    };
  }, [cleanupOnUnmount]);

  const cleanupFiles = async (filePaths: string[]) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove(filePaths);
      
      if (error) {
        console.warn('Error cleaning up files:', error);
      } else {
        console.log('Cleaned up abandoned files:', filePaths);
      }
    } catch (error) {
      console.warn('Failed to cleanup files:', error);
    }
  };

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }

    if (file.size > maxFileSize) {
      return `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum size ${(maxFileSize / 1024 / 1024).toFixed(2)}MB`;
    }

    return null;
  };

  // Generate standardized filename: "nic"-nic_number-date-timestamp_in_milliseconds.extension
  const generateStandardFileName = (nicNumber: string, file: File): string => {
    const timestamp = Date.now();
    const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD format
    
    // Determine file extension from MIME type or fallback to file extension
    let fileExtension = 'jpg'; // default
    if (file.type === 'application/pdf') {
      fileExtension = 'pdf';
    } else if (file.type.includes('png')) {
      fileExtension = 'png';
    } else if (file.type.includes('webp')) {
      fileExtension = 'webp';
    } else if (file.type.includes('jpeg') || file.type.includes('jpg')) {
      fileExtension = 'jpg';
    } else {
      // Fallback to file extension from filename
      const originalExtension = file.name.split('.').pop()?.toLowerCase();
      if (originalExtension && ['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(originalExtension)) {
        fileExtension = originalExtension === 'jpeg' ? 'jpg' : originalExtension;
      }
    }
    
    // Clean NIC number (remove any spaces or special characters)
    const cleanNicNumber = nicNumber.replace(/[^a-zA-Z0-9]/g, '');
    
    return `NIC/nic-${cleanNicNumber}-${currentDate}-${timestamp}.${fileExtension}`;
  };

  const uploadFile = async (file: File, nicNumber: string, currentFileUrl?: string, shouldDeletePrevious: boolean = false): Promise<string | null> => {
    // Reset state
    setUploadState({
      uploading: true,
      progress: 0,
      error: null,
      url: null,
    });

    try {
      // Validate NIC number
      if (!nicNumber || nicNumber.trim() === '') {
        setUploadState(prev => ({
          ...prev,
          uploading: false,
          error: 'NIC number is required before uploading files',
        }));
        return null;
      }

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setUploadState(prev => ({
          ...prev,
          uploading: false,
          error: validationError,
        }));
        return null;
      }

      // Generate standardized filename
      const finalFileName = generateStandardFileName(nicNumber.trim(), file);

      console.log('Uploading file:', finalFileName, 'to bucket:', bucket);

      // Only delete previous file if explicitly requested (e.g., user clicked replace or remove)
      if (currentFileUrl && shouldDeletePrevious) {
        try {
          // Extract file path from URL
          const urlParts = currentFileUrl.split('/');
          const filePath = urlParts[urlParts.length - 1];
          await deleteFile(filePath);
          uploadedFilesRef.current.delete(filePath);
          console.log('Previous file deleted:', filePath);
        } catch (deleteError) {
          console.warn('Failed to delete previous file:', deleteError);
          // Continue with upload even if delete fails
        }
      }

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(finalFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      if (!data?.path) {
        throw new Error('Upload succeeded but no file path returned');
      }

      // Track the uploaded file for potential cleanup
      uploadedFilesRef.current.add(data.path);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }

      console.log('Upload successful:', urlData.publicUrl);

      setUploadState({
        uploading: false,
        progress: 100,
        error: null,
        url: urlData.publicUrl,
      });

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState({
        uploading: false,
        progress: 0,
        error: errorMessage,
        url: null,
      });
      return null;
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      // Remove from tracking
      uploadedFilesRef.current.delete(filePath);
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  };

  const resetUploadState = () => {
    setUploadState({
      uploading: false,
      progress: 0,
      error: null,
      url: null,
    });
  };

  // Mark files as submitted (prevents cleanup)
  const markAsSubmitted = () => {
    isSubmittedRef.current = true;
    uploadedFilesRef.current.clear();
  };

  // Explicitly delete a file by URL
  const deleteFileByUrl = async (fileUrl: string): Promise<boolean> => {
    try {
      const urlParts = fileUrl.split('/');
      const filePath = urlParts[urlParts.length - 1];
      return await deleteFile(filePath);
    } catch (error) {
      console.error('Delete by URL error:', error);
      return false;
    }
  };

  // Force cleanup of current files (call this on form cancel or explicit cleanup)
  const cleanupCurrentFiles = async () => {
    if (uploadedFilesRef.current.size > 0) {
      const filesToCleanup = Array.from(uploadedFilesRef.current);
      await cleanupFiles(filesToCleanup);
      uploadedFilesRef.current.clear();
    }
  };

  // Cleanup specific file and remove from tracking
  const cleanupSpecificFile = async (fileUrl: string) => {
    const success = await deleteFileByUrl(fileUrl);
    if (success) {
      // Extract file path and remove from tracking
      const urlParts = fileUrl.split('/');
      const filePath = urlParts[urlParts.length - 1];
      uploadedFilesRef.current.delete(filePath);
    }
    return success;
  };

  return {
    uploadFile,
    deleteFile,
    deleteFileByUrl,
    resetUploadState,
    markAsSubmitted,
    cleanupCurrentFiles,
    cleanupSpecificFile,
    ...uploadState,
  };
}
