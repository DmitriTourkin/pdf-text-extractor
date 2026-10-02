import { useRef } from "react";
import { useFileDrop } from "../model/useFileDrop";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
}

export function DropZone({ onFiles }: DropZoneProps ) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDragging, dragHandlers } = useFileDrop({ onFiles });

  return (
    <div
      {...dragHandlers}
      onClick={() => inputRef.current?.click()}
    >
      <input
      ref={inputRef}
      type="file"
      accept="application/pdf"
      hidden
      onChange={(e) => {
        onFiles(Array.from(e.target.files ?? []));
        e.target.value = ''
      }}/>
      {isDragging ? 'Отпустите файл': 'Перетащите PDF сюда или нажмите для выбора'}
    </div>
  );
}