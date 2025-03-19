"use client";

import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

export function PromptForm() {
  return (
    <form>
      <Textarea className="resize-none p-4 mx-auto max-w-3xl max-h-64" name="prompt" placeholder="Ask anything" />
      <Button type="submit"></Button>
    </form>
  );
}
