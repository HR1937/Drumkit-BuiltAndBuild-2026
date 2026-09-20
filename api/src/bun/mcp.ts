import { and, asc, eq } from 'drizzle-orm';
import { customer, event } from '../db/schema.js';
import { customerEscalations, customerIssues, customerJourneys } from './analytics.js';
import { executeReportAnalysis, type ReportType } from './reports.js';

export const MCP_TOOL_NAMES = ['get_customer_profile', 'get_customer_timeline', 'get_customer_issues', 'get_customer_journeys', 'get_customer_escalations', 'analyze_journey', 'analyze_dropoffs', 'analyze_repeat_contacts', 'analyze_unresolved_issues', 'analyze_escalations', 'analyze_churn_associations', 'analyze_identity_resolution', 'get_data_quality'] as const;
export type McpToolName = typeof MCP_TOOL_NAMES[number];
const allowed = new Set<string>(MCP_TOOL_NAMES);
const reportByTool: Partial<Record<McpToolName, ReportType>> = {
  analyze_journey: 'CUSTOMER_JOURNEY_OVERVIEW', analyze_dropoffs: 'DROPOFF_ANALYSIS', analyze_repeat_contacts: 'REPEAT_CONTACT_ANALYSIS', analyze_unresolved_issues: 'UNRESOLVED_ISSUES', analyze_escalations: 'ESCALATION_ANALYSIS', analyze_churn_associations: 'CHURN_ASSOCIATED_EXPERIENCE', analyze_identity_resolution: 'IDENTITY_DATA_QUALITY', get_data_quality: 'IDENTITY_DATA_QUALITY'
};

export async function invokeMcpTool(db: any, companyId: string, tool: string, rawInput: unknown) {
  if (!allowed.has(tool)) return { httpStatus: 404, body: { status: 'NOT_FOUND', code: 'UNKNOWN_TOOL' } };
  const input = rawInput && typeof rawInput === 'object' && !Array.isArray(rawInput) ? rawInput as Record<string, unknown> : {};
  const customerTool = tool.startsWith('get_customer_');
  const customerId = typeof input.customerId === 'string' ? input.customerId : null;
  if (customerTool && !customerId) return { httpStatus: 400, body: { status: 'INVALID_INPUT', message: 'customerId is required' } };
  const limit = input.limit === undefined ? 100 : Number(input.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) return { httpStatus: 400, body: { status: 'INVALID_INPUT', message: 'limit must be an integer from 1 to 100' } };

  if (customerId) {
    const [profile] = await db.select({ customerId: customer.customerId, displayName: customer.displayName, createdAt: customer.createdAt }).from(customer).where(and(eq(customer.companyId, companyId), eq(customer.customerId, customerId)));
    if (!profile) return { httpStatus: 404, body: { status: 'NOT_FOUND' } };
    const provenance = { tables: ['customer'], companyId };
    if (tool === 'get_customer_profile') return { httpStatus: 200, body: { status: 'AVAILABLE', profile, provenance } };
    if (tool === 'get_customer_timeline') { const rows = await db.select().from(event).where(and(eq(event.companyId, companyId), eq(event.customerId, customerId))).orderBy(asc(event.eventTime), asc(event.eventId)).limit(limit); return { httpStatus: 200, body: { status: rows.length ? 'AVAILABLE' : 'EMPTY', profile, timeline: rows, provenance: { tables: ['customer', 'event'], companyId } } }; }
    if (tool === 'get_customer_issues') { const rows = await customerIssues(db, companyId, customerId); return { httpStatus: 200, body: { status: rows.length ? 'AVAILABLE' : 'EMPTY', issues: rows.slice(0, limit), provenance: { tables: ['issue'], companyId } } }; }
    if (tool === 'get_customer_journeys') { const rows = await customerJourneys(db, companyId, customerId); return { httpStatus: 200, body: { status: rows.length ? 'AVAILABLE' : 'EMPTY', journeys: rows.slice(0, limit), provenance: { tables: ['journey_instance'], companyId } } }; }
    if (tool === 'get_customer_escalations') { const rows = await customerEscalations(db, companyId, customerId); return { httpStatus: 200, body: { status: rows.length ? 'AVAILABLE' : 'EMPTY', escalations: rows.slice(0, limit), provenance: { tables: ['escalation'], companyId } } }; }
  }
  const reportType = reportByTool[tool as McpToolName];
  if (!reportType) return { httpStatus: 404, body: { status: 'NOT_FOUND', code: 'UNKNOWN_TOOL' } };
  const result = await executeReportAnalysis(db, companyId, reportType, input);
  return { httpStatus: 200, body: { ...result, tool, provenance: { ...result.provenance, companyId } } };
}
