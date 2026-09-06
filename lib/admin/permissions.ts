export const ADMIN_PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",

  PRODUCTS_VIEW: "products.view",
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_UPDATE: "products.update",
  PRODUCTS_DELETE: "products.delete",

  NEWS_VIEW: "news.view",
  NEWS_CREATE: "news.create",
  NEWS_UPDATE: "news.update",
  NEWS_DELETE: "news.delete",
  NEWS_PUBLISH: "news.publish",

  MEDIA_VIEW: "media.view",
  MEDIA_UPLOAD: "media.upload",
  MEDIA_DELETE: "media.delete",

  USERS_VIEW: "users.view",
  USERS_UPDATE: "users.update",
  USERS_DISABLE: "users.disable",
  USERS_DELETE: "users.delete",

  ADMINS_VIEW: "admins.view",
  ADMINS_CREATE: "admins.create",
  ADMINS_UPDATE: "admins.update",
  ADMINS_DELETE: "admins.delete",

  SETTINGS_VIEW: "settings.view",
  SETTINGS_UPDATE: "settings.update",

  ACCOUNT_PASSWORD_CHANGE: "account.password.change",

  AUDIT_VIEW: "audit.view",
} as const;

export type AdminPermission =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];
