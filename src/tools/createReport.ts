
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { report } from "process";
 export const CREATE_REPORT: Tool = {
      name: "salesforce_create_report",
      description: `
        Create a Salesforce report using a complete Salesforce reportMetadata object (API-compliant, full fidelity).

        The input accepts the \`reportMetadata\` object as per the Salesforce Analytics REST API specification. You can set any/all of the    
supported Salesforce report properties.

        #### 🚨 Required top-level field:
        - **reportMetadata**: The full metadata object for the report (see below for all supported properties)

        ----
        ### All reportMetadata properties you can use:
        | Property                      | Type            | Description |
        | 
        | reportName                         | string          | Human-readable report name                 |
        | developerName                | string          | API/internal developer name                |
        | reportFormat                 | string          | "TABULAR", "SUMMARY", "MATRIX", "JOIN"     |
        | reportType                   | object/string   | e.g. { type, label } or legacy string      |
        | folderName                   | string          | Folder name to create report in            |
        | detailColumns                | string[]        | Field API names (columns)                  |
        | aggregates                   | string[]        | Aggregations, e.g., "RowCount", "s!AMOUNT" |
        | groupingsDown                | object[]        | Row groupings (see below)                  |
        | groupingsAcross              | object[]        | Matrix/group-by column                     |
        | reportFilters                | object[]        | Array of field filters (see below)         |
        | reportBooleanFilter          | string/null     | Boolean logic for filters                  |
        | standardDateFilter           | object          | Date range filter (see below)              |
        | chart                        | object          | Chart config (type, series, etc.)          |
        | crossFilters                 | object[]        | Cross-filtering                            |
        | presentationOptions          | object          | e.g., { hasStackedSummaries: true }        |
        | showGrandTotal               | boolean         | Show grand total                           |
        | showSubtotals                | boolean         | Show subtotals                             |
        | hasDetailRows                | boolean         | Show detail rows                           |
        | hasRecordCount               | boolean         | Show record count                          |
        | sortBy                       | array           | Sorting/grouping/sorting overrides         |
        | scope                        | string          | e.g., "organization", "mine", etc.         |
        | description                  | string/null     | Description for the report                 |
        | folderId                     | string          | Folder GUID where report will be created   |
        | id                           | string          | Only on update                             |
        | division                     | string/null     | Salesforce division feature                |
        | dashboardSetting             | object/null     | Used for dashboards                        |
        | currency                     | string/null     | Currency ISO, or null for org default      |
        | historicalSnapshotDates      | string[]        | Snapshot reporting, rarely used            |
        | userOrHierarchyFilterId      | string/null     | User/hierarchy scoping in reports          |
        | supportsRoleHierarchy        | boolean         | If this report supports role hierarchies   |
        | standardFilters              | object/null     | Standard filters                           |

        ---

        #### Example Input (all properties):
        {
            "reportName": "ApiTestingReport",
            "developerName": "ApiTestingReport_okz",
            "reportFormat": "SUMMARY",
            "reportType": {"label":"Accounts","type":"AccountList"},
            "folderName": "ApiTestingReports",
            "detailColumns": ["DUE_DATE", "ADDRESS1_STATE", "TYPE", "RATING", "LAST_UPDATE"],
            "aggregates": ["RowCount", "s!SALES", "a!SALES", "m!SALES", "mi!SALES"] → s!FIELD → Sum of FIELD,a!FIELD → Average of FIELD,m!FIELD → Maximum value of FIELD,mi!FIELD → Minimum value of FIELD,
            Salesforce Aggregate Prefixes Reference:
            "s!SALES"
             s! = This prefix tells Salesforce to calculate the Sum of the given numeric field.
             SALES = The exact API name of the numeric field to aggregate.
             Together, "s!SALES" means: Sum of the SALES field across all rows in the report, according to the grouping configuration.
             "RowCount" - A special aggregate keyword in Salesforce reports.
             Counts the total number of rows/records returned by the report.
             Works regardless of grouping or numeric fields.
             Often used alongside sum, average, max, or min aggregates to provide record counts in grouped reports.
             

            "groupingsDown": [{ "dateGranularity": "None", "name": "USERS.NAME", "sortAggregate": null, "sortOrder": "Desc" }],
            "groupingsAcross": [],
            "reportFilters": [
              {"column":"USERS.NAME","filterType":"fieldValue","isRunPageEditable":true,"operator":"notEqual","value":"SalesMaster"},
              {"column":"SALES","filterType":"fieldValue","isRunPageEditable":true,"operator":"notEqual","value":"100"}
            ],
            "reportBooleanFilter": null,
            "standardDateFilter": {"column":"CREATED_DATE","durationValue":"CUSTOM","endDate":null,"startDate":null},
            "chart": {
              "chartType": "Horizontal Bar",
              "groupingColorPalette": "DEFAULT",
              "groupings": ["USERS.NAME"],
              "hasLegend": false,
              "legendPosition": null,
              "referenceLineColors": [null],
              "referenceLineValues": [null],
              "showChartPercentages": false,
              "showChartTotal": false,
              "showChartValues": false,
              "sortLegendValues": false,
              "sortReportCharts": false,
              "summaries": ["RowCount"],
              "summaryAxisLocations": ["Y"],
              "summaryColors": ["#1B96FF"],
              "summaryVisualizationTypes": ["Column"],
              "title": null
            },
            "crossFilters": [],
            "presentationOptions": {"hasStackedSummaries":true},
            "showGrandTotal": true,
            "showSubtotals": true,
            "hasDetailRows": true,
            "hasRecordCount": true,
            "sortBy": [],
            "scope": "organization",
            "description": null,
            "folderId": "005gK000001BeuPQAS",
            "id": "00OgK00000479p3UAA",
            "division": null,
            "dashboardSetting": null,
            "currency": null,
            "historicalSnapshotDates": [],
            "userOrHierarchyFilterId": null,
            "supportsRoleHierarchy": false,
            "standardFilters": null
          }

        ---
        See Salesforce Analytics REST API documentation for further examples. All properties above are supported.
      `,

      inputSchema: {
        type: "object",
        properties: {
          reportMetadata: {
            type: "object",
            description: "The full Salesforce Analytics API reportMetadata object as described in the Salesforce REST API documentation.",    
          }
        },
        required: ["reportMetadata"],
        additionalProperties: false
      },
    };

