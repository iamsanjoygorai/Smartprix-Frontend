import { apiFetch } from "./client";

import type { ApiResponse } from "@/types/api";

export const SPECIFICATION_DATA_TYPES = [
  "TEXT",
  "LONG_TEXT",
  "NUMBER",
  "DECIMAL",
  "BOOLEAN",
  "SELECT",
  "MULTI_SELECT",
  "DATE",
  "DATETIME",
  "RANGE",
  "URL",
  "IMAGE",
  "JSON",
] as const;

export type SpecificationDataType =
  (typeof SPECIFICATION_DATA_TYPES)[number];

export interface SpecificationOption {
  id?: string;
  label: string;
  value: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface SpecificationDefinition {
  id?: string;
  groupId?: string;
  name: string;
  slug: string;
  dataType: SpecificationDataType;
  unit?: string | null;
  isRequired: boolean;
  isFilterable: boolean;
  isComparable: boolean;
  isSearchable: boolean;
  sortOrder: number;
  configuration?: unknown;
  options: SpecificationOption[];
}

export interface SpecificationGroup {
  id?: string;
  schemaId?: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  definitions: SpecificationDefinition[];
}

export interface SpecificationCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface SpecificationSchema {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  version: number;
  isActive: boolean;
  categoryId: string;
  category?: SpecificationCategory;
  groups?: SpecificationGroup[];
  _count?: {
    groups: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSpecificationSchemaInput {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  groups: SpecificationGroupInput[];
}

export interface SpecificationGroupInput {
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
  definitions: SpecificationDefinitionInput[];
}

export interface SpecificationDefinitionInput {
  name: string;
  slug: string;
  dataType: SpecificationDataType;
  unit?: string;
  isRequired?: boolean;
  isFilterable?: boolean;
  isComparable?: boolean;
  isSearchable?: boolean;
  sortOrder?: number;
  configuration?: unknown;
  options?: SpecificationOptionInput[];
}

export interface SpecificationOptionInput {
  label: string;
  value: string;
  sortOrder?: number;
}

export async function getAdminSpecificationSchemas(): Promise<
  ApiResponse<SpecificationSchema[]>
> {
  return apiFetch<ApiResponse<SpecificationSchema[]>>(
    "/admin/specification-schemas",
  );
}

export async function getAdminSpecificationSchema(
  id: string,
): Promise<ApiResponse<SpecificationSchema>> {
  return apiFetch<ApiResponse<SpecificationSchema>>(
    `/admin/specification-schemas/${id}`,
  );
}

export async function createAdminSpecificationSchema(
  data: CreateSpecificationSchemaInput,
): Promise<ApiResponse<SpecificationSchema>> {
  return apiFetch<ApiResponse<SpecificationSchema>>(
    "/admin/specification-schemas",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export async function updateAdminSpecificationSchema(
  id: string,
  data: {
    name?: string;
    description?: string;
    groups?: SpecificationGroupInput[];
  },
): Promise<ApiResponse<SpecificationSchema>> {
  return apiFetch<ApiResponse<SpecificationSchema>>(
    `/admin/specification-schemas/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteAdminSpecificationSchema(
  id: string,
): Promise<ApiResponse<SpecificationSchema>> {
  return apiFetch<ApiResponse<SpecificationSchema>>(
    `/admin/specification-schemas/${id}`,
    {
      method: "DELETE",
    },
  );
}
