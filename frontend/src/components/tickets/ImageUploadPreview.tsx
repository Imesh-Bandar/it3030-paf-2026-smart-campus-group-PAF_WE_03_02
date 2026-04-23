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
      className="ticket-upload-zone"
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
      <label htmlFor="ticket-files">Drop images here or choose files</label>
      <div className="ticket-upload-grid">
        {files.map((file) => (
          <figure key={`${file.name}-${file.lastModified}`}>
            <img src={URL.createObjectURL(file)} alt={file.name} />
            <figcaption>{file.name}</figcaption>
            <button
              type="button"
              className="icon-button"
              onClick={() => onFilesChange(files.filter((item) => item !== file))}
              aria-label={`Remove ${file.name}`}
            >
              x
            </button>
          </figure>
        ))}
      </div>
    </div>
  );
}
