export const APP_NAME = "Neobank Stellar";

export interface AppInfo {
  name: string;
  version: string;
}

export function getAppInfo(version: string): AppInfo {
  return { name: APP_NAME, version };
}

export function greet(name: string): string {
  return `Hola desde ${APP_NAME}, ${name}`;
}
