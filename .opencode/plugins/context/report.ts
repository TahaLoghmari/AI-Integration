export type Row = { label: string; value?: string; detail?: string }
export type Section = { title: string; rows: Row[]; note?: string; count?: number }
export type Group = { title?: string; sections: Section[]; note?: string }

type Rule = { action: string; resource: string; effect: string }
type Usage = { input: number; output: number; cache: { read: number; write: number } }
export type ReportData = {
  session: { agent?: string; model?: { id: string; providerID: string; variant?: string }; cost: number }
  usage?: Usage
  models?: readonly { id: string; providerID: string; limit: { context: number } }[]
  agents?: readonly { id: string; mode: string; hidden: boolean; permissions: readonly Rule[] }[]
  skills?: readonly { id: string }[]
  references?: readonly { name: string; path: string }[]
  servers?: readonly { name: string; status: { status: string } }[]
  plugins?: readonly { id?: string }[]
  commands?: readonly { name: string; description?: string }[]
  resources?: { resources: readonly { name: string; server: string; uri: string }[]; templates: readonly { name: string; server: string; uriTemplate: string }[] }
}

const number = (value: number) => Math.round(value).toLocaleString()
const money = (value: number) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 6,
}).format(value)

function catalog(title: string, rows: Row[] | undefined, empty: string): Section {
  return {
    title, rows: rows ?? [], count: rows?.length,
    note: rows === undefined ? "Could not load. Reopen /context to retry." : rows.length ? undefined : empty,
  }
}

const rules = (values: readonly Rule[] | undefined) => values?.map((rule) => ({
  label: `${rule.effect} ${rule.action}`, detail: rule.resource,
}))

export function buildReport(data: ReportData): Group[] {
  const { session, usage } = data
  const model = data.models?.find((model) => model.id === session.model?.id && model.providerID === session.model.providerID)
  const agent = data.agents?.find((agent) => agent.id === session.agent)
  return [
    {
      title: "Session",
      sections: [
        {
          title: "Agent and model",
          rows: [
            { label: "Agent", value: session.agent ?? "Not set" },
            { label: "Model", value: session.model ? `${session.model.providerID}/${session.model.id}` : "Not set" },
            ...(session.model?.variant ? [{ label: "Variant", value: session.model.variant }] : []),
            { label: "Context limit", value: model ? `${number(model.limit.context)} tokens` : "Not available" },
            { label: "Session cost", value: `${money(session.cost)} USD` },
          ],
        },
        {
          title: "Provider-reported usage",
          rows: usage ? [
            { label: "Input", value: number(usage.input) },
            { label: "Output", value: number(usage.output) },
            { label: "Cache read", value: number(usage.cache.read) },
            { label: "Cache write", value: number(usage.cache.write) },
          ] : [],
          note: usage ? undefined : "No recorded assistant usage yet.",
        },
      ],
    },
    {
      sections: [
        catalog("Commands", data.commands?.map((command) => ({ label: `/${command.name}`, detail: command.description })), "No custom commands available."),
        catalog("Agents", data.agents?.filter((agent) => !agent.hidden).map((agent) => ({ label: agent.id, detail: agent.mode })), "No agents available."),
        catalog("Skills", data.skills?.map((skill) => ({ label: skill.id })), "No skills available."),
        catalog("References", data.references?.map((reference) => ({ label: reference.name, detail: reference.path })), "No references configured."),
        catalog("MCP servers", data.servers?.map((server) => ({ label: server.name, detail: server.status.status })), "No MCP servers configured."),
        catalog("MCP resources", data.resources?.resources.map((resource) => ({ label: `${resource.name} (${resource.server})`, detail: resource.uri })), "No MCP resources available."),
        catalog("MCP resource templates", data.resources?.templates.map((template) => ({ label: `${template.name} (${template.server})`, detail: template.uriTemplate })), "No MCP resource templates available."),
        catalog("Server plugins", data.plugins?.map((plugin) => ({ label: plugin.id ?? "(unnamed)" })), "No server plugins loaded."),
      ],
    },
    {
      title: "Permissions",
      sections: [
        catalog("Agent rules", rules(agent?.permissions), "No agent-specific rules."),
      ],
    },
  ]
}
