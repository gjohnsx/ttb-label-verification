// Mock agent data for demo authentication
// These map to TTB stakeholder personas from the spec

export const MOCK_AGENTS = [
  { id: 'dave', name: 'Dave Morrison', role: 'Senior Agent' },
  { id: 'jenny', name: 'Jenny Park', role: 'Junior Agent' },
  { id: 'janet', name: 'Janet Torres', role: 'Seattle Office' },
] as const

export type AgentId = (typeof MOCK_AGENTS)[number]['id']
export type Agent = (typeof MOCK_AGENTS)[number]
