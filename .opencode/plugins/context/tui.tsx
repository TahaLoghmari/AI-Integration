import { Plugin } from "@opencode/plugin/tui"
import type { PanelInput } from "@opencode/plugin/tui/context"
import { createSignal, For, Show } from "solid-js"
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
type Section = { title: string; lines: string[]; note?: string }
const list = (items: string[]) => items.length ? items : ["None available"]

export default Plugin.define({
  id: "project.context.tui",
  setup(context) {
    const [report, setReport] = createSignal<Section[]>([{ title: "Loading", lines: ["Gathering context…"] }])
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
        <box height="100%" width="100%" flexDirection="column">
          <box paddingLeft={1} paddingRight={1} paddingTop={1} paddingBottom={1}>
            <text fg={context.theme.text.base}><b>Context</b></text>
            <text fg={context.theme.text.muted}>Esc to close</text>
          </box>
          <scrollbox focused={props.panel.focused} flexGrow={1} width="100%">
            <box paddingLeft={1} paddingRight={1} paddingBottom={1}>
              <For each={report()}>{(section) => (
                <box paddingBottom={1} width="100%">
                  <text fg={context.theme.text.base} wrapMode="word"><b>{section.title}</b></text>
                  <For each={section.lines}>{(line) => (
                    <text fg={context.theme.text.base} wrapMode="char">{line}</text>
                  )}</For>
                  <Show when={section.note}>
                    <text fg={context.theme.text.muted} wrapMode="word">{section.note}</text>
                  </Show>
                </box>
              )}</For>
            </box>
          </scrollbox>
        </box>
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
      setReport([{ title: "Loading", lines: ["Gathering context…"] }])
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
          {
            title: "Last request",
            lines: snapshot.capturedAt ? [
              `${estimate(system + conversation + tools)} estimated tokens`,
              ...(limit ? [`${number(limit)} token context limit`, `[${"■".repeat(blocks)}${"·".repeat(20 - blocks)}] ${number(estimated / limit * 100)}%`] : []),
              snapshot.model ? `${snapshot.model.providerID}/${snapshot.model.id}` : "Model unavailable",
            ] : ["No request captured yet.", "Send a message, then reopen this report."],
            note: snapshot.capturedAt ? `Captured at ${new Date(snapshot.capturedAt).toLocaleTimeString()}. Later hooks may change the request.` : undefined,
          },
          {
            title: "Provider-reported usage",
            lines: usage ? [
              `Input       ${number(usage.input)}`,
              `Output      ${number(usage.output)}`,
              `Cache read  ${number(usage.cache.read)}`,
              `Cache write ${number(usage.cache.write)}`,
            ] : ["Not available"],
            note: "Latest assistant message. Provider input and cache accounting may overlap or differ.",
          },
          {
            title: "Estimated breakdown",
            lines: snapshot.capturedAt ? [
              `System text      ${estimate(system)}`,
              `Conversation     ${estimate(conversation)}`,
              `Tool definitions ${estimate(tools)}`,
            ] : ["Not captured"],
            note: "Roughly 4 characters per token; conversation and tools use serialized data. Multimodal content is not measured.",
          },
          {
            title: "Instruction sources",
            lines: list((snapshot.sources ?? []).map((source) => `${estimate(source.characters)}  ${source.name}`)),
            note: "Estimated tokens within system text. Experimental metadata may omit instruction or memory sources.",
          },
          { title: "Tools in last request", lines: list(snapshot.tools ?? []) },
          {
            title: "Available agents",
            lines: list(agents.filter((agent) => !agent.hidden).map((agent) => `${agent.id} (${agent.mode})`)),
            note: "Available does not mean included in the request.",
          },
          {
            title: "Available skills",
            lines: list(skills.map((skill) => skill.id)),
            note: "Available does not mean loaded.",
          },
          { title: "References", lines: list(references.flatMap((reference) => [reference.name, `  ${reference.path}`])) },
          { title: "MCP servers", lines: list(servers.map((server) => `${server.name} (${server.status.status})`)) },
          { title: "Server plugins", lines: list(plugins.data.map((plugin) => plugin.id ?? "(unnamed)")) },
        ])
      } catch (error) {
        setReport([{ title: "Could not load context", lines: [String(error)] }])
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
