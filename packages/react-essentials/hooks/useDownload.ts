import { useCallback, useMemo } from "react";

interface UseDownloadProps {
  filename: string;
  content: string;
  type?: string;
}

export function useDownload({
  filename,
  content,
  type = "text/plain",
}: UseDownloadProps) {
  const blob = useMemo(() => new Blob([content], { type }), [content, type]);
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);

  const download = useCallback(() => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;

    anchor.click();

    URL.revokeObjectURL(url);
  }, [filename, url]);

  return {
    blob,
    url,
    download,
  };
}
