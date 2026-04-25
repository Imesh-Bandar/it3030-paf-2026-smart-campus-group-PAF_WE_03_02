import { useEffect, useState } from 'react';

type Props = {
  files: File[];
  onFilesChange: (files: File[]) => void;
};

export function ImageUploadPreview({ files, onFilesChange }: Props) {
  const addFiles = (nextFiles: FileList | null) => {
    if (!nextFiles) return;
    const images = Array.from(nextFiles)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, 3 - files.length);
    onFilesChange([...files, ...images].slice(0, 3));
  };

  return (
    <div
      className="ticket-upload-zone ticket-upload-zone-enhanced"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        addFiles(event.dataTransfer.files);
      }}
    >
      <input
        id="ticket-files"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        onChange={(event) => addFiles(event.target.files)}
      />
      <label htmlFor="ticket-files" className="ticket-upload-drop" role="button" tabIndex={0}>
        <span className="ticket-upload-title">Drop images here or choose files</span>
        <span className="ticket-upload-meta">
          Up to 3 files, each 5MB max (JPG, PNG, WEBP, GIF)
        </span>
      </label>
      {files.length >= 3 && <p className="ticket-upload-warning">Maximum 3 images reached.</p>}
      <div className="ticket-upload-grid">
        {files.map((file, index) => (
          <ImagePreviewItem
            file={file}
            key={`${file.name}-${file.lastModified}-${file.size}-${index}`}
            onRemove={() => onFilesChange(files.filter((item) => item !== file))}
          />
        ))}
      </div>
    </div>
  );
}

type ImagePreviewItemProps = {
  file: File;
  onRemove: () => void;
};

function ImagePreviewItem({ file, onRemove }: ImagePreviewItemProps) {
  const [url] = useState(() => URL.createObjectURL(file));

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <figure>
      <img src={url} alt={file.name} />
      <figcaption>{file.name}</figcaption>
      <button
        type="button"
        className="ticket-upload-remove"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
      >
        Remove
      </button>
    </figure>
  );
}
