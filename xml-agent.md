## 1. **Claude XML Structure and Optimization**

**Claude interprets XML tags as strong semantic boundaries**: instructions, context, data, format, examples, and answer sections are best separated and referenced in instructions for deterministic, reliable behavior.[^1][^2]

**Best-practices for Claude XML:**

```
- Use shallow, closed, consistent tags like `<instructions>`, `<data>`, `<examples>`, `<format>`, and `<answer>`.
```

- Reference tag names explicitly in your instructions for improved focus.
- Canonical schema template (recommended for conversion):

```xml
<prompt>
  <role>Expert assistant for the specified domain</role>
  <context><!-- domain background, audience, constraints --></context>
  <data><!-- raw inputs or references inserted here --></data>
  <instructions>
    <!-- numbered, action-oriented steps -->
    <!-- explicitly reference tags: context, data, examples, format -->
  </instructions>
  <examples>
    <example>
      <input/>
      <output/>
    </example>
  </examples>
  <format/>
  <answer/>
</prompt>
```

- Anthropic’s guides strongly recommend this tag discipline for reliable task execution.[^2][^3][^1]

***

## 2. **How to Build an XML Conversion Agent (System Prompt for Gemini)**

### **System Prompt Example for Gemini**

```text
System:
Convert plain task descriptions into a Claude-optimized XML prompt using the schema:
<prompt><role/><context/><data/><instructions/><examples/><format/><answer/></prompt>.
- Preserve all relevant content, move raw artifacts into <data>, and normalize directives into numbered <instructions>.
- Keep nesting shallow and close all tags.
- Output only the final <prompt> block, nothing else.

User:
<draft>
{USER_PLAIN_TEXT}
</draft>

Requirements:
- If the draft lacks examples, omit <examples>.
- If a target format is implied, specify it in <format>.
- Ensure <answer> is an empty container for Claude to fill.
```


***

## 3. **Vercel AI SDK Agent Architecture for Gemini**

**Agent = LLM + tools (optional, e.g. validation) + loop (step control + feedback)**

### **Agent Class Example (backend):**

```ts
import { Experimental_Agent as Agent } from 'ai';
import { google } from '@ai-sdk/google';

const xmlAgent = new Agent({
  model: google('gemini-2.5-pro'), // Or 'gemini-2.5-flash'
  temperature: 0,
  maxOutputTokens: 2048,
  system: `(see above system prompt template)`,
  // tools: { ...optionally XML validator tool... },
  // stopWhen: stepCountIs(1), // For single-step; set higher for feedback loop
});
```

- [Agent docs: overview, core, agent class, loop-control][^4][^5]

***

## 4. **API Route (Next.js, Streaming with AI SDK)**

```ts
// app/api/convert/route.ts
import { validateUIMessages } from 'ai';
import { xmlAgent } from '@/agent/xmlAgent';

export async function POST(req: Request) {
  const { messages } = await req.json();
  return xmlAgent.respond({
    messages: await validateUIMessages({ messages }),
  });
}
```


***

## 5. **Frontend with AI SDK + shadcn/ui Elements**

```tsx
'use client';
import { useCompletion } from '@ai-sdk/react';
import { useState } from 'react';

export default function Page() {
  const [input, setInput] = useState('');
  const { completion, complete, isLoading } = useCompletion({ api: '/api/convert' });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await complete(JSON.stringify([{ role: 'user', content: input }]));
      }}
    >
      <textarea value={input} onChange={e => setInput(e.target.value)} />
      <button type="submit" disabled={isLoading}>Convert</button>
      <pre>{completion}</pre>
    </form>
  );
}
```

- Enhance with shadcn/ui and AI Elements for polished chat/conversation rendering.[^6][^7]

***

## 6. **Workflow Patterns for Robust Agents**

*(from agents/workflows, overview, core)*

- **Sequential**: Normalize → validate → repair.
- **Feedback/Evaluation Loop**: Retry if agent output fails schema/quality check.
- **Routing**: Switch between multiple schemas/processing branches according to input.
- **Parallel**: Process prompt/enrichment/examples concurrently.
- **Orchestration**: Main agent assigns subtasks (XML normalization, validation, enrichment) to specialist workers.
- **Tool usage**: Add custom tools for XML schema validation or enrichment via SDK.[^5][^4]

***

## 7. **Settings \& Parameters (SDK Core)**

- **temperature: 0** for deterministic conversion.
- **maxOutputTokens** to avoid useless verbosity.
- **abortSignal** for canceling requests in UI.
- **seed, maxRetries** for reproducibility, error tolerance.
- **stopSequences** to end output at the right tag/block.

***

## 8. **Reference Links \& Docs Used**

- **Claude docs, XML tags, prompt engineering best practices**[^3][^1][^2]
- **AI SDK**: [agents overview], [agent/workflows], [core settings], [prompt engineering], [tool calling], [google generative AI provider], [Next.js app router], [streaming], [UI](https://ai-sdk.dev/docs/ai-sdk-ui)[^4][^5]

***

### **Sample Full Agent Workflow for Claude XML Conversion (with feedback loops and validation)**

```ts
import { Experimental_Agent as Agent, tool, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Optional: XML validator tool
const xmlValidator = tool({
  description: 'Validates Claude XML prompt structure',
  parameters: z.object({ xml: z.string() }),
  execute: async ({ xml }) => {
    // Insert validation logic...
    return { valid: true, errors: [] };
  }
});

const xmlAgent = new Agent({
  model: google('gemini-2.5-flash'),
  temperature: 0,
  maxOutputTokens: 2048,
  system: `(system prompt as above)`,
  tools: { xmlValidator },
  stopWhen: stepCountIs(3), // 1: conversion, 2: validation, 3: repair (if needed)
});
```


***

```
<div style="text-align: center">⁂</div>
```

[^1]: https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags

[^2]: https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview

[^3]: https://www.vellum.ai/blog/prompt-engineering-tips-for-claude

[^4]: https://ai-sdk.dev/docs/agents/overview

[^5]: https://ai-sdk.dev/docs/agents/workflows

[^6]: https://github.com/vercel/ai-elements

[^7]: https://ai-sdk.dev/cookbook/next/stream-text

