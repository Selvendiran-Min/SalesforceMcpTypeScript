import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const CREATE_PROFILE: Tool = {
  name: "salesforce_create_profile",
  description: `Create or update a Salesforce Profile by converting arguments to Profile metadata and upserting via Metadata API (no zip).

Provide a profileName and any supported sections (userLicense, description, objectPermissions, fieldPermissions, classAccesses,
pageAccesses, applicationVisibilities, tabVisibilities, userPermissions). The tool builds the equivalent Profile metadata and
calls metadata.upsert('Profile', ...).

Example:
{
  "profileName": "Custom_Tier1_Support",
  "userLicense": "Salesforce",
  "objectPermissions": [
    {"object": "Case", "allowCreate": true, "allowRead": true, "allowEdit": true, "allowDelete": false, "modifyAllRecords": false, "viewAllRecords": false}
  ],
  "fieldPermissions": [
    {"field": "Case.Origin", "readable": true, "editable": true}
  ],
  "tabVisibilities": [
    {"tab": "standard-Case", "visibility": "DefaultOn"}
  ],
  "applicationVisibilities": [
    {"application": "standard__LightningSales", "visible": true}
  ],
  "userPermissions": [
    {"name": "ApiEnabled", "enabled": true}
  ]
}
`,
  inputSchema: {
    type: "object",
    properties: {
      profileName: { type: "string", description: "Full name (API) of the Profile to create/update" },
      userLicense: { type: "string", optional: true },
      description: { type: "string", optional: true },
      objectPermissions: { type: "array", items: { type: "object" }, optional: true },
      fieldPermissions: { type: "array", items: { type: "object" }, optional: true },
      classAccesses: { type: "array", items: { type: "object" }, optional: true },
      pageAccesses: { type: "array", items: { type: "object" }, optional: true },
      applicationVisibilities: { type: "array", items: { type: "object" }, optional: true },
      tabVisibilities: { type: "array", items: { type: "object" }, optional: true },
      userPermissions: { type: "array", items: { type: "object" }, optional: true }
    },
    required: ["profileName"],
    additionalProperties: true
  }
};

export interface CreateProfileArgs {
  profileName: string;
  userLicense?: string;
  description?: string;
  objectPermissions?: Array<{ object: string; allowCreate?: boolean; allowRead?: boolean; allowEdit?: boolean; allowDelete?: boolean; modifyAllRecords?: boolean; viewAllRecords?: boolean; }>;
  fieldPermissions?: Array<{ field: string; readable?: boolean; editable?: boolean; }>;
  classAccesses?: Array<{ apexClass: string; enabled?: boolean; }>;
  pageAccesses?: Array<{ apexPage: string; enabled?: boolean; }>;
  applicationVisibilities?: Array<{ application: string; visible?: boolean; }>;
  tabVisibilities?: Array<{ tab: string; visibility?: "DefaultOn" | "DefaultOff" | "Hidden" }>;
  userPermissions?: Array<{ name: string; enabled?: boolean; }>;
}

export async function handleCreateProfile(conn: any, args: CreateProfileArgs) {
  const { profileName } = args;
  if (!profileName) {
    return { content: [{ type: 'text', text: 'profileName is required' }], isError: true };
  }

  try {
    const md: any = {
      fullName: profileName,
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
      ...(args.applicationVisibilities ? { applicationVisibilities: args.applicationVisibilities.map(av => ({
        application: av.application,
        visible: !!av.visible,
      })) } : {}),
      ...(args.tabVisibilities ? { tabVisibilities: args.tabVisibilities.map(tv => ({
        tab: tv.tab,
        visibility: tv.visibility || 'DefaultOn',
      })) } : {}),
      ...(args.userPermissions ? { userPermissions: args.userPermissions.map(up => ({
        name: up.name,
        enabled: !!up.enabled,
      })) } : {}),
    };

    const result = await conn.metadata.upsert('Profile', md);
    const arr = Array.isArray(result) ? result : [result];
    const r = arr[0];
    if (r && r.success) {
      return {
        content: [{ type: 'text', text: `Profile '${profileName}' created/updated successfully.` }],
        isError: false
      };
    }
    const err = r && r.errors ? (Array.isArray(r.errors) ? r.errors.map((e: any) => e.message).join('; ') : r.errors.message) : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Failed to create/update Profile '${profileName}': ${err}` }],
      isError: true
    };
  } catch (e) {
    return {
      content: [{ type: 'text', text: `Error creating/updating Profile: ${e instanceof Error ? e.message : String(e)}` }],
      isError: true
    };
  }
}
