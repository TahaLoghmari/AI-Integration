import { Plugin } from "@opencode/plugin/tui"
import type { PanelInput } from "@opencode/plugin/tui/context"
import { createSignal, Show } from "solid-js"
import { ContextReport } from "./rpc"

type Snapshot = {
  capturedAt?: number
  model?: { providerID: string; id: string }
  systemCharacters?: number
  messageCharacters?: number
  toolCharacters?: number
  tools?: string[]
  sources?: { name: string; characters: number }[]
}

const number = (value: number) => Math.round(value).toLocaleString()
const estimate = (characters: number) => `~${number(characters / 4)}`
const list = (items: string[]) => items.length ? items.map((item) => `  ${item}`).join("\n") : "  None available"

export default Plugin.define({
  id: "project.context.tui",
  setup(context) {
    const [report, setReport] = createSignal("Loading context report…")
    function ReportPanel(props: { panel: PanelInput }) {
      context.keymap.layer(() => ({
        commands: [{
          id: "project.context.close",
          bind: "escape",
          enabled: () => props.panel.focused,
          run: props.panel.close,
        }],
      }))
      return (
        <scrollbox focused={props.panel.focused} height="100%" width="100%">
          <box paddingLeft={1} paddingRight={1} paddingTop={1}>
            <text fg={context.theme.text.base}>{report()}</text>
          </box>
        </scrollbox>
      )
    }
    const unregister = context.ui.slot({
      append: "session.panel",
      render: (panel) => (
        <Show when={panel.name === "project.context.report"}>
          <ReportPanel panel={panel} />
        </Show>
      ),
    })

    async function open() {
      const route = context.ui.router.current()
      if (route.type !== "session") {
        context.ui.toast.show({ title: "Context report", message: "Open a session first.", variant: "error" })
        return
      }
      const sessionID = route.sessionID
      const location = context.location ?? context.data.location.default()
      const data = context.data.location
      setReport("Loading context report…")
      context.ui.panel.open("project.context.report")
      try {
        await Promise.all([
          data.agent.sync(location), data.skill.sync(location), data.reference.sync(location),
          data.mcp.server.sync(location), data.model.sync(location),
          context.data.session.sync(sessionID), context.data.session.message.sync(sessionID),
        ])
        const [plugins, snapshot] = await Promise.all([
          context.client.plugin.list({ location }),
          context.client.rpc(ContextReport).snapshot({ sessionID }, { location }) as Promise<Snapshot>,
        ])
        const messages = context.data.session.message.list(sessionID) ?? []
        const last = [...messages].reverse().find((message) => message.type === "assistant" && message.tokens)
        const usage = last?.type === "assistant" ? last.tokens : undefined
        const models = data.model.list(location) ?? []
        const model = models.find((item) => item.id === snapshot.model?.id && item.providerID === snapshot.model?.providerID)
        const system = snapshot.systemCharacters ?? 0
        const conversation = snapshot.messageCharacters ?? 0
        const tools = snapshot.toolCharacters ?? 0
        const estimated = (system + conversation + tools) / 4
        const limit = model?.limit.context
        const blocks = limit ? Math.max(0, Math.min(20, Math.round(estimated / limit * 20))) : 0
        const agents = data.agent.list(location) ?? []
        const skills = data.skill.list(location) ?? []
        const references = data.reference.list(location) ?? []
        const servers = data.mcp.server.list(location) ?? []
        setReport([
          "Context report · Esc to close",
          "════════════════════════════════════════",
          snapshot.capturedAt ? `Last request snapshot · ${new Date(snapshot.capturedAt).toLocaleTimeString()}` : "No request captured yet. Send a message, then reopen this report.",
          snapshot.model ? `Model  ${snapshot.model.providerID}/${snapshot.model.id}` : "Model  unavailable",
          snapshot.capturedAt ? `Estimated request  ${estimate(system + conversation + tools)} tokens${limit ? ` / ${number(limit)} context limit` : ""}` : "Estimated request  unavailable",
          limit && snapshot.capturedAt ? `[${"■".repeat(blocks)}${"·".repeat(20 - blocks)}]  ${number(estimated / limit * 100)}% estimated` : "",
          "",
          "Last assistant usage (provider reported)",
          usage ? `  Input ${number(usage.input)}  ·  output ${number(usage.output)}\n  Cache read ${number(usage.cache.read)}  ·  cache write ${number(usage.cache.write)}` : "  Not available",
          "  Provider input and cache accounting may overlap or differ.",
          "",
          "Request breakdown · rough estimates",
          snapshot.capturedAt ? `  System text       ${estimate(system)} tokens\n  Conversation      ${estimate(conversation)} tokens\n  Tool definitions  ${estimate(tools)} tokens` : "  Not captured",
          "  Heuristic: 4 characters per token; conversation and tools use",
          "  serialized request data. Multimodal content is not measured.",
          "",
          "Instruction sources · estimated tokens",
          list((snapshot.sources ?? []).map((source) => `${estimate(source.characters).padStart(8)}  ${source.name}`)),
          "  Experimental source metadata; may not include every instruction",
          "  or memory source. Sources are part of system text, not extra.",
          "",
          "Tools in last captured request",
          list(snapshot.tools ?? []),
          "",
          "Available agents · not necessarily in the request",
          list(agents.filter((agent) => !agent.hidden).map((agent) => `${agent.id} (${agent.mode})`)),
          "",
          "Available skills · not necessarily loaded",
          list(skills.map((skill) => `${skill.id}  ${skill.path}`)),
          "",
          "References",
          list(references.map((reference) => `${reference.name}  ${reference.path}`)),
          "",
          "MCP servers",
          list(servers.map((server) => `${server.name} (${server.status.status})`)),
          "",
          "Server plugins",
          list(plugins.data.map((plugin) => plugin.id ?? "(unnamed)")),
          "",
          "Snapshot reflects the last observed request, not a prediction of the",
          "next request. Later plugin hooks may change the outgoing request.",
        ].filter((line) => line !== undefined).join("\n"))
      } catch (error) {
        setReport(`Context report could not load.\n\n${String(error)}`)
      }
    }

    context.keymap.layer(() => ({
      mode: "global",
      commands: [
        { id: "project.context.show", title: "Show context alongside chat", palette: true, slash: { name: "context" }, run: () => open() },
      ],
    }))
    return unregister
  },
})
