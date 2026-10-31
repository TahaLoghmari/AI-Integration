import { Plugin } from "@opencode/plugin"
import { ContextReport } from "./rpc"

export default Plugin.define({
  id: "project.context",
  async setup(ctx) {
    // Keep only sizes and source names in memory, not the request text itself.
    const snapshots = new Map<string, object>()
    await ctx.session.hook("context", (event) => {
      try {
        const sources: { name: string; characters: number }[] = []
        for (const part of event.system) {
          const instructions = part.metadata?.experimental?.instructions
          if (Array.isArray(instructions)) {
            for (const source of instructions) {
              if (typeof source.key === "string" && typeof source.text === "string") {
                sources.push({ name: source.key, characters: source.text.length })
              }
            }
          }
        }
        snapshots.set(event.sessionID, {
          capturedAt: Date.now(),
          model: event.model,
          systemCharacters: event.system.reduce((total, part) => total + (typeof part.text === "string" ? part.text.length : 0), 0),
          messageCharacters: JSON.stringify(event.messages).length,
          toolCharacters: JSON.stringify(event.tools).length,
          tools: Object.keys(event.tools),
          sources,
        })
      } catch {
        // A reporting failure must never prevent the model request.
        snapshots.delete(event.sessionID)
      }
    })
    await ctx.rpc.register(ContextReport, {
      snapshot: async (input) => snapshots.get((input as { sessionID: string }).sessionID) ?? {},
    })
  },
})
