"use client";

import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ChatDocumentation } from "@/types/chat-documentation";
import { Documentation } from "@/types/documentation";
import { useState, useEffect, useRef } from "react";
import { DocumentationSearchDialog } from "./documentation-search-dialog";
import { X } from "lucide-react";

interface ChatPromptProps {
  documentations: Documentation[];
  initialSelectedDocs?: ChatDocumentation[];
  onSubmit: (message: string, selectedDocs: Documentation[]) => Promise<void>;
  isLoading?: boolean;
}

export function ChatPrompt({ initialSelectedDocs, documentations, onSubmit, isLoading = false }: ChatPromptProps) {
  const [availableDocs] = useState<Documentation[]>(documentations);
  const [selectedDocumentations, setSelectedDocumentation] = useState<Documentation[]>([]);
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Convert initialSelectedDocs to Documentation[] when component mounts or initialSelectedDocs changes
  useEffect(() => {
    if (initialSelectedDocs && initialSelectedDocs.length > 0) {
      // Map the initialSelectedDocs to Documentation objects by finding matching documentation_id
      const selected = initialSelectedDocs
        .map((chatDoc) => availableDocs.find((doc) => doc.id === chatDoc.documentation_id))
        .filter((doc): doc is Documentation => doc !== undefined);

      setSelectedDocumentation(selected);
    } else {
      setSelectedDocumentation([]);
    }
  }, [initialSelectedDocs, availableDocs]);

  // Focus textarea for new chat
  useEffect(() => {
    if (!initialSelectedDocs || initialSelectedDocs.length === 0) {
      textareaRef.current?.focus();
    }
  }, [initialSelectedDocs]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (but not Shift+Enter)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleAddDocumentation = (doc: Documentation) => {
    if (!selectedDocumentations.some((selected) => selected.id === doc.id)) {
      setSelectedDocumentation([...selectedDocumentations, doc]);
    }
  };

  const handleRemoveDocumentation = (docId: string) => {
    setSelectedDocumentation(selectedDocumentations.filter((doc) => doc.id !== docId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    // Blur (unfocus) the textarea to prevent highlighting
    textareaRef.current?.blur();

    const currentPrompt = prompt;
    setPrompt("");

    try {
      // Call the parent component's onSubmit function
      await onSubmit(currentPrompt, selectedDocumentations);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected documentation chips */}
      {selectedDocumentations.length > 0 && (
        <div className="flex flex-wrap gap-2 mx-auto max-w-3xl">
          {selectedDocumentations.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
              <span className="truncate max-w-xs">{doc.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-5 w-5 p-0 text-secondary-foreground/70 hover:text-secondary-foreground"
                onClick={() => handleRemoveDocumentation(doc.id)}
                disabled={isLoading}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative mx-auto max-w-3xl">
        <Textarea
          className="resize-none p-4 pr-24 max-h-48"
          name="prompt"
          placeholder="Ask anything"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={textareaRef}
          disabled={isLoading}
        />
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          <DocumentationSearchDialog
            documentations={availableDocs}
            selectedDocumentations={selectedDocumentations}
            onSelectDocumentation={handleAddDocumentation}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !prompt.trim()} className="rounded-full h-8 w-8">
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
