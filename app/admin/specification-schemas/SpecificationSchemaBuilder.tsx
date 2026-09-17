"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import AdminPermissionGuard from "@/components/admin/AdminPermissionGuard";

import {
  createAdminSpecificationSchema,
  updateAdminSpecificationSchema,
  SPECIFICATION_DATA_TYPES,
} from "@/lib/api/specification-schemas";

import type {
  SpecificationDataType,
  SpecificationDefinitionInput,
  SpecificationGroupInput,
  SpecificationSchema,
} from "@/lib/api/specification-schemas";

import type { AdminCategory } from "@/lib/api/categories";

type BuilderMode = "create" | "edit";

interface SpecificationSchemaBuilderProps {
  mode: BuilderMode;
  categories: AdminCategory[];
  initialSchema?: SpecificationSchema;
}

interface BuilderOption {
  id?: string;
  label: string;
  value: string;
  sortOrder: number;
}

interface BuilderDefinition
  extends SpecificationDefinitionInput {
  id?: string;
  options: BuilderOption[];
}

interface BuilderGroup extends SpecificationGroupInput {
  id?: string;
  definitions: BuilderDefinition[];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createDefinition(
  sortOrder = 0,
): BuilderDefinition {
  return {
    name: "",
    slug: "",
    dataType: "TEXT",
    unit: "",
    isRequired: false,
    isFilterable: false,
    isComparable: false,
    isSearchable: false,
    sortOrder,
    configuration: undefined,
    options: [],
  };
}

function createGroup(sortOrder = 0): BuilderGroup {
  return {
    name: "",
    slug: "",
    description: "",
    sortOrder,
    definitions: [createDefinition(0)],
  };
}

function normalizeInitialGroups(
  schema?: SpecificationSchema,
): BuilderGroup[] {
  if (!schema?.groups?.length) {
    return [createGroup(0)];
  }

  return schema.groups.map((group, groupIndex) => ({
    id: group.id,
    name: group.name,
    slug: group.slug,
    description: group.description ?? "",
    sortOrder: group.sortOrder ?? groupIndex,
    definitions: group.definitions.map(
      (definition, definitionIndex) => ({
        id: definition.id,
        name: definition.name,
        slug: definition.slug,
        dataType: definition.dataType,
        unit: definition.unit ?? "",
        isRequired: definition.isRequired ?? false,
        isFilterable: definition.isFilterable ?? false,
        isComparable: definition.isComparable ?? false,
        isSearchable: definition.isSearchable ?? false,
        sortOrder:
          definition.sortOrder ?? definitionIndex,
        configuration: definition.configuration,
        options: (definition.options ?? []).map(
          (option, optionIndex) => ({
            id: option.id,
            label: option.label,
            value: option.value,
            sortOrder:
              option.sortOrder ?? optionIndex,
          }),
        ),
      }),
    ),
  }));
}

export default function SpecificationSchemaBuilder({
  mode,
  categories,
  initialSchema,
}: SpecificationSchemaBuilderProps) {

  const router = useRouter();
  const [name, setName] = useState(
    initialSchema?.name ?? "",
  );

  const [slug, setSlug] = useState(
    initialSchema?.slug ?? "",
  );

  const [description, setDescription] = useState(
    initialSchema?.description ?? "",
  );

  const [categoryId, setCategoryId] = useState(
    initialSchema?.categoryId ?? "",
  );

  const [groups, setGroups] = useState<BuilderGroup[]>(
    () => normalizeInitialGroups(initialSchema),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) => category.id === categoryId,
      ),
    [categories, categoryId],
  );

  function updateGroup(
    groupIndex: number,
    patch: Partial<BuilderGroup>,
  ) {
    setGroups((current) =>
      current.map((group, index) =>
        index === groupIndex
          ? { ...group, ...patch }
          : group,
      ),
    );
  }

  function addGroup() {
    setGroups((current) => [
      ...current,
      createGroup(current.length),
    ]);
  }

  function removeGroup(groupIndex: number) {
    setGroups((current) =>
      current
        .filter((_, index) => index !== groupIndex)
        .map((group, index) => ({
          ...group,
          sortOrder: index,
        })),
    );
  }

  function updateDefinition(
    groupIndex: number,
    definitionIndex: number,
    patch: Partial<BuilderDefinition>,
  ) {
    setGroups((current) =>
      current.map((group, currentGroupIndex) => {
        if (currentGroupIndex !== groupIndex) {
          return group;
        }

        return {
          ...group,
          definitions: group.definitions.map(
            (definition, currentDefinitionIndex) =>
              currentDefinitionIndex === definitionIndex
                ? {
                    ...definition,
                    ...patch,
                  }
                : definition,
          ),
        };
      }),
    );
  }

  function addDefinition(groupIndex: number) {
    setGroups((current) =>
      current.map((group, index) => {
        if (index !== groupIndex) {
          return group;
        }

        return {
          ...group,
          definitions: [
            ...group.definitions,
            createDefinition(
              group.definitions.length,
            ),
          ],
        };
      }),
    );
  }

  function removeDefinition(
    groupIndex: number,
    definitionIndex: number,
  ) {
    setGroups((current) =>
      current.map((group, currentGroupIndex) => {
        if (currentGroupIndex !== groupIndex) {
          return group;
        }

        return {
          ...group,
          definitions: group.definitions
            .filter(
              (_, index) =>
                index !== definitionIndex,
            )
            .map((definition, index) => ({
              ...definition,
              sortOrder: index,
            })),
        };
      }),
    );
  }

  function updateOption(
    groupIndex: number,
    definitionIndex: number,
    optionIndex: number,
    patch: Partial<BuilderOption>,
  ) {
    setGroups((current) =>
      current.map((group, currentGroupIndex) => {
        if (currentGroupIndex !== groupIndex) {
          return group;
        }

        return {
          ...group,
          definitions: group.definitions.map(
            (definition, currentDefinitionIndex) => {
              if (
                currentDefinitionIndex !==
                definitionIndex
              ) {
                return definition;
              }

              return {
                ...definition,
                options: definition.options.map(
                  (option, currentOptionIndex) =>
                    currentOptionIndex === optionIndex
                      ? {
                          ...option,
                          ...patch,
                        }
                      : option,
                ),
              };
            },
          ),
        };
      }),
    );
  }

  function addOption(
    groupIndex: number,
    definitionIndex: number,
  ) {
    setGroups((current) =>
      current.map((group, currentGroupIndex) => {
        if (currentGroupIndex !== groupIndex) {
          return group;
        }

        return {
          ...group,
          definitions: group.definitions.map(
            (definition, currentDefinitionIndex) => {
              if (
                currentDefinitionIndex !==
                definitionIndex
              ) {
                return definition;
              }

              return {
                ...definition,
                options: [
                  ...definition.options,
                  {
                    label: "",
                    value: "",
                    sortOrder:
                      definition.options.length,
                  },
                ],
              };
            },
          ),
        };
      }),
    );
  }

  function removeOption(
    groupIndex: number,
    definitionIndex: number,
    optionIndex: number,
  ) {
    setGroups((current) =>
      current.map((group, currentGroupIndex) => {
        if (currentGroupIndex !== groupIndex) {
          return group;
        }

        return {
          ...group,
          definitions: group.definitions.map(
            (definition, currentDefinitionIndex) => {
              if (
                currentDefinitionIndex !==
                definitionIndex
              ) {
                return definition;
              }

              return {
                ...definition,
                options: definition.options
                  .filter(
                    (_, index) =>
                      index !== optionIndex,
                  )
                  .map((option, index) => ({
                    ...option,
                    sortOrder: index,
                  })),
              };
            },
          ),
        };
      }),
    );
  }

  function handleSchemaNameChange(value: string) {
    setName(value);

    if (mode === "create") {
      setSlug(slugify(value));
    }
  }

  function handleGroupNameChange(
    groupIndex: number,
    value: string,
  ) {
    const currentGroup = groups[groupIndex];

    updateGroup(groupIndex, {
      name: value,
      slug:
        !currentGroup?.slug ||
        currentGroup.slug ===
          slugify(currentGroup.name)
          ? slugify(value)
          : currentGroup.slug,
    });
  }

  function handleDefinitionNameChange(
    groupIndex: number,
    definitionIndex: number,
    value: string,
  ) {
    const definition =
      groups[groupIndex]?.definitions[
        definitionIndex
      ];

    updateDefinition(
      groupIndex,
      definitionIndex,
      {
        name: value,
        slug:
          !definition?.slug ||
          definition.slug ===
            slugify(definition.name)
            ? slugify(value)
            : definition.slug,
      },
    );
  }

  function validate() {
    if (!name.trim()) {
      return "Schema name is required.";
    }

    if (!slug.trim()) {
      return "Schema slug is required.";
    }

    if (!categoryId) {
      return "Please select a category.";
    }

    if (!groups.length) {
      return "At least one specification group is required.";
    }

    for (
      let groupIndex = 0;
      groupIndex < groups.length;
      groupIndex++
    ) {
      const group = groups[groupIndex];

      if (!group.name.trim()) {
        return `Group ${groupIndex + 1} name is required.`;
      }

      if (!group.slug.trim()) {
        return `Group ${groupIndex + 1} slug is required.`;
      }

      if (!group.definitions.length) {
        return `Group "${group.name}" must contain at least one definition.`;
      }

      for (
        let definitionIndex = 0;
        definitionIndex <
        group.definitions.length;
        definitionIndex++
      ) {
        const definition =
          group.definitions[definitionIndex];

        if (!definition.name.trim()) {
          return `Definition ${
            definitionIndex + 1
          } in "${group.name}" requires a name.`;
        }

        if (!definition.slug.trim()) {
          return `Definition "${
            definition.name
          }" requires a slug.`;
        }

        if (
          definition.dataType === "SELECT" ||
          definition.dataType === "MULTI_SELECT"
        ) {
          if (!definition.options.length) {
            return `"${definition.name}" requires at least one option.`;
          }

          for (
            let optionIndex = 0;
            optionIndex <
            definition.options.length;
            optionIndex++
          ) {
            const option =
              definition.options[optionIndex];

            if (!option.label.trim()) {
              return `Option ${
                optionIndex + 1
              } in "${definition.name}" requires a label.`;
            }

            if (!option.value.trim()) {
              return `Option ${
                optionIndex + 1
              } in "${definition.name}" requires a value.`;
            }
          }
        } else if (definition.options.length) {
          return `"${definition.name}" cannot have options because its type is ${definition.dataType}.`;
        }
      }
    }

    return "";
  }

  async function handleSave() {
    setError("");
    setSuccess("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      categoryId,
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      groups: groups.map((group, groupIndex) => ({
        name: group.name.trim(),
        slug: group.slug.trim(),
        description:
          group.description?.trim() || undefined,
        sortOrder: groupIndex,
        definitions: group.definitions.map(
          (definition, definitionIndex) => ({
            name: definition.name.trim(),
            slug: definition.slug.trim(),
            dataType:
              definition.dataType as SpecificationDataType,
            unit:
              definition.unit?.trim() || undefined,
            isRequired:
              definition.isRequired ?? false,
            isFilterable:
              definition.isFilterable ?? false,
            isComparable:
              definition.isComparable ?? false,
            isSearchable:
              definition.isSearchable ?? false,
            sortOrder: definitionIndex,
            configuration:
              definition.configuration,
            ...(definition.dataType ===
              "SELECT" ||
            definition.dataType === "MULTI_SELECT"
              ? {
                  options:
                    definition.options.map(
                      (option, optionIndex) => ({
                        label: option.label.trim(),
                        value: option.value.trim(),
                        sortOrder: optionIndex,
                      }),
                    ),
                }
              : {}),
          }),
        ),
      })),
    };

    try {
      setSaving(true);

      const response =
        mode === "create"
          ? await createAdminSpecificationSchema(
              payload,
            )
          : await updateAdminSpecificationSchema(
              initialSchema!.id,
              {
                name: payload.name,
                description: payload.description,
                groups: payload.groups,
              },
            );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Failed to save specification schema.",
        );
      }

      setSuccess(
        mode === "create"
          ? "Specification schema created successfully."
          : "Specification schema updated successfully.",
      );

      window.setTimeout(() => {
  router.push("/admin/specification-schemas");
}, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save specification schema.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPermissionGuard
      permission={
        mode === "create"
          ? "products.create"
          : "products.update"
      }
    >
      <div className="min-h-screen bg-slate-50 pb-32">
        <div className="mx-auto max-w-[1450px] px-6 py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link
              href="/admin"
              className="transition hover:text-indigo-600"
            >
              Admin
            </Link>

            <span>/</span>

            <Link
              href="/admin/specification-schemas"
              className="transition hover:text-indigo-600"
            >
              Specification Schemas
            </Link>

            <span>/</span>

            <span className="font-medium text-slate-800">
              {mode === "create"
                ? "Create"
                : "Edit"}
            </span>
          </div>

          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
                Specification CMS
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-950">
                {mode === "create"
                  ? "Create Specification Schema"
                  : "Edit Specification Schema"}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Define reusable product specification
                groups, fields, data types, validation
                options, filters and comparison
                behavior.
              </p>
            </div>

            <Link
              href="/admin/specification-schemas"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              Back to Schemas
            </Link>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
              <div className="font-bold">
                Unable to save schema
              </div>
              <div className="mt-1">
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
              <div className="font-bold">
                {success}
              </div>
            </div>
          )}

          {/* Basic information */}
          <section className="mb-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50 px-6 py-5">
              <h2 className="text-lg font-black text-slate-900">
                Schema Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Basic metadata used to identify and
                organize this schema.
              </p>
            </div>

            <div className="grid gap-5 p-6 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Schema Name
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    handleSchemaNameChange(
                      event.target.value,
                    )
                  }
                  placeholder="Mobile Phone Specifications"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Slug
                </label>

                <input
                  value={slug}
                  onChange={(event) =>
                    setSlug(
                      slugify(
                        event.target.value,
                      ),
                    )
                  }
                  placeholder="mobile-phone-specifications-v1"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Lowercase letters, numbers and hyphens.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Category
                </label>

                <select
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(
                      event.target.value,
                    )
                  }
                  disabled={mode === "edit"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

                {selectedCategory && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Category slug:{" "}
                    {selectedCategory.slug}
                  </p>
                )}

                {mode === "edit" && (
                  <p className="mt-1.5 text-xs text-amber-600">
                    Category cannot be changed while
                    editing an existing schema.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  rows={3}
                  placeholder="Specification structure used for mobile phone products."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>
          </section>

          {/* Groups */}
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Specification Groups
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Organize related specifications into
                logical sections.
              </p>
            </div>

            <button
              type="button"
              onClick={addGroup}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <span className="text-lg leading-none">
                +
              </span>
              Add Group
            </button>
          </div>

          <div className="space-y-7">
            {groups.map((group, groupIndex) => (
              <section
                key={
                  group.id ??
                  `group-${groupIndex}`
                }
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Group header */}
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/50 px-6 py-5">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-black text-white shadow-sm">
                        {groupIndex + 1}
                      </div>

                      <div>
                        <h3 className="font-black text-slate-900">
                          Group {groupIndex + 1}
                        </h3>

                        <p className="text-xs text-slate-500">
                          {group.definitions.length}{" "}
                          definition
                          {group.definitions.length !==
                          1
                            ? "s"
                            : ""}
                        </p>
                      </div>
                    </div>

                    {groups.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeGroup(groupIndex)
                        }
                        className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                      >
                        Remove Group
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  {/* Group details */}
                  <div className="grid gap-5 lg:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Group Name
                      </label>

                      <input
                        value={group.name}
                        onChange={(event) =>
                          handleGroupNameChange(
                            groupIndex,
                            event.target.value,
                          )
                        }
                        placeholder="Display"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Group Slug
                      </label>

                      <input
                        value={group.slug}
                        onChange={(event) =>
                          updateGroup(
                            groupIndex,
                            {
                              slug: slugify(
                                event.target.value,
                              ),
                            },
                          )
                        }
                        placeholder="display"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Description
                      </label>

                      <input
                        value={
                          group.description ?? ""
                        }
                        onChange={(event) =>
                          updateGroup(
                            groupIndex,
                            {
                              description:
                                event.target.value,
                            },
                          )
                        }
                        placeholder="Display-related specifications"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  {/* Definitions */}
                  <div>
                    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <h4 className="font-black text-slate-900">
                          Definitions
                        </h4>

                        <p className="text-xs text-slate-500">
                          Individual fields available
                          inside this group.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          addDefinition(
                            groupIndex,
                          )
                        }
                        className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        + Add Definition
                      </button>
                    </div>

                    <div className="space-y-5">
                      {group.definitions.map(
                        (
                          definition,
                          definitionIndex,
                        ) => (
                          <div
                            key={
                              definition.id ??
                              `definition-${groupIndex}-${definitionIndex}`
                            }
                            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
                          >
                            <div className="mb-5 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-black text-slate-600 shadow-sm ring-1 ring-slate-200">
                                  Field{" "}
                                  {definitionIndex +
                                    1}
                                </span>

                                {definition.dataType && (
                                  <span className="rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                    {
                                      definition.dataType
                                    }
                                  </span>
                                )}
                              </div>

                              {group.definitions
                                .length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeDefinition(
                                      groupIndex,
                                      definitionIndex,
                                    )
                                  }
                                  className="text-xs font-bold text-red-600 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            <div className="grid gap-5 lg:grid-cols-4">
                              <div className="lg:col-span-2">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                                  Name
                                </label>

                                <input
                                  value={
                                    definition.name
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    handleDefinitionNameChange(
                                      groupIndex,
                                      definitionIndex,
                                      event.target
                                        .value,
                                    )
                                  }
                                  placeholder="Display Size"
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                />
                              </div>

                              <div className="lg:col-span-2">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                                  Slug
                                </label>

                                <input
                                  value={
                                    definition.slug
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateDefinition(
                                      groupIndex,
                                      definitionIndex,
                                      {
                                        slug: slugify(
                                          event.target
                                            .value,
                                        ),
                                      },
                                    )
                                  }
                                  placeholder="display-size"
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                                  Data Type
                                </label>

                                <select
                                  value={
                                    definition.dataType
                                  }
                                  onChange={(
                                    event,
                                  ) => {
                                    const dataType =
                                      event.target
                                        .value as SpecificationDataType;

                                    updateDefinition(
                                      groupIndex,
                                      definitionIndex,
                                      {
                                        dataType,
                                        options:
                                          dataType ===
                                            "SELECT" ||
                                          dataType ===
                                            "MULTI_SELECT"
                                            ? definition.options
                                            : [],
                                      },
                                    );
                                  }}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                >
                                  {SPECIFICATION_DATA_TYPES.map(
                                    (dataType) => (
                                      <option
                                        key={
                                          dataType
                                        }
                                        value={
                                          dataType
                                        }
                                      >
                                        {dataType}
                                      </option>
                                    ),
                                  )}
                                </select>
                              </div>

                              <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                                  Unit
                                </label>

                                <input
                                  value={
                                    definition.unit ??
                                    ""
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateDefinition(
                                      groupIndex,
                                      definitionIndex,
                                      {
                                        unit: event.target
                                          .value,
                                      },
                                    )
                                  }
                                  placeholder="GB, Hz, inches..."
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                />
                              </div>
                            </div>

                            {/* Flags */}
<div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <ToggleField
    label="Required"
    checked={definition.isRequired ?? false}
    onChange={(checked) =>
      updateDefinition(
        groupIndex,
        definitionIndex,
        {
          isRequired: checked,
        },
      )
    }
  />

  <ToggleField
    label="Filterable"
    checked={definition.isFilterable ?? false}
    onChange={(checked) =>
      updateDefinition(
        groupIndex,
        definitionIndex,
        {
          isFilterable: checked,
        },
      )
    }
  />

  <ToggleField
    label="Comparable"
    checked={definition.isComparable ?? false}
    onChange={(checked) =>
      updateDefinition(
        groupIndex,
        definitionIndex,
        {
          isComparable: checked,
        },
      )
    }
  />

  <ToggleField
    label="Searchable"
    checked={definition.isSearchable ?? false}
    onChange={(checked) =>
      updateDefinition(
        groupIndex,
        definitionIndex,
        {
          isSearchable: checked,
        },
      )
    }
  />
</div>

                            {/* Options */}
                            {(definition.dataType ===
                              "SELECT" ||
                              definition.dataType ===
                                "MULTI_SELECT") && (
                              <div className="mt-5 rounded-2xl border border-indigo-100 bg-white p-5">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                  <div>
                                    <h5 className="text-sm font-black text-slate-900">
                                      Selection Options
                                    </h5>

                                    <p className="mt-1 text-xs text-slate-500">
                                      Add allowed values
                                      for this field.
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      addOption(
                                        groupIndex,
                                        definitionIndex,
                                      )
                                    }
                                    className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
                                  >
                                    + Add Option
                                  </button>
                                </div>

                                {definition.options
                                  .length === 0 ? (
                                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
                                    No options added
                                    yet.
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {definition.options.map(
                                      (
                                        option,
                                        optionIndex,
                                      ) => (
                                        <div
                                          key={
                                            option.id ??
                                            `option-${groupIndex}-${definitionIndex}-${optionIndex}`
                                          }
                                          className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
                                        >
                                          <input
                                            value={
                                              option.label
                                            }
                                            onChange={(
                                              event,
                                            ) =>
                                              updateOption(
                                                groupIndex,
                                                definitionIndex,
                                                optionIndex,
                                                {
                                                  label:
                                                    event
                                                      .target
                                                      .value,
                                                },
                                              )
                                            }
                                            placeholder="Label: 8 GB"
                                            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                          />

                                          <input
                                            value={
                                              option.value
                                            }
                                            onChange={(
                                              event,
                                            ) =>
                                              updateOption(
                                                groupIndex,
                                                definitionIndex,
                                                optionIndex,
                                                {
                                                  value:
                                                    event
                                                      .target
                                                      .value,
                                                },
                                              )
                                            }
                                            placeholder="Value: 8"
                                            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                          />

                                          <button
                                            type="button"
                                            onClick={() =>
                                              removeOption(
                                                groupIndex,
                                                definitionIndex,
                                                optionIndex,
                                              )
                                            }
                                            className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Sticky save footer */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mx-auto flex max-w-[1450px] flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              <span className="font-bold text-slate-700">
                {groups.length}
              </span>{" "}
              group
              {groups.length !== 1 ? "s" : ""} ·{" "}
              <span className="font-bold text-slate-700">
                {groups.reduce(
                  (total, group) =>
                    total +
                    group.definitions.length,
                  0,
                )}
              </span>{" "}
              definition
              {groups.reduce(
                (total, group) =>
                  total + group.definitions.length,
                0,
              ) !== 1
                ? "s"
                : ""}
            </div>

            <div className="flex gap-3">
              <Link
                href="/admin/specification-schemas"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-7 py-3 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : mode === "create"
                    ? "Create Schema"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminPermissionGuard>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-50/30">
      <span className="text-sm font-bold text-slate-700">
        {label}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked
            ? "bg-indigo-600"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </label>
  );
}