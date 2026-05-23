/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as ai from "../ai.js";
import type * as brandVoice from "../brandVoice.js";
import type * as connections from "../connections.js";
import type * as conversations from "../conversations.js";
import type * as crons from "../crons.js";
import type * as customers from "../customers.js";
import type * as google from "../google.js";
import type * as groups from "../groups.js";
import type * as http from "../http.js";
import type * as oauthState from "../oauthState.js";
import type * as onboarding from "../onboarding.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as sites from "../sites.js";
import type * as trustpilot from "../trustpilot.js";
import type * as users from "../users.js";
import type * as whatsapp from "../whatsapp.js";
import type * as whatsappAccounts from "../whatsappAccounts.js";
import type * as whatsappEnquiries from "../whatsappEnquiries.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ai: typeof ai;
  brandVoice: typeof brandVoice;
  connections: typeof connections;
  conversations: typeof conversations;
  crons: typeof crons;
  customers: typeof customers;
  google: typeof google;
  groups: typeof groups;
  http: typeof http;
  oauthState: typeof oauthState;
  onboarding: typeof onboarding;
  reviews: typeof reviews;
  seed: typeof seed;
  sites: typeof sites;
  trustpilot: typeof trustpilot;
  users: typeof users;
  whatsapp: typeof whatsapp;
  whatsappAccounts: typeof whatsappAccounts;
  whatsappEnquiries: typeof whatsappEnquiries;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