export interface CreateReportArgs {
      reportName: string;
      objectName: string;
      columns: string[];
      filters?: { field: string; operator: string; value: string }[];
      reportType?: string;
      folderName?: string; 
      folderId?: string;
      // Newly accepted extra report metadata fields as optional
      id?: string;
      reportFormat?: string;
      reportBooleanFilter?: string;
      reportFilters?: Array<{ value: string; operator: string; column: string }>;
      detailColumns?: string[];
      developerName?: string;
      currency?: string | null;
      aggregates?: string[];
      groupingsDown?: Array<any>;
      groupingsAcross?: Array<any>;
      reportMetadata?: any;
      scope?: string;
      showGrandTotal?: boolean;
      showSubtotals?: boolean;
      hasDetailRows?: boolean;
      hasRecordCount?: boolean;
      presentationOptions?: any;
      chart?: any;
      crossFilters?: any[];
      standardDateFilter?: any;
      standardFilters?: any;
      division?: string | null;
      dashboardSetting?: any;
      userOrHierarchyFilterId?: string | null;
      supportsRoleHierarchy?: boolean;
      historicalSnapshotDates?: string[];

    }

    export async function handleCreateReport(conn: any, args: CreateReportArgs) {
    // Enhanced: Fail and help if a column/filter is not valid
    console.error('[handleCreateReport] args:', args);
  // Helper for looking up correct report fields using report-type API (v39 recommended)
  async function buildReportFieldMap(reportTypeObj: any, conn: any): Promise<{ fieldMap: {[k:string]: string};        
    fieldTypeMap: {[k:string]: string}; operatorMap: any }> {
    // Use v39 for report-type metadata endpoint as requested
           const typeName = reportTypeObj?.type;
        if (!typeName) return {fieldMap: {}, fieldTypeMap: {}, operatorMap: {}};
        console.error('[buildReportFieldMap] Fetching report type metadata for:', typeName);
        const url = `${process.env.SALESFORCE_INSTANCE_URL}/services/data/v39.0/analytics/report-types/${typeName}`;  
        try {
          const desc = await conn.request({ method: 'GET', url });
          const fieldMap: {[k:string]:string} = {};
          const fieldTypeMap: {[k:string]: string} = {};
          const operatorMap: any = desc?.reportTypeMetadata?.dataTypeFilterOperatorMap || {};
          // First, map all detailColumnInfo keys/labels and record type
          if (desc && desc.reportExtendedMetadata && desc.reportExtendedMetadata.detailColumnInfo) {
            for (const [colKey, info] of Object.entries(desc.reportExtendedMetadata.detailColumnInfo)) {
              fieldMap[String(colKey).toUpperCase()] = colKey;
              fieldTypeMap[String(colKey).toUpperCase()] = (info as any)?.dataType || '';
              const label = (info as any)?.label;
              if (typeof label === 'string' && label.length) {
                fieldMap[String(label).toUpperCase()] = colKey;
                fieldTypeMap[String(label).toUpperCase()] = (info as any)?.dataType || '';
              }
            }
          }
          
          // If not found in detailColumnInfo, supplement with any category columns
          if (desc && desc.reportTypeMetadata && Array.isArray(desc.reportTypeMetadata.categories)) {
            for (const cat of desc.reportTypeMetadata.categories) {
              if (cat && cat.columns && typeof cat.columns === 'object') {
                for (const [catKey, catInfo] of Object.entries(cat.columns)) {
                  const catKeyUp = String(catKey).toUpperCase();
                  if (!fieldMap[catKeyUp]) {
                    fieldMap[catKeyUp] = catKey;
                    fieldTypeMap[catKeyUp] = (catInfo as any)?.dataType || '';
                    const catLabel = (catInfo as any)?.label;
                    if (typeof catLabel === 'string' && catLabel.length) {
                      fieldMap[String(catLabel).toUpperCase()] = catKey;
                      fieldTypeMap[String(catLabel).toUpperCase()] = (catInfo as any)?.dataType || '';
                    }
                  }
                }
              }
            }
          }
          console.error('[buildReportFieldMap] fieldMap:', JSON.stringify(fieldMap));
          return { fieldMap, fieldTypeMap, operatorMap };
  } catch (error) {
          console.error('[buildReportFieldMap] Error fetching report type metadata:', error);
          throw new Error(`Failed to fetch report type metadata for '${typeName}': ${error instanceof Error ? error.message : String(error)}`);
    }
}
  const {
    reportName,
    objectName,
    columns,
    filters,
    reportType,
    folderName,
    folderId,
    id,
    reportFormat,
    reportBooleanFilter,
    reportFilters,
    detailColumns,
    developerName,
    currency,
    aggregates,
    groupingsDown,
    groupingsAcross,
    reportMetadata,
    scope,
    showGrandTotal,
    showSubtotals,
    hasDetailRows,
    hasRecordCount,
    presentationOptions,  
    chart,
    crossFilters,
    standardDateFilter,
    standardFilters,
    division,
    dashboardSetting,
    userOrHierarchyFilterId,
    supportsRoleHierarchy,
    historicalSnapshotDates
  } = args;

  try {
    // 1. Find suitable folder Id via SOQL (REST)
    let folderRes = null;
    if(folderId){
       folderRes = await conn.query(`SELECT Id, Name FROM Folder WHERE Id = '${folderId}' AND Type = 'Report' LIMIT 1`);
    }else{
      folderRes = await conn.query(`SELECT Id, Name FROM Folder WHERE Name = '${folderName}' AND Type = 'Report' LIMIT 1`);
    }
     
    console.error('[handleCreateReport] Folder query result:', JSON.stringify(folderRes));
    let folderLabelForReport = null;
    if( folderRes && folderRes.records && folderRes.records.length > 0) {

      folderLabelForReport = folderRes.records[0].Id;
      console.error('[handleCreateReport] Found folder:', folderLabelForReport, 'Id:', folderId);
    } else {
      // fallback: select *any* folder of type Report
      console.error('[handleCreateReport] No folder found for name, falling back to any Report folder');
      const anyFolder = await conn.query("SELECT Id, Name FROM Folder WHERE Type = 'Report' LIMIT 1");
      console.error('[handleCreateReport] Fallback folder query result:', JSON.stringify(anyFolder));
      if (anyFolder.records.length > 0) {

        folderLabelForReport = anyFolder.records[0].Id;
        console.error('[handleCreateReport] Using fallback folder:', folderLabelForReport, 'Id:', folderId);
      } else {
        console.error('[handleCreateReport] No report folders found at all.');
      }
    }

    

    // 2. Dynamically build reportMetadata with only specified properties, and add extras if present
    const apiVer = (conn.version || '57.0');
    const reportMetadataBody: any = {};

    reportMetadataBody.name = reportName;
    reportMetadataBody.folderId = folderLabelForReport;
    // Use explicit reportType object if provided, else fallback with rules
    if (args && typeof (args as any).reportType === 'object') {
      const reportTypeObj = { ...(args as any).reportType };
      // If label not provided or empty, use objectName+'s' for label
      if (!reportTypeObj.label || reportTypeObj.label === '') {
        reportTypeObj.label = typeof objectName === 'string' ? objectName + 's' : 'Objects';
      }
      // If type not provided or empty, use objectName+'List' for type
      if (!reportTypeObj.type || reportTypeObj.type === '') {
        reportTypeObj.type = typeof objectName === 'string' ? objectName + 'List' : 'ObjectList';
      }
      reportMetadataBody.reportType = reportTypeObj;
    } else if (typeof objectName === 'string' && typeof args.reportType !== 'object') {
      reportMetadataBody.reportType = { type: objectName + 'List', label: objectName + 's' };
    }
    console.error('Final report metadata:--', reportMetadata);
    // If columns, filters, etc. were provided specifically via new args, use them. Otherwise, use those present directly in args.
        console.error('[handleCreateReport] Starting report metadata construction');
        let reportFieldMap: {[k: string]: string} = {};
        let reportFieldTypeMap: {[k: string]: string} = {};
        let operatorMap: any = {};
        let reportTypeObjForMapping = undefined;

        if (typeof reportType === 'object') reportTypeObjForMapping = reportType;
        else if (typeof objectName === 'string') reportTypeObjForMapping = { type: objectName + 'List', label: objectName + 's' };

        if (reportTypeObjForMapping) {
          console.error('[handleCreateReport] Building report field map for type:', reportTypeObjForMapping);
          const maps = await buildReportFieldMap(reportTypeObjForMapping, conn);
          reportFieldMap = maps.fieldMap;
          reportFieldTypeMap = maps.fieldTypeMap;
          operatorMap = maps.operatorMap;
          console.error('[handleCreateReport] Field map:', reportFieldMap);
          console.error('[handleCreateReport] Field type map:', reportFieldTypeMap);
          console.error('[handleCreateReport] Operator map:', operatorMap);
        }

        function mapToCanonicalReportField(val: string): string {
          if (!val) return val;
          if (reportFieldMap[val]) return reportFieldMap[val];
          const upper = String(val).toUpperCase();
          if (reportFieldMap[upper]) return reportFieldMap[upper];
          for (const [k, canonical] of Object.entries(reportFieldMap)) {
            if (k.trim().toUpperCase() === upper) return canonical;
          }
          return upper;
        }

        function throwIfInvalidFields(fieldsArr: string[], kind: 'column' | 'filter', fieldMap: {[k:string]:string}) {
          console.error(`[throwIfInvalidFields] Checking ${kind}s:`, fieldsArr);
          const allowed = new Set(Object.values(fieldMap));
          console.error(`[throwIfInvalidFields] Allowed ${kind}s:`, Array.from(allowed));
          for (const requested of fieldsArr) {
            if (!requested) continue;
            const mapped = mapToCanonicalReportField(requested);
            console.error(`[throwIfInvalidFields] Requested: '${requested}', Mapped: '${mapped}'`);
            if (!allowed.has(mapped)) {
              console.error(`[handleCreateReport] Invalid ${kind} field:`, requested, 'Allowed:', Array.from(allowed));
              throw new Error(`Field '${requested}' is not a valid ${kind} for this Salesforce report type. Allowed:${Array.from(allowed).join(', ')}]`);
            }
          }
        }

        // get valid operators for a specific field
        function getValidOperatorsForField(column: string): string[] {
          const key = column ? column.toUpperCase() : column;
          console.error("[handleCreateReport] Input column:", key);
          const type = (key && reportFieldTypeMap[key]) 
            ? reportFieldTypeMap[key] : undefined;
          console.error("[handleCreateReport] Input type:", type);
          if (!type || !operatorMap[type]) return [];
          console.error("[handleCreateReport] Valid operators for type:", (operatorMap[type] as any[]).map(o => o.name));
          return (operatorMap[type] as any[]).map(o => o.name);
        }

        // finds the canonical operator for a field per datatype and label
        function normalizeOperatorForField(op: string, column: string): string {
          if (!op) return op || '';
          const valids = getValidOperatorsForField(column);
          console.error("[handleCreateReport] Valid operators for field:", column, "are", valids);
          if (!valids.length) return op;
          // Try to match label or canonical name
          const input = op.toLowerCase().replace(/\s|_/g, '');
          console.error("[handleCreateReport] Normalized input operator:", input);
          for (const v of valids) {
            console.error("[handleCreateReport] Checking against valid operator:", v);
            if (input === v.toLowerCase()) return v;
          }
          // Try label matching
          const ops = (operatorMap[reportFieldTypeMap[column.toUpperCase()]] || []) as any[];
          for (const o of ops) {
            if (input === (o.label || '').toLowerCase().replace(/\s|_/g, '')) return o.name;
          }
          // fallback - return first valid, or as-is
          return valids.includes(op) ? op : valids[0] || op;
        }

        if (Array.isArray(columns) && columns.length > 0) {
          console.error('[handleCreateReport] Using columns:', columns);
          throwIfInvalidFields(columns, 'column', reportFieldMap);
          reportMetadataBody.detailColumns = columns.map(mapToCanonicalReportField);
        } else if (Array.isArray(detailColumns) && detailColumns.length > 0) {
          console.error('[handleCreateReport] Using detailColumns:', detailColumns);
          throwIfInvalidFields(detailColumns, 'column', reportFieldMap);
          reportMetadataBody.detailColumns = detailColumns.map(mapToCanonicalReportField);
        }

        if (filters && filters.length > 0) {
          console.error('[handleCreateReport] Using filters:', filters);
          throwIfInvalidFields(filters.map(f => f.field), 'filter', reportFieldMap);
          reportMetadataBody.reportFilters = filters.map(f => ({
            column: mapToCanonicalReportField(f.field),
            operator: normalizeOperatorForField(f.operator, mapToCanonicalReportField(f.field)),
            value: f.value,
          }));
        } else if (Array.isArray(reportFilters) && reportFilters.length > 0) {
          console.error('[handleCreateReport] Using reportFilters:', reportFilters);
          throwIfInvalidFields(reportFilters.map(f => f.column), 'filter', reportFieldMap);
          reportMetadataBody.reportFilters = reportFilters.map(f => ({
            ...f,
            column: f.column ? mapToCanonicalReportField(f.column) : f.column,
            operator: normalizeOperatorForField(f.operator, f.column ? mapToCanonicalReportField(f.column) : f.column),
          }));
        }

        if (reportMetadata) {
          console.error('[handleCreateReport] Using reportMetadata:', reportMetadata);
          if (reportMetadata.filters && reportMetadata.filters.length > 0) {
            console.error('[handleCreateReport] Using reportMetadata.filters:', reportMetadata.filters);
            throwIfInvalidFields(reportMetadata.filters.map((f: { field: string; operator: string; value: string }) => f.field), 'filter', reportFieldMap);
            reportMetadataBody.reportFilters = reportMetadata.filters.map((f: { field: string; operator: string; value: string }) => ({
              column: mapToCanonicalReportField(f.field),
              operator: normalizeOperatorForField(f.operator, mapToCanonicalReportField(f.field)),
              value: f.value,
            }));
          } else if (reportMetadata.reportFilters && reportMetadata.reportFilters.length > 0) {
            console.error('[handleCreateReport] Using reportMetadata.reportFilters:---', reportMetadata.reportFilters);
            throwIfInvalidFields(reportMetadata.reportFilters.map((f: { column: string; operator: string; value: string }) => f.column), 'filter', reportFieldMap);
            reportMetadataBody.reportFilters = reportMetadata.reportFilters.map((f: { column: string; operator: string; value: string }) => ({
              column: mapToCanonicalReportField(f.column),
              operator: normalizeOperatorForField(f.operator, mapToCanonicalReportField(f.column)),
              value: f.value,
            }));
          }
        }

        if (typeof reportFormat === 'string') {
          console.error('[handleCreateReport] Setting report format to:', reportFormat);
          reportMetadataBody.reportFormat = reportFormat.toUpperCase();
        }
        if (folderId) {
          console.error('[handleCreateReport] Setting folderId:', folderId);
          reportMetadataBody.folderId = folderId;
        }
        // Only add optional fields from input if provided
        if (id) {
          console.error('[handleCreateReport] Setting id:', id);
          reportMetadataBody.id = id;
        }
        if (typeof reportBooleanFilter === 'string') {
          console.error('[handleCreateReport] Setting reportBooleanFilter:', reportBooleanFilter);
          reportMetadataBody.reportBooleanFilter = reportBooleanFilter;
        }
        if (typeof developerName === 'string') {
          console.error('[handleCreateReport] Setting developerName:', developerName);
          reportMetadataBody.developerName = developerName;
        } else {
          reportMetadataBody.developerName = reportName.replace(/[^a-zA-Z0-9_]/g, '_');
          console.error('[handleCreateReport] Auto-generated developerName:', reportMetadataBody.developerName);
        }
        if (typeof currency === 'string' || currency === null) {
          console.error('[handleCreateReport] Setting currency:', currency);
          reportMetadataBody.currency = currency;
        }
        if (Array.isArray(aggregates) && aggregates.length > 0) {
          console.error('[handleCreateReport] Setting aggregates:', aggregates);
          reportMetadataBody.aggregates = aggregates;
        }
        if (Array.isArray(groupingsDown) && groupingsDown.length > 0) {
          console.error('[handleCreateReport] Using groupingsDown:', groupingsDown);
          reportMetadataBody.groupingsDown = groupingsDown.map(f => ({
            name: mapToCanonicalReportField(f.name) || f.name,
            sortOrder: f.sortOrder || 'Asc',
            sortAggregate: f.sortAggregate ? mapToCanonicalReportField(f.sortAggregate) : null,
            dateGranularity: f.dateGranularity || 'None',
          }));
        }
        if (Array.isArray(groupingsAcross) && groupingsAcross.length > 0) {
          console.error('[handleCreateReport] Using groupingsAcross:', groupingsAcross);
          reportMetadataBody.groupingsAcross = groupingsAcross;
        }
        if (reportMetadata) {
          if (Array.isArray(reportMetadata.aggregates) && reportMetadata.aggregates.length > 0) {
            console.error('[handleCreateReport] Using reportMetadata.aggregates:', reportMetadata.aggregates);
            reportMetadataBody.aggregates = reportMetadata.aggregates;
          }
          if (Array.isArray(reportMetadata.groupingsDown) && reportMetadata.groupingsDown.length > 0) {
            console.error('[handleCreateReport] Using reportMetadata.groupingsDown:', reportMetadata.groupingsDown);
            reportMetadataBody.groupingsDown = reportMetadata.groupingsDown.map((f: any) => ({
              name: mapToCanonicalReportField(f.name),
              sortOrder: f.sortOrder || 'Asc',
              sortAggregate: f.sortAggregate ? mapToCanonicalReportField(f.sortAggregate) : null,
              dateGranularity: f.dateGranularity || 'None',
            }));
          }
          if (Array.isArray(reportMetadata.groupingsAcross) && reportMetadata.groupingsAcross.length > 0) {
            console.error('[handleCreateReport] Using reportMetadata.groupingsAcross:', reportMetadata.groupingsAcross);
            reportMetadataBody.groupingsAcross = reportMetadata.groupingsAcross;
          }
        }
        reportMetadataBody.scope = scope || 'organization'; 
        if (typeof showGrandTotal === 'boolean') {
          console.error('[handleCreateReport] Setting showGrandTotal:', showGrandTotal);
          reportMetadataBody.showGrandTotal = showGrandTotal;
        }
        if (typeof showSubtotals === 'boolean') {
          console.error('[handleCreateReport] Setting showSubtotals:', showSubtotals);
          reportMetadataBody.showSubtotals = showSubtotals;
        }
        if (typeof hasDetailRows === 'boolean') {
          console.error('[handleCreateReport] Setting hasDetailRows:', hasDetailRows);
          reportMetadataBody.hasDetailRows = hasDetailRows;
        }
        if (typeof hasRecordCount === 'boolean') {
          console.error('[handleCreateReport] Setting hasRecordCount:', hasRecordCount);
          reportMetadataBody.hasRecordCount = hasRecordCount;
        }
        if (presentationOptions && typeof presentationOptions === 'object') {
          console.error('[handleCreateReport] Using presentationOptions:', presentationOptions);
          reportMetadataBody.presentationOptions = presentationOptions;
        }
        if (chart && typeof chart === 'object') {
          console.error('[handleCreateReport] Using chart:', chart);
          reportMetadataBody.chart = chart;
        }
        if (Array.isArray(crossFilters) && crossFilters.length > 0) {
          console.error('[handleCreateReport] Using crossFilters:', crossFilters);
          reportMetadataBody.crossFilters = crossFilters;
        }
        if (standardDateFilter && typeof standardDateFilter === 'object') {
          console.error('[handleCreateReport] Using standardDateFilter:', standardDateFilter);
          reportMetadataBody.standardDateFilter = standardDateFilter;
        }
        if (standardFilters && typeof standardFilters === 'object') {
          console.error('[handleCreateReport] Using standardFilters:', standardFilters);
          reportMetadataBody.standardFilters = standardFilters;
        }
        if (typeof division === 'string' || division === null) {
          console.error('[handleCreateReport] Setting division:', division);
          reportMetadataBody.division = division;
        }
        if (dashboardSetting && typeof dashboardSetting === 'object') {
          console.error('[handleCreateReport] Using dashboardSetting:', dashboardSetting);
          reportMetadataBody.dashboardSetting = dashboardSetting;
        }
        if (typeof userOrHierarchyFilterId === 'string' || userOrHierarchyFilterId === null) {
          console.error('[handleCreateReport] Setting userOrHierarchyFilterId:', userOrHierarchyFilterId);
          reportMetadataBody.userOrHierarchyFilterId = userOrHierarchyFilterId;
        }
        if (typeof supportsRoleHierarchy === 'boolean') {
          console.error('[handleCreateReport] Setting supportsRoleHierarchy:', supportsRoleHierarchy);
          reportMetadataBody.supportsRoleHierarchy = supportsRoleHierarchy;
        }
        if (Array.isArray(historicalSnapshotDates) && historicalSnapshotDates.length > 0) {
          console.error('[handleCreateReport] Using historicalSnapshotDates:', historicalSnapshotDates);
          reportMetadataBody.historicalSnapshotDates = historicalSnapshotDates;
        }

        console.error('[handleCreateReport] Final constructed reportMetadataBody:', JSON.stringify(reportMetadataBody, null, 2));
    

    const body = { reportMetadata: reportMetadataBody };
    // 3. Create the report using Analytics REST API
    console.error('Creating report with metadata:', JSON.stringify(body));
    const url = `${process.env.SALESFORCE_INSTANCE_URL}/services/data/v${apiVer}/analytics/reports`;
    const result = await conn.request({
      method: 'POST',
      url,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.error('Salesforce API response:', JSON.stringify(result));
    if (result && result.reportExtendedMetadata) {
      return {
        content: [{ type: "text", text: `Successfully created report '${reportName}' in folder '${folderLabelForReport}' (Id: ${result.id})` }],
        isError: false,
      };
    }

    return {
      content: [{ type: "text", text: `Failed to create report '${reportName}'` }],
      isError: true,
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error creating report: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}