import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const CREATE_PERMISSION_SET: Tool = {
  name: "salesforce_create_permission_set",
  description: `Create a Permission Set by converting arguments to Salesforce metadata (XML-equivalent) and deploying it via Metadata API upsert (no zip).

Provide a developerName and any of the supported sections (label, userLicense, description, objectPermissions, fieldPermissions,
classAccesses, pageAccesses, tabSettings, applicationVisibilities, userPermissions).

Example:  
{
  "developerName": "MyPermSet",
  "label": "My Permission Set",
  "userLicense": "Salesforce",
  "description": "Created via MCP",
  "objectPermissions": [
    {"object": "Account", "allowCreate": true, "allowRead": true, "allowEdit": true, "allowDelete": false, "modifyAllRecords": false, "viewAllRecords": true}
  ],
  "fieldPermissions": [
    {"field": "Account.Name", "readable": true, "editable": true}
  ],
  "userPermissions": [
    {"name": "ApiEnabled", "enabled": true}
  ]
}
`,
  inputSchema: {
    type: "object",
    properties: {
      developerName: { type: "string", description: "API developerName for the PermissionSet metadata member" },
      label: { type: "string", optional: true },
      userLicense: { type: "string", optional: true },
      description: { type: "string", optional: true },
      objectPermissions: { type: "array", items: { type: "object" }, optional: true },
      fieldPermissions: { type: "array", items: { type: "object" }, optional: true },
      classAccesses: { type: "array", items: { type: "object" }, optional: true },
      pageAccesses: { type: "array", items: { type: "object" }, optional: true },
      tabSettings: { type: "array", items: { type: "object" }, optional: true },
      applicationVisibilities: { type: "array", items: { type: "object" }, optional: true },
      userPermissions: { type: "array", items: { type: "object" }, optional: true }
    },
    required: ["developerName"],
    additionalProperties: true
  }
};

export interface CreatePermissionSetArgs {
  developerName: string;
  label?: string;
  userLicense?: string;
  description?: string;
  objectPermissions?: Array<{ object: string; allowCreate?: boolean; allowRead?: boolean; allowEdit?: boolean; allowDelete?: boolean; modifyAllRecords?: boolean; viewAllRecords?: boolean; }>;
  fieldPermissions?: Array<{ field: string; readable?: boolean; editable?: boolean; }>;
  classAccesses?: Array<{ apexClass: string; enabled?: boolean; }>;
  pageAccesses?: Array<{ apexPage: string; enabled?: boolean; }>;
  tabSettings?: Array<{ tab: string; visibility?: "DefaultOn" | "DefaultOff" | "Hidden" }>;
  applicationVisibilities?: Array<{ application: string; visible?: boolean; }>;
  userPermissions?: Array<{ name: string; enabled?: boolean; }>;
}

export async function handleCreatePermissionSet(conn: any, args: CreatePermissionSetArgs) {
  const { developerName } = args;
  if (!developerName) {
    return { content: [{ type: 'text', text: 'developerName is required' }], isError: true };
  }

  try {
    const md: any = {
      fullName: developerName,
      ...(args.label ? { label: args.label } : {}),
      ...(args.userLicense ? { userLicense: args.userLicense } : {}),
      ...(args.description ? { description: args.description } : {}),
      ...(args.objectPermissions ? { objectPermissions: args.objectPermissions.map(op => ({
        object: op.object,
        allowCreate: !!op.allowCreate,
        allowRead: !!op.allowRead,
        allowEdit: !!op.allowEdit,
        allowDelete: !!op.allowDelete,
        modifyAllRecords: !!op.modifyAllRecords,
        viewAllRecords: !!op.viewAllRecords,
      })) } : {}),
      ...(args.fieldPermissions ? { fieldPermissions: args.fieldPermissions.map(fp => ({
        field: fp.field,
        readable: fp.readable !== false, // default true
        editable: !!fp.editable,
      })) } : {}),
      ...(args.classAccesses ? { classAccesses: args.classAccesses.map(ca => ({
        apexClass: ca.apexClass,
        enabled: !!ca.enabled,
      })) } : {}),
      ...(args.pageAccesses ? { pageAccesses: args.pageAccesses.map(pa => ({
        apexPage: pa.apexPage,
        enabled: !!pa.enabled,
      })) } : {}),
      ...(args.tabSettings ? { tabSettings: args.tabSettings.map(ts => ({
        tab: ts.tab,
        visibility: ts.visibility || 'DefaultOn',
      })) } : {}),
      ...(args.applicationVisibilities ? { applicationVisibilities: args.applicationVisibilities.map(av => ({
        application: av.application,
        visible: !!av.visible,
      })) } : {}),
      ...(args.userPermissions ? { userPermissions: args.userPermissions.map(up => ({
        name: up.name,
        enabled: !!up.enabled,
      })) } : {}),
    };

    const result = await conn.metadata.upsert('PermissionSet', md);
    const arr = Array.isArray(result) ? result : [result];
    const r = arr[0];
    if (r && r.success) {
      return {
        content: [{ type: 'text', text: `Permission Set '${developerName}' created/updated successfully.` }],
        isError: false
      };
    }
    const err = r && r.errors ? (Array.isArray(r.errors) ? r.errors.map((e: any) => e.message).join('; ') : r.errors.message) : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Failed to create/update Permission Set '${developerName}': ${err}` }],
      isError: true
    };
  } catch (e) {
    return {
      content: [{ type: 'text', text: `Error creating/updating Permission Set: ${e instanceof Error ? e.message : String(e)}` }],
      isError: true
    };
  }
}
