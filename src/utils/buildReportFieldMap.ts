import { SalesforceField } from "../types/salesforce";

/**
 * Given a Salesforce object metadata (describe response), build a Set of all valid API field names.
 * @param fields: Array of SalesforceField from describe result
 * @returns Set of string (field API names)
 */
export function buildReportFieldMap(fields: SalesforceField[]): Set<string> {
  return new Set(fields.map(f => f.name.toUpperCase()));
}