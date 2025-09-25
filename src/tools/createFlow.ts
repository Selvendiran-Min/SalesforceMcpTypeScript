import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const CREATE_FLOW: Tool = {
  name: "salesforce_create_flow",
  description: `Create or update a Salesforce Flow using the Metadata API (no zip) and optionally activate it via Tooling API.

You can provide a complete Flow metadata object (flowMetadata) conforming to Salesforce's Flow metadata schema.
Optionally include status (Draft or Active) and developerName. If activate is true (or status is Active), the tool will
attempt to set the FlowDefinition's ActiveVersion to the newest version after upsert.

Examples:
1) Provide full flowMetadata (recommended):
{
  "developerName": "My_Autolaunched_Flow",
  "status": "Active",
  "activate": true,
  "flowMetadata": {
    "label": "My Autolaunched Flow",
    "processMetadataValues": [],
    "decisions": [],
    "assignments": [],
    "variables": [],
    "startElementReference": "start",
    "elements": [ /* See Salesforce Flow metadata spec for full structure */ ]
  }
}

Notes:
- This tool expects a valid Flow metadata structure. It does not attempt to auto-generate a flow for you.
- If status is set to Active or activate=true, the tool will try to set the FlowDefinition's ActiveVersionId via Tooling API.
  Activation requires that your Flow has a valid active version.
`,
  inputSchema: {
    type: "object",
    properties: {
      developerName: { type: "string", description: "DeveloperName / fullName of the Flow (used as fullName in metadata)." },
      status: { type: "string", enum: ["Active", "Draft"], description: "Optional flow status to set on upsert." },
      activate: { type: "boolean", description: "If true, attempt to set FlowDefinition's ActiveVersion to the newest version after upsert." },
      flowMetadata: { type: "object", description: "Complete Flow metadata object as per Salesforce Metadata API." }
    },
    required: ["developerName", "flowMetadata"],
    additionalProperties: true
  }
};

export interface CreateFlowArgs {
  developerName: string;
  status?: "Active" | "Draft";
  activate?: boolean;
  flowMetadata: any; // Pass-through Flow metadata object per Salesforce spec
}

export async function handleCreateFlow(conn: any, args: CreateFlowArgs) {
  const { developerName, status, activate, flowMetadata } = args;
  if (!developerName) {
    return { content: [{ type: "text", text: "developerName is required" }], isError: true };
  }
  if (!flowMetadata || typeof flowMetadata !== 'object') {
    return { content: [{ type: "text", text: "flowMetadata object is required" }], isError: true };
  }

  try {
    // Construct metadata payload for Flow
    const md: any = {
      fullName: developerName,
      ...flowMetadata,
    };
    if (status) {
      md.status = status; // Active | Draft
    }

    // Upsert Flow metadata
    const result = await conn.metadata.upsert('Flow', md);
    const arr = Array.isArray(result) ? result : [result];
    const r = arr[0];
    if (!r || !r.success) {
      const err = r && r.errors ? (Array.isArray(r.errors) ? r.errors.map((e: any) => e.message).join('; ') : r.errors.message) : 'Unknown error';
      return {
        content: [{ type: 'text', text: `Failed to create/update Flow '${developerName}': ${err}` }],
        isError: true
      };
    }

    let activationNote = '';
    if (activate || status === 'Active') {
      try {
        // Tooling: find FlowDefinition by DeveloperName
        const defRes = await conn.tooling.query(`SELECT Id FROM FlowDefinition WHERE DeveloperName = '${developerName}' LIMIT 1`);
        if (defRes.records && defRes.records.length > 0) {
          // Find latest Flow version for this definition
          const flowRes = await conn.tooling.query(`SELECT Id, VersionNumber, Status FROM Flow WHERE Definition.DeveloperName = '${developerName}' ORDER BY VersionNumber DESC LIMIT 1`);
          if (flowRes.records && flowRes.records.length > 0) {
            const latest = flowRes.records[0];
            // Attempt to set ActiveVersionId on the definition
            await conn.tooling.sobject('FlowDefinition').update({
              Id: defRes.records[0].Id,
              ActiveVersionId: latest.Id
            });
            activationNote = ` Activation set to version ${latest.VersionNumber}.`;
          }
        }
      } catch (e: any) {
        activationNote = ` Activation attempt failed: ${e instanceof Error ? e.message : String(e)}`;
      }
    }

    return {
      content: [{ type: 'text', text: `Flow '${developerName}' created/updated successfully.${activationNote}` }],
      isError: false
    };
  } catch (e) {
    return {
      content: [{ type: 'text', text: `Error creating/updating Flow: ${e instanceof Error ? e.message : String(e)}` }],
      isError: true
    };
  }
}