import { Plugin } from "@opencode/plugin/tui"
import type { PanelInput } from "@opencode/plugin/tui/context"
import { createSignal, For, Show } from "solid-js"

const number = (value: number) => Math.round(value).toLocaleString()
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
          data.mcp.server.sync(location), context.data.session.message.sync(sessionID),
        ])
        const plugins = await context.client.plugin.list({ location })
        const messages = context.data.session.message.list(sessionID) ?? []
        const last = [...messages].reverse().find((message) => message.type === "assistant" && message.tokens)
        const usage = last?.type === "assistant" ? last.tokens : undefined
        const agents = data.agent.list(location) ?? []
        const skills = data.skill.list(location) ?? []
        const references = data.reference.list(location) ?? []
        const servers = data.mcp.server.list(location) ?? []
        setReport([
          {
            title: "Provider-reported usage",
            lines: usage ? [
              `Input       ${number(usage.input)}`,
              `Output      ${number(usage.output)}`,
              `Cache read  ${number(usage.cache.read)}`,
              `Cache write ${number(usage.cache.write)}`,
            ] : ["Not available"],
          },
          {
            title: "Available agents",
            lines: list(agents.filter((agent) => !agent.hidden).map((agent) => `${agent.id} (${agent.mode})`)),
          },
          {
            title: "Available skills",
            lines: list(skills.map((skill) => skill.id)),
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
