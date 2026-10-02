import { useRef, useState } from 'react';
import type { DragEvent } from 'react';

interface Options {
  onFiles: (files: File[]) => void;
}

export function useFileDrop({ onFiles }: Options) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const onDragEnter = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const onDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
  };

  const onDragLeave = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    onFiles(Array.from(e.dataTransfer.files));
  };

  return {
    isDragging,
    dragHandlers: { onDragEnter, onDragOver, onDragLeave, onDrop },
  };
}