import { Rpc } from "@opencode/plugin/rpc"

export const ContextReport = Rpc.define({
  id: "project.context.report",
  methods: {
    snapshot: {
      input: {
        type: "object",
        properties: { sessionID: { type: "string" } },
        required: ["sessionID"],
        additionalProperties: false,
      },
      output: { type: "object", additionalProperties: true },
      errors: {},
    },
  },
  events: {},
})
