"use client";

import { useEffect, useState } from "react";

import AdminPermissionGuard from "@/components/admin/AdminPermissionGuard";

import { getAdminCategories } from "@/lib/api/categories";

import type { AdminCategory } from "@/lib/api/categories";

import {
  getAdminSpecificationSchema,
} from "@/lib/api/specification-schemas";

import type {
  SpecificationSchema,
} from "@/lib/api/specification-schemas";

import SpecificationSchemaBuilder from "../SpecificationSchemaBuilder";

export default function EditSpecificationSchemaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [schema, setSchema] =
    useState<SpecificationSchema | null>(null);

  const [categories, setCategories] =
    useState<AdminCategory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const { id } = await params;

        if (!id) {
          throw new Error(
            "Specification schema ID is required.",
          );
        }

        const [
          schemaResponse,
          categoriesResponse,
        ] = await Promise.all([
          getAdminSpecificationSchema(id),
          getAdminCategories(),
        ]);

        if (!schemaResponse.success) {
          throw new Error(
            schemaResponse.message ||
              "Failed to load specification schema.",
          );
        }

        if (!schemaResponse.data) {
          throw new Error(
            "Specification schema was not found.",
          );
        }

        if (!categoriesResponse.success) {
          throw new Error(
            categoriesResponse.message ||
              "Failed to load categories.",
          );
        }

        setSchema(schemaResponse.data);

        setCategories(
          Array.isArray(categoriesResponse.data)
            ? categoriesResponse.data
            : [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load specification schema.",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params]);

  return (
    <AdminPermissionGuard permission="products.update">
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : schema ? (
        <SpecificationSchemaBuilder
          mode="edit"
          categories={categories}
          initialSchema={schema}
        />
      ) : (
        <ErrorState
          message="Specification schema not found."
        />
      )}
    </AdminPermissionGuard>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="animate-pulse space-y-6">
          {/* Breadcrumb */}
          <div className="h-4 w-72 rounded bg-slate-200" />

          {/* Header */}
          <div className="space-y-3">
            <div className="h-4 w-40 rounded bg-slate-200" />
            <div className="h-10 w-96 rounded bg-slate-200" />
            <div className="h-4 w-[650px] max-w-full rounded bg-slate-200" />
          </div>

          {/* Schema information */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <div className="h-6 w-56 rounded bg-slate-200" />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="h-12 rounded-xl bg-slate-100" />
              <div className="h-12 rounded-xl bg-slate-100" />
              <div className="h-12 rounded-xl bg-slate-100" />
              <div className="h-20 rounded-xl bg-slate-100" />
            </div>
          </div>

          {/* Groups */}
          <div className="h-8 w-64 rounded bg-slate-200" />

          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <div className="h-10 w-48 rounded bg-slate-200" />

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <div className="h-12 rounded-xl bg-slate-100" />
              <div className="h-12 rounded-xl bg-slate-100" />
              <div className="h-12 rounded-xl bg-slate-100" />
            </div>

            <div className="mt-8 h-48 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>

          <h1 className="font-black text-red-800">
            Failed to load specification schema
          </h1>
        </div>

        <p className="text-sm leading-6 text-red-700">
          {message}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}