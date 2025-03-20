"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Documentation } from "@/types/documentation";
import { Plus, Search, Check } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";

interface DocumentationSearchDialogProps {
  documentations: Documentation[];
  selectedDocumentations: Documentation[];
  onSelectDocumentation: (doc: Documentation) => void;
  disabled?: boolean;
}

export function DocumentationSearchDialog({
  documentations,
  selectedDocumentations,
  onSelectDocumentation,
  disabled = false,
}: DocumentationSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDocs, setFilteredDocs] = useState<Documentation[]>(documentations);
  const [isOpen, setIsOpen] = useState(false);

  // Filter documentations based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDocs(documentations);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = documentations.filter((doc) => doc.name.toLowerCase().includes(lowercaseSearch));
      setFilteredDocs(filtered);
    }
  }, [searchTerm, documentations]);

  // Check if a documentation is already selected
  const isSelected = (doc: Documentation) => {
    return selectedDocumentations.some((selected) => selected.id === doc.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full" disabled={disabled}>
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Documentation</DialogTitle>
        </DialogHeader>
        <DialogDescription>Search and add documentation to your message</DialogDescription>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search documentation..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredDocs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No documentation found</p>
          ) : (
            <ul className="space-y-2">
              {filteredDocs.map((doc) => (
                <li key={doc.id}>
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => {
                      onSelectDocumentation(doc);
                      setIsOpen(false);
                    }}
                    disabled={isSelected(doc)}>
                    <span className="truncate">{doc.name}</span>
                    {isSelected(doc) && <Check className="h-4 w-4 ml-2 text-green-500" />}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
