import React from "react";

export function useEvidenciasAttachmentsForm() {
  const [attachments, setAttachments] = React.useState<File[]>([]);

  const addAttachment = (newFile: File[]) => {
    setAttachments((current) => [...current, ...newFile]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const resetAttachments = () => {
    setAttachments([])
  }

  return {
    attachments,
    addAttachment,
    removeAttachment,
    resetAttachments
  };
}