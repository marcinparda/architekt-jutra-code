import type { PluginObject } from "../../sdk";

export interface Courier {
  objectId: string;
  name: string;
  code: string;
  enabled: boolean;
}

export interface ShippingMethod {
  objectId: string;
  name: string;
  courierId: string;
  description: string;
}

export interface ProductShippingData {
  disabledMethods: string[];
}

export function toCourier(obj: PluginObject): Courier {
  return {
    objectId: obj.objectId,
    name: obj.data.name as string,
    code: obj.data.code as string,
    enabled: obj.data.enabled as boolean,
  };
}

export function toShippingMethod(obj: PluginObject): ShippingMethod {
  return {
    objectId: obj.objectId,
    name: obj.data.name as string,
    courierId: obj.data.courierId as string,
    description: (obj.data.description as string) ?? "",
  };
}

export function toProductShippingData(raw: Record<string, unknown> | null): ProductShippingData {
  if (!raw) return { disabledMethods: [] };
  return { disabledMethods: (raw.disabledMethods as string[]) ?? [] };
}
