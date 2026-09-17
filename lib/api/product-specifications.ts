import { apiFetch } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";

export type SpecificationDataType =
  | "TEXT"
  | "LONG_TEXT"
  | "NUMBER"
  | "DECIMAL"
  | "BOOLEAN"
  | "SELECT"
  | "MULTI_SELECT"
  | "DATE"
  | "DATETIME"
  | "RANGE"
  | "URL"
  | "IMAGE"
  | "JSON";

export interface ProductSpecificationOption {
  id: string;
  label: string;
  value: string;
  isActive: boolean;
}

export interface ProductSpecificationDefinition {
  id: string;
  name: string;
  slug: string;
  dataType: SpecificationDataType | string;
  unit: string | null;
  isRequired: boolean;
  isFilterable: boolean;
  isComparable: boolean;
  isSearchable: boolean;
  sortOrder: number;
  configuration?: unknown;
  options: ProductSpecificationOption[];
}

export interface ProductSpecificationGroup {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  definitions: ProductSpecificationDefinition[];
}

export interface ProductSpecificationSchema {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  version: number;
  isActive: boolean;
  categoryId: string;
  groups: ProductSpecificationGroup[];
}

export interface ProductSpecificationValue {
  id: string;
  productId: string;
  definitionId: string | null;
  valueText: string | null;
  valueNumber: string | number | null;
  valueBoolean: boolean | null;
  valueDate: string | null;
  valueJson: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSpecificationsResponse {
  product: unknown;
  schema: ProductSpecificationSchema;
  values: ProductSpecificationValue[];
}

export interface ProductSpecificationInput {
  definitionId: string;
  value: unknown;
}

export interface UpdateProductSpecificationsResponse {
  schema: ProductSpecificationSchema;
  values: ProductSpecificationValue[];
}

export async function getProductSpecifications(
  productId: string,
) {
  return apiFetch<
    ApiResponse<ProductSpecificationsResponse>
  >(`/admin/products/${productId}/specifications`);
}

export async function updateProductSpecifications(
  productId: string,
  values: ProductSpecificationInput[],
) {
  return apiFetch<
    ApiResponse<UpdateProductSpecificationsResponse>
  >(`/admin/products/${productId}/specifications`, {
    method: "PUT",
    body: JSON.stringify({
      values,
    }),
  });
}