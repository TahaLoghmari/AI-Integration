import { Plugin } from "@opencode/plugin/tui"
import type { PanelInput } from "@opencode/plugin/tui/context"
import { createSignal, For, Show } from "solid-js"
import { buildReport, type Group } from "./report"
import { load, payload } from "./load"

export default Plugin.define({
  id: "project.context.tui",
  setup(context) {
    const [report, setReport] = createSignal<Group[]>([])
    let request = 0
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
          <box paddingLeft={1} paddingRight={1} paddingTop={1} paddingBottom={1} flexDirection="row" justifyContent="space-between">
            <text fg={context.theme.text.base}><b>Context</b></text>
            <text fg={context.theme.text.muted}>Esc to close</text>
          </box>
          <scrollbox focused={props.panel.focused} flexGrow={1} width="100%">
            <box paddingLeft={1} paddingRight={1} paddingBottom={1} flexDirection="column">
              <For each={report()}>{(group) => (
                <box paddingBottom={1} width="100%" flexDirection="column">
                  <Show when={group.title}>
                    <text fg={context.theme.text.base} wrapMode="word"><b>{group.title}</b></text>
                  </Show>
                  <Show when={group.note}>
                    <text fg={context.theme.text.muted} wrapMode="word">{group.note}</text>
                  </Show>
                  <For each={group.sections}>{(section) => (
                    <box paddingTop={1} paddingLeft={1} width="100%" flexDirection="column">
                      <text fg={context.theme.text.base} wrapMode="word">
                        <b>{section.title}</b>{section.count === undefined ? "" : ` (${section.count})`}
                      </text>
                      <For each={section.rows}>{(row) => (
                        <box width="100%" flexDirection="column">
                          <Show when={row.value !== undefined} fallback={
                            <text fg={context.theme.text.base} wrapMode="word">{row.label}</text>
                          }>
                            <box flexDirection="row" width="100%">
                              <text fg={context.theme.text.muted} width={14} flexShrink={0}>{row.label}</text>
                              <text fg={context.theme.text.base} flexGrow={1} flexShrink={1} minWidth={0} wrapMode="word">{row.value}</text>
                            </box>
                          </Show>
                          <Show when={row.detail}>
                            <box paddingLeft={2} paddingBottom={1} width="100%" flexDirection="column">
                              <text fg={context.theme.text.muted} wrapMode="word">{row.detail}</text>
                            </box>
                          </Show>
                        </box>
                      )}</For>
                      <Show when={section.note}>
                        <text fg={context.theme.text.muted} wrapMode="word">{section.note}</text>
                      </Show>
                    </box>
                  )}</For>
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
      const current = ++request
      setReport([{ title: "Loading", note: "Gathering session details…", sections: [] }])
      context.ui.panel.open("project.context.report")
      try {
        const session = payload(await context.client.session.get({ sessionID }))
        const location = session.location
        const [models, agents, skills, references, servers, plugins, commands, resources] = await Promise.all([
          load(() => context.client.model.list({ location })),
          load(() => context.client.agent.list({ location })),
          load(() => context.client.skill.list({ location })),
          load(() => context.client.reference.list({ location })),
          load(() => context.client.mcp.list({ location })),
          load(() => context.client.plugin.list({ location })),
          load(() => context.client.command.list({ location })),
          load(() => context.client.mcp.resource.catalog({ location })),
          context.data.session.message.sync(sessionID).catch(() => {}),
        ])
        if (current !== request) return
        const messages = context.data.session.message.list(sessionID) ?? []
        const last = [...messages].reverse().find((message) => message.type === "assistant" && message.tokens)
        const usage = last?.type === "assistant" ? last.tokens : undefined
        setReport(buildReport({ session, usage, models, agents, skills, references, servers, plugins, commands, resources }))
      } catch (error) {
        if (current !== request) return
        setReport([{ title: "Could not load session", note: `${String(error)}\nReopen /context to retry.`, sections: [] }])
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
