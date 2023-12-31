import "@shopify/shopify-app-remix/adapters/node";
import {
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
  LATEST_API_VERSION,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-10";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    CUSTOMERS_DATA_REQUEST: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    CUSTOMERS_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    PRODUCTS_CREATE: {
      deliveryMethod: DeliveryMethod.EventBridge,
      arn: process.env.AWS_ARN_SOURCE_EVENT || ""
    },
    PRODUCTS_UPDATE: {
      deliveryMethod: DeliveryMethod.EventBridge,
      arn: process.env.AWS_ARN_SOURCE_EVENT || ""
    },
    ORDERS_CREATE: {
      deliveryMethod: DeliveryMethod.EventBridge,
      arn: process.env.AWS_ARN_SOURCE_EVENT || ""
    },
    CUSTOMERS_CREATE: {
      deliveryMethod: DeliveryMethod.EventBridge,
      arn: process.env.AWS_ARN_SOURCE_EVENT || ""
    },
    CUSTOMERS_UPDATE: {
      deliveryMethod: DeliveryMethod.EventBridge,
      arn: process.env.AWS_ARN_SOURCE_EVENT || ""
    },
    CUSTOMERS_DELETE: {
      deliveryMethod: DeliveryMethod.EventBridge,
      arn: process.env.AWS_ARN_SOURCE_EVENT || ""
    },
    CUSTOMERS_EMAIL_MARKETING_CONSENT_UPDATE: {
      deliveryMethod: DeliveryMethod.EventBridge,
      arn: process.env.AWS_ARN_SOURCE_EVENT || ""
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    },
  },
  future: {
    v3_webhookAdminContext: true,
    v3_authenticatePublic: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = LATEST_API_VERSION;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
