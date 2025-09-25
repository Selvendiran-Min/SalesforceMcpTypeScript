#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as dotenv from "dotenv";
import { createSalesforceConnection } from "./utils/connection.js";
import { SEARCH_OBJECTS, handleSearchObjects } from "./tools/search.js";
import { DESCRIBE_OBJECT, handleDescribeObject } from "./tools/describe.js";
import { QUERY_RECORDS, handleQueryRecords, QueryArgs } from "./tools/query.js";
import { AGGREGATE_QUERY, handleAggregateQuery, AggregateQueryArgs } from "./tools/aggregateQuery.js";
import { DML_RECORDS, handleDMLRecords, DMLArgs } from "./tools/dml.js";
import { MANAGE_OBJECT, handleManageObject, ManageObjectArgs } from "./tools/manageObject.js";
import { MANAGE_FIELD, handleManageField, ManageFieldArgs } from "./tools/manageField.js";
import { MANAGE_FIELD_PERMISSIONS, handleManageFieldPermissions, ManageFieldPermissionsArgs } from "./tools/manageFieldPermissions.js";
import { SEARCH_ALL, handleSearchAll, SearchAllArgs, WithClause } from "./tools/searchAll.js";
import { READ_APEX, handleReadApex, ReadApexArgs } from "./tools/readApex.js";
import { WRITE_APEX, handleWriteApex, WriteApexArgs } from "./tools/writeApex.js";
import { READ_APEX_TRIGGER, handleReadApexTrigger, ReadApexTriggerArgs } from "./tools/readApexTrigger.js";
import { WRITE_APEX_TRIGGER, handleWriteApexTrigger, WriteApexTriggerArgs } from "./tools/writeApexTrigger.js";
import { EXECUTE_ANONYMOUS, handleExecuteAnonymous, ExecuteAnonymousArgs } from "./tools/executeAnonymous.js";
import { MANAGE_DEBUG_LOGS, handleManageDebugLogs, ManageDebugLogsArgs } from "./tools/manageDebugLogs.js";
import { CREATE_REPORT, handleCreateReport, CreateReportArgs } from "./tools/createReport.js";
import { CREATE_PERMISSION_SET, handleCreatePermissionSet, CreatePermissionSetArgs } from "./tools/createPermissionSet.js";
import { CREATE_PROFILE, handleCreateProfile, CreateProfileArgs } from "./tools/createProfile.js";
import { CREATE_FLOW, handleCreateFlow, CreateFlowArgs } from "./tools/createFlow.js";

dotenv.config();

