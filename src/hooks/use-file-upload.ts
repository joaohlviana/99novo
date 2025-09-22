import { useState, useCallback, useRef } from 'react';

interface FileWithPreview {
  id: string;
  file: File;
  preview: string;
}

interface UseFileUploadOptions {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
}

interface UseFileUploadReturn {
  files: FileWithPreview[];
  isDragging: boolean;
  errors: string[];
}

interface UseFileUploadActions {
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  openFileDialog: () => void;
  removeFile: (id: string) => void;
  getInputProps: () => {
    type: 'file';
    accept: string;
    multiple: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    ref: React.RefObject<HTMLInputElement>;
  };
}

export function useFileUpload(options: UseFileUploadOptions = {}): [UseFileUploadReturn, UseFileUploadActions] {
  const {
    accept = '*/*',
    maxSize = 2 * 1024 * 1024, // 2MB
    maxFiles = 1,
    multiple = false,
  } = options;

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      const sizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      return `Arquivo muito grande. Máximo ${sizeMB}MB.`;
    }

    // Check file type if accept is specified
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(type.replace('*', '.*'));
      });

      if (!isAccepted) {
        return 'Tipo de arquivo não suportado.';
      }
    }

    return null;
  }, [accept, maxSize]);

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: FileWithPreview[] = [];
    const newErrors: string[] = [];

    Array.from(fileList).forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
        return;
      }

      if (files.length + newFiles.length >= maxFiles) {
        newErrors.push(`Máximo ${maxFiles} arquivo(s) permitido(s).`);
        return;
      }

      const id = Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);
      
      newFiles.push({
        id,
        file,
        preview,
      });
    });

    if (newFiles.length > 0) {
      setFiles(prevFiles => {
        // Remove old files if maxFiles is 1
        if (maxFiles === 1) {
          prevFiles.forEach(prevFile => URL.revokeObjectURL(prevFile.preview));
          return newFiles;
        }
        return [...prevFiles, ...newFiles];
      });
    }

    setErrors(newErrors);
  }, [files.length, maxFiles, validateFile]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [processFiles]);

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prevFiles => {
      const fileToRemove = prevFiles.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prevFiles.filter(f => f.id !== id);
    });
    setErrors([]);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input value to allow same file selection
    e.target.value = '';
  }, [processFiles]);

  const getInputProps = useCallback(() => ({
    type: 'file' as const,
    accept,
    multiple: multiple || maxFiles > 1,
    onChange: handleInputChange,
    ref: inputRef,
  }), [accept, maxFiles, multiple, handleInputChange]);

  return [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ];
}