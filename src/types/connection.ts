/**
 * Enum representing the available Salesforce connection types
 */
export enum ConnectionType {
  /**
   * Standard username/password authentication with security token
   * Requires SALESFORCE_USERNAME, SALESFORCE_PASSWORD, and optionally SALESFORCE_TOKEN
   */
  User_Password = 'User_Password',

  /**
   * OAuth 2.0 Client Credentials Flow using client ID and secret
   * Requires SALESFORCE_CLIENT_ID and SALESFORCE_CLIENT_SECRET
   */
  OAuth_2_0_Client_Credentials = 'OAuth_2_0_Client_Credentials',

  /**
   * OAuth 2.0 JWT Bearer Flow (Server-to-Server) using a connected app and private key
   * Requires SALESFORCE_CLIENT_ID, SALESFORCE_USERNAME, and either SALESFORCE_JWT_PRIVATE_KEY or SALESFORCE_JWT_PRIVATE_KEY_PATH
   */
  JWT_Bearer = 'JWT_Bearer'
}

/**
 * Configuration options for Salesforce connection
 */
export interface ConnectionConfig {
  /**
   * The type of connection to use
   * @default ConnectionType.User_Password
   */
  type?: ConnectionType;

  /**
   * The login URL for Salesforce instance
   * @default 'https://login.salesforce.com'
   */
  loginUrl?: string;
}