const server = new Server( 
  {
    name: "salesforce-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = [
    SEARCH_OBJECTS, 
    DESCRIBE_OBJECT, 
    QUERY_RECORDS, 
    AGGREGATE_QUERY,
    DML_RECORDS,
    MANAGE_OBJECT,
    MANAGE_FIELD,
    MANAGE_FIELD_PERMISSIONS,
    SEARCH_ALL,
    READ_APEX,
    WRITE_APEX,
    READ_APEX_TRIGGER,
    WRITE_APEX_TRIGGER,
    EXECUTE_ANONYMOUS,
    MANAGE_DEBUG_LOGS,
    CREATE_REPORT,
    CREATE_PERMISSION_SET,
    CREATE_FLOW,
    CREATE_PROFILE,
    //CREATE_REPORT_AI,
  ];
  console.error("ListToolsRequest: returning tools:", tools.map(t => t.name || t));
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    const conn = await createSalesforceConnection();
    console.error(`Handling tool: ${name} with args:`, args);
    switch (name) {
      case "salesforce_search_objects": {
        const { searchPattern } = args as { searchPattern: string };
        if (!searchPattern) throw new Error('searchPattern is required');
        return await handleSearchObjects(conn, searchPattern);
      }
      case "salesforce_create_report": {
        console.error('[salesforce_create_report] args:', args);  
        const reportArgs = args as Record<string, unknown>;
        

        // Accept extra fields if provided, excluding prohibited/handled ones
        const allowedExtraKeys = [
          'id',
          'reportFormat',
          'reportBooleanFilter',
          'reportFilters',
          'detailColumns',
          'developerName',
          'currency',
          'aggregates',
          'groupingsDown',
          'groupingsAcross',
          'reportMetadata',
          'reportFormat', // Optional, can be used to specify the report format
          'reportType', // Optional, but can be used to specify the report type
          'folderName', // Requeired, name of the folder where the report will be created
          'reportName', // Required, name of the report
          'objectName', // Required, object the report is based on
          'columns',         // Required, columns to include in the report
          'filters',         // Optional, filters to apply to the report
          'scope',          // Optional, scope of the report
          'showGrandTotal', // Optional, whether to show grand total
          'showSubtotals', // Optional, whether to show subtotals   
          'hasDetailRows', // Optional, whether the report has detail rows
          'hasRecordCount', // Optional, whether to include record count
          'presentationOptions', // Optional, presentation options for the report
          'chart', // Optional, chart configuration for the report
          'crossFilters', // Optional, cross filters for the report
          'standardDateFilter', // Optional, standard date filter for the report
          'standardFilters', // Optional, standard filters for the report
          'division', // Optional, division for the report
          'dashboardSetting', // Optional, dashboard settings for the report
          'userOrHierarchyFilterId', // Optional, user or hierarchy filter ID for the report
          'supportsRoleHierarchy', // Optional, whether the report supports role hierarchy
          'historicalSnapshotDates' // Optional, historical snapshot dates for the report

        ];

        const validatedArgs: CreateReportArgs = {
          reportName: reportArgs.reportName as string,
          objectName: reportArgs.objectName as string,
          columns: reportArgs.columns as string[],
          filters: reportArgs.filters as Array<{ field: string; operator: string; value: string }> | undefined,
          reportType: reportArgs.reportType as string | undefined,
          reportFormat: reportArgs.reportFormat as string | undefined,
          folderName: reportArgs.folderName as string | undefined,
          currency: reportArgs.currency as string | undefined,
          aggregates: reportArgs.aggregates as string[] | undefined,
          groupingsDown: reportArgs.groupingsDown as Array<any> | undefined,
          groupingsAcross: reportArgs.groupingsAcross as Array<any> | undefined,
          reportMetadata: reportArgs.reportMetadata as any | undefined,
          scope: reportArgs.scope as string | undefined,
          showGrandTotal: reportArgs.showGrandTotal as boolean | undefined,
          showSubtotals: reportArgs.showSubtotals as boolean | undefined,
          hasDetailRows: reportArgs.hasDetailRows as boolean | undefined,
          hasRecordCount: reportArgs.hasRecordCount as boolean | undefined,
          presentationOptions: reportArgs.presentationOptions as any | undefined,
          chart: reportArgs.chart as any | undefined,
          crossFilters: reportArgs.crossFilters as any | undefined,
          standardDateFilter: reportArgs.standardDateFilter as any | undefined,
          standardFilters: reportArgs.standardFilters as any | undefined,
          division: reportArgs.division as string | null,
          dashboardSetting: reportArgs.dashboardSetting as any | undefined,
          userOrHierarchyFilterId: reportArgs.userOrHierarchyFilterId as string | null,
          supportsRoleHierarchy: reportArgs.supportsRoleHierarchy as boolean | undefined,
          historicalSnapshotDates: reportArgs.historicalSnapshotDates as string[] | undefined
        };

        for (const key of allowedExtraKeys) {
          if (key in reportArgs && !(key in validatedArgs)) {
            (validatedArgs as any)[key] = reportArgs[key];
          }
        }

        return await handleCreateReport(conn, validatedArgs.reportMetadata);
      }
      case "salesforce_create_permission_set": {
        const psArgs = args as Record<string, unknown>;
        if (!psArgs.developerName) {
          throw new Error('developerName is required');
        }
        const validated: CreatePermissionSetArgs = {
          developerName: psArgs.developerName as string,
          label: psArgs.label as string | undefined,
          userLicense: psArgs.userLicense as string | undefined,
          description: psArgs.description as string | undefined,
          objectPermissions: psArgs.objectPermissions as any[] | undefined,
          fieldPermissions: psArgs.fieldPermissions as any[] | undefined,
          classAccesses: psArgs.classAccesses as any[] | undefined,
          pageAccesses: psArgs.pageAccesses as any[] | undefined,
          tabSettings: psArgs.tabSettings as any[] | undefined,
          applicationVisibilities: psArgs.applicationVisibilities as any[] | undefined,
          userPermissions: psArgs.userPermissions as any[] | undefined,
        };
        return await handleCreatePermissionSet(conn, validated);
      }
      case "salesforce_create_flow": {
        const flowArgs = args as Record<string, unknown>;
        if (!flowArgs.developerName || !flowArgs.flowMetadata) {
          throw new Error('developerName and flowMetadata are required');
        }
        const validated: CreateFlowArgs = {
          developerName: flowArgs.developerName as string,
          status: flowArgs.status as "Active" | "Draft" | undefined,
          activate: flowArgs.activate as boolean | undefined,
          flowMetadata: flowArgs.flowMetadata as any,
        };
        return await handleCreateFlow(conn, validated);
      }
      case "salesforce_create_profile": {
        const pArgs = args as Record<string, unknown>;
        if (!pArgs.profileName) throw new Error('profileName is required');
        const validated: CreateProfileArgs = {
          profileName: pArgs.profileName as string,
          userLicense: pArgs.userLicense as string | undefined,
          description: pArgs.description as string | undefined,
          objectPermissions: pArgs.objectPermissions as any[] | undefined,
          fieldPermissions: pArgs.fieldPermissions as any[] | undefined,
          classAccesses: pArgs.classAccesses as any[] | undefined,
          pageAccesses: pArgs.pageAccesses as any[] | undefined,
          applicationVisibilities: pArgs.applicationVisibilities as any[] | undefined,
          tabVisibilities: pArgs.tabVisibilities as any[] | undefined,
          userPermissions: pArgs.userPermissions as any[] | undefined,
        };
        return await handleCreateProfile(conn, validated);
      }
      case "salesforce_describe_object": {
        const { objectName } = args as { objectName: string };
        if (!objectName) throw new Error('objectName is required');
        return await handleDescribeObject(conn, objectName);
      }

      case "salesforce_query_records": {
        const queryArgs = args as Record<string, unknown>;
        if (!queryArgs.objectName || !Array.isArray(queryArgs.fields)) {
          throw new Error('objectName and fields array are required for query');
        }
        // Type check and conversion
        const validatedArgs: QueryArgs = {
          objectName: queryArgs.objectName as string,
          fields: queryArgs.fields as string[],
          whereClause: queryArgs.whereClause as string | undefined,
          orderBy: queryArgs.orderBy as string | undefined,
          limit: queryArgs.limit as number | undefined
        };
        return await handleQueryRecords(conn, validatedArgs);
      }

      case "salesforce_aggregate_query": {
        const aggregateArgs = args as Record<string, unknown>;
        if (!aggregateArgs.objectName || !Array.isArray(aggregateArgs.selectFields) || !Array.isArray(aggregateArgs.groupByFields)) {
          throw new Error('objectName, selectFields array, and groupByFields array are required for aggregate query');
        }
        // Type check and conversion
        const validatedArgs: AggregateQueryArgs = {
          objectName: aggregateArgs.objectName as string,
          selectFields: aggregateArgs.selectFields as string[],
          groupByFields: aggregateArgs.groupByFields as string[],
          whereClause: aggregateArgs.whereClause as string | undefined,
          havingClause: aggregateArgs.havingClause as string | undefined,
          orderBy: aggregateArgs.orderBy as string | undefined,
          limit: aggregateArgs.limit as number | undefined
        };
        return await handleAggregateQuery(conn, validatedArgs);
      }

      case "salesforce_dml_records": {
        const dmlArgs = args as Record<string, unknown>;
        if (!dmlArgs.operation || !dmlArgs.objectName || !Array.isArray(dmlArgs.records)) {
          throw new Error('operation, objectName, and records array are required for DML');
        }
        const validatedArgs: DMLArgs = {
          operation: dmlArgs.operation as 'insert' | 'update' | 'delete' | 'upsert',
          objectName: dmlArgs.objectName as string,
          records: dmlArgs.records as Record<string, any>[],
          externalIdField: dmlArgs.externalIdField as string | undefined
        };
        return await handleDMLRecords(conn, validatedArgs);
      }

      case "salesforce_manage_object": {
        const objectArgs = args as Record<string, unknown>;
        if (!objectArgs.operation || !objectArgs.objectName) {
          throw new Error('operation and objectName are required for object management');
        }
        const validatedArgs: ManageObjectArgs = {
          operation: objectArgs.operation as 'create' | 'update',
          objectName: objectArgs.objectName as string,
          label: objectArgs.label as string | undefined,
          pluralLabel: objectArgs.pluralLabel as string | undefined,
          description: objectArgs.description as string | undefined,
          nameFieldLabel: objectArgs.nameFieldLabel as string | undefined,
          nameFieldType: objectArgs.nameFieldType as 'Text' | 'AutoNumber' | undefined,
          nameFieldFormat: objectArgs.nameFieldFormat as string | undefined,
          sharingModel: objectArgs.sharingModel as 'ReadWrite' | 'Read' | 'Private' | 'ControlledByParent' | undefined
        };
        return await handleManageObject(conn, validatedArgs);
      }

      case "salesforce_manage_field": {
        const fieldArgs = args as Record<string, unknown>;
        if (!fieldArgs.operation || !fieldArgs.objectName || !fieldArgs.fieldName) {
          throw new Error('operation, objectName, and fieldName are required for field management');
        }
        const validatedArgs: ManageFieldArgs = {
          operation: fieldArgs.operation as 'create' | 'update',
          objectName: fieldArgs.objectName as string,
          fieldName: fieldArgs.fieldName as string,
          label: fieldArgs.label as string | undefined,
          type: fieldArgs.type as string | undefined,
          required: fieldArgs.required as boolean | undefined,
          unique: fieldArgs.unique as boolean | undefined,
          externalId: fieldArgs.externalId as boolean | undefined,
          length: fieldArgs.length as number | undefined,
          precision: fieldArgs.precision as number | undefined,
          scale: fieldArgs.scale as number | undefined,
          referenceTo: fieldArgs.referenceTo as string | undefined,
          relationshipLabel: fieldArgs.relationshipLabel as string | undefined,
          relationshipName: fieldArgs.relationshipName as string | undefined,
          deleteConstraint: fieldArgs.deleteConstraint as 'Cascade' | 'Restrict' | 'SetNull' | undefined,
          picklistValues: fieldArgs.picklistValues as Array<{ label: string; isDefault?: boolean }> | undefined,
          description: fieldArgs.description as string | undefined,
          grantAccessTo: fieldArgs.grantAccessTo as string[] | undefined
        };
        return await handleManageField(conn, validatedArgs);
      }

      case "salesforce_manage_field_permissions": {
        const permArgs = args as Record<string, unknown>;
        if (!permArgs.operation || !permArgs.objectName || !permArgs.fieldName) {
          throw new Error('operation, objectName, and fieldName are required for field permissions management');
        }
        const validatedArgs: ManageFieldPermissionsArgs = {
          operation: permArgs.operation as 'grant' | 'revoke' | 'view',
          objectName: permArgs.objectName as string,
          fieldName: permArgs.fieldName as string,
          profileNames: permArgs.profileNames as string[] | undefined,
          readable: permArgs.readable as boolean | undefined,
          editable: permArgs.editable as boolean | undefined
        };
        return await handleManageFieldPermissions(conn, validatedArgs);
      }

      case "salesforce_search_all": {
        const searchArgs = args as Record<string, unknown>;
        if (!searchArgs.searchTerm || !Array.isArray(searchArgs.objects)) {
          throw new Error('searchTerm and objects array are required for search');
        }

        // Validate objects array
        const objects = searchArgs.objects as Array<Record<string, unknown>>;
        if (!objects.every(obj => obj.name && Array.isArray(obj.fields))) {
          throw new Error('Each object must specify name and fields array');
        }

        // Type check and conversion
        const validatedArgs: SearchAllArgs = {
          searchTerm: searchArgs.searchTerm as string,
          searchIn: searchArgs.searchIn as "ALL FIELDS" | "NAME FIELDS" | "EMAIL FIELDS" | "PHONE FIELDS" | "SIDEBAR FIELDS" | undefined,
          objects: objects.map(obj => ({
            name: obj.name as string,
            fields: obj.fields as string[],
            where: obj.where as string | undefined,
            orderBy: obj.orderBy as string | undefined,
            limit: obj.limit as number | undefined
          })),
          withClauses: searchArgs.withClauses as WithClause[] | undefined,
          updateable: searchArgs.updateable as boolean | undefined,
          viewable: searchArgs.viewable as boolean | undefined
        };

        return await handleSearchAll(conn, validatedArgs);
      }

      case "salesforce_read_apex": {
        const apexArgs = args as Record<string, unknown>;
        
        // Type check and conversion
        const validatedArgs: ReadApexArgs = {
          className: apexArgs.className as string | undefined,
          namePattern: apexArgs.namePattern as string | undefined,
          includeMetadata: apexArgs.includeMetadata as boolean | undefined
        };

        return await handleReadApex(conn, validatedArgs);
      }

      case "salesforce_write_apex": {
        const apexArgs = args as Record<string, unknown>;
        if (!apexArgs.operation || !apexArgs.className || !apexArgs.body) {
          throw new Error('operation, className, and body are required for writing Apex');
        }
        
        // Type check and conversion
        const validatedArgs: WriteApexArgs = {
          operation: apexArgs.operation as 'create' | 'update',
          className: apexArgs.className as string,
          apiVersion: apexArgs.apiVersion as string | undefined,
          body: apexArgs.body as string
        };

        return await handleWriteApex(conn, validatedArgs);
      }

      case "salesforce_read_apex_trigger": {
        const triggerArgs = args as Record<string, unknown>;
        
        // Type check and conversion
        const validatedArgs: ReadApexTriggerArgs = {
          triggerName: triggerArgs.triggerName as string | undefined,
          namePattern: triggerArgs.namePattern as string | undefined,
          includeMetadata: triggerArgs.includeMetadata as boolean | undefined
        };

        return await handleReadApexTrigger(conn, validatedArgs);
      }

      case "salesforce_write_apex_trigger": {
        const triggerArgs = args as Record<string, unknown>;
        if (!triggerArgs.operation || !triggerArgs.triggerName || !triggerArgs.body) {
          throw new Error('operation, triggerName, and body are required for writing Apex trigger');
        }
        
        // Type check and conversion
        const validatedArgs: WriteApexTriggerArgs = {
          operation: triggerArgs.operation as 'create' | 'update',
          triggerName: triggerArgs.triggerName as string,
          objectName: triggerArgs.objectName as string | undefined,
          apiVersion: triggerArgs.apiVersion as string | undefined,
          body: triggerArgs.body as string
        };

        return await handleWriteApexTrigger(conn, validatedArgs);
      }

      case "salesforce_execute_anonymous": {
        const executeArgs = args as Record<string, unknown>;
        if (!executeArgs.apexCode) {
          throw new Error('apexCode is required for executing anonymous Apex');
        }
        
        // Type check and conversion
        const validatedArgs: ExecuteAnonymousArgs = {
          apexCode: executeArgs.apexCode as string,
          logLevel: executeArgs.logLevel as 'NONE' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'FINE' | 'FINER' | 'FINEST' | undefined
        };

        return await handleExecuteAnonymous(conn, validatedArgs);
      }

      case "salesforce_manage_debug_logs": {
        const debugLogsArgs = args as Record<string, unknown>;
        if (!debugLogsArgs.operation || !debugLogsArgs.username) {
          throw new Error('operation and username are required for managing debug logs');
        }
        
        // Type check and conversion
        const validatedArgs: ManageDebugLogsArgs = {
          operation: debugLogsArgs.operation as 'enable' | 'disable' | 'retrieve',
          username: debugLogsArgs.username as string,
          logLevel: debugLogsArgs.logLevel as 'NONE' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'FINE' | 'FINER' | 'FINEST' | undefined,
          expirationTime: debugLogsArgs.expirationTime as number | undefined,
          limit: debugLogsArgs.limit as number | undefined,
          logId: debugLogsArgs.logId as string | undefined,
          includeBody: debugLogsArgs.includeBody as boolean | undefined
        };

        return await handleManageDebugLogs(conn, validatedArgs);
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Locally setted up");
  console.error("Salesforce MCP Server running on npx");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});