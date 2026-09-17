"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getProductSpecifications,
  updateProductSpecifications,
  type ProductSpecificationDefinition,
  type ProductSpecificationGroup,
  type ProductSpecificationInput,
  type ProductSpecificationsResponse,
} from "@/lib/api/product-specifications";

interface ProductSpecificationEditorProps {
  productId: string;
  refreshKey?: number;
}

type SpecificationState = Record<string, unknown>;

function normalizeInitialValue(
  definition: ProductSpecificationDefinition,
  value: ProductSpecificationsResponse["values"][number] | undefined,
): unknown {
  if (!value) {
    if (definition.dataType === "BOOLEAN") {
      return false;
    }

    if (definition.dataType === "MULTI_SELECT") {
      return [];
    }

    return "";
  }

  switch (definition.dataType) {
    case "TEXT":
    case "LONG_TEXT":
    case "SELECT":
    case "URL":
    case "IMAGE":
      return value.valueText ?? "";

    case "NUMBER":
    case "DECIMAL":
      return value.valueNumber ?? "";

    case "BOOLEAN":
      return value.valueBoolean ?? false;

    case "DATE": {
      if (!value.valueDate) return "";

      return new Date(value.valueDate)
        .toISOString()
        .slice(0, 10);
    }

    case "DATETIME": {
      if (!value.valueDate) return "";

      const date = new Date(value.valueDate);

      return date.toISOString().slice(0, 16);
    }

    case "MULTI_SELECT":
    case "RANGE":
    case "JSON":
      return value.valueJson ?? "";

    default:
      return value.valueText ?? "";
  }
}

function isEmptyValue(
  definition: ProductSpecificationDefinition,
  value: unknown,
) {
  if (definition.dataType === "BOOLEAN") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  return false;
}

function formatValueForApi(
  definition: ProductSpecificationDefinition,
  value: unknown,
): unknown {
  switch (definition.dataType) {
    case "NUMBER":
      return Number(value);

    case "DECIMAL":
      return Number(value);

    case "BOOLEAN":
      return Boolean(value);

    case "DATE":
      return value;

    case "DATETIME":
      return value;

    case "MULTI_SELECT":
      return Array.isArray(value) ? value : [];

    case "RANGE":
    case "JSON":
      return value;

    default:
      return typeof value === "string"
        ? value.trim()
        : value;
  }
}

function InputLabel({
  definition,
}: {
  definition: ProductSpecificationDefinition;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <label className="text-sm font-bold text-slate-700">
        {definition.name}

        {definition.isRequired && (
          <span className="ml-1 text-rose-500">*</span>
        )}
      </label>

      {definition.unit && (
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          {definition.unit}
        </span>
      )}
    </div>
  );
}

function fieldClassName() {
  return "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60";
}

function renderField(
  definition: ProductSpecificationDefinition,
  value: unknown,
  setValue: (value: unknown) => void,
  disabled: boolean,
) {
  const inputClass = fieldClassName();

  switch (definition.dataType) {
    case "LONG_TEXT":
      return (
        <textarea
          value={String(value ?? "")}
          onChange={(event) =>
            setValue(event.target.value)
          }
          rows={4}
          disabled={disabled}
          className={`${inputClass} resize-y leading-6`}
          placeholder={`Enter ${definition.name.toLowerCase()}...`}
        />
      );

    case "NUMBER":
      return (
        <div className="relative">
          <input
            type="number"
            value={String(value ?? "")}
            onChange={(event) =>
              setValue(event.target.value)
            }
            disabled={disabled}
            className={inputClass}
            placeholder="Enter number"
          />

          {definition.unit && (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              {definition.unit}
            </span>
          )}
        </div>
      );

    case "DECIMAL":
      return (
        <div className="relative">
          <input
            type="number"
            step="any"
            value={String(value ?? "")}
            onChange={(event) =>
              setValue(event.target.value)
            }
            disabled={disabled}
            className={inputClass}
            placeholder="Enter value"
          />

          {definition.unit && (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              {definition.unit}
            </span>
          )}
        </div>
      );

    case "BOOLEAN":
      return (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setValue(!Boolean(value))}
          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 transition ${
            value
              ? "border-violet-300 bg-violet-50"
              : "border-slate-200 bg-slate-50"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <span
            className={`text-sm font-bold ${
              value
                ? "text-violet-700"
                : "text-slate-500"
            }`}
          >
            {value ? "Yes" : "No"}
          </span>

          <span
            className={`relative h-6 w-11 rounded-full transition ${
              value
                ? "bg-violet-600"
                : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                value ? "left-6" : "left-1"
              }`}
            />
          </span>
        </button>
      );

    case "SELECT":
      return (
        <select
          value={String(value ?? "")}
          onChange={(event) =>
            setValue(event.target.value)
          }
          disabled={disabled}
          className={inputClass}
        >
          <option value="">
            Select {definition.name.toLowerCase()}
          </option>

          {definition.options.map((option) => (
            <option
              key={option.id}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      );

    case "MULTI_SELECT": {
      const selected = Array.isArray(value)
        ? value.map(String)
        : [];

      return (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          {definition.options.length === 0 ? (
            <p className="px-2 py-1 text-xs text-slate-400">
              No options configured.
            </p>
          ) : (
            definition.options.map((option) => {
              const checked = selected.includes(
                option.value,
              );

              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                    checked
                      ? "bg-violet-100 text-violet-800"
                      : "hover:bg-white"
                  } ${
                    disabled
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => {
                      const next = checked
                        ? selected.filter(
                            (item) =>
                              item !== option.value,
                          )
                        : [
                            ...selected,
                            option.value,
                          ];

                      setValue(next);
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />

                  <span className="text-sm font-semibold">
                    {option.label}
                  </span>
                </label>
              );
            })
          )}
        </div>
      );
    }

    case "DATE":
      return (
        <input
          type="date"
          value={String(value ?? "")}
          onChange={(event) =>
            setValue(event.target.value)
          }
          disabled={disabled}
          className={inputClass}
        />
      );

    case "DATETIME":
      return (
        <input
          type="datetime-local"
          value={String(value ?? "")}
          onChange={(event) =>
            setValue(event.target.value)
          }
          disabled={disabled}
          className={inputClass}
        />
      );

    case "URL":
      return (
        <input
          type="url"
          value={String(value ?? "")}
          onChange={(event) =>
            setValue(event.target.value)
          }
          disabled={disabled}
          className={inputClass}
          placeholder="https://..."
        />
      );

    case "IMAGE":
      return (
        <div className="space-y-3">
          <input
            type="url"
            value={String(value ?? "")}
            onChange={(event) =>
              setValue(event.target.value)
            }
            disabled={disabled}
            className={inputClass}
            placeholder="Image URL"
          />

          {typeof value === "string" &&
            value.trim() && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
               {/* eslint-disable-next-line @next/next/no-img-element */}
<img
  src={value}
  alt={definition.name}
  className="h-40 w-full object-contain p-4"
/>
              </div>
            )}
        </div>
      );

    case "JSON":
      return (
        <textarea
          value={
            typeof value === "string"
              ? value
              : JSON.stringify(value ?? {}, null, 2)
          }
          onChange={(event) =>
            setValue(event.target.value)
          }
          disabled={disabled}
          rows={6}
          className={`${inputClass} resize-y font-mono text-xs`}
          placeholder='{"key":"value"}'
        />
      );

    case "RANGE": {
      const range =
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
          ? (value as {
              min?: unknown;
              max?: unknown;
            })
          : {};

      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-bold text-slate-500">
              Minimum
            </p>

            <input
              type="number"
              step="any"
              value={String(range.min ?? "")}
              onChange={(event) =>
                setValue({
                  ...range,
                  min: event.target.value,
                })
              }
              disabled={disabled}
              className={inputClass}
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-bold text-slate-500">
              Maximum
            </p>

            <input
              type="number"
              step="any"
              value={String(range.max ?? "")}
              onChange={(event) =>
                setValue({
                  ...range,
                  max: event.target.value,
                })
              }
              disabled={disabled}
              className={inputClass}
            />
          </div>
        </div>
      );
    }

    case "TEXT":
    default:
      return (
        <input
          type="text"
          value={String(value ?? "")}
          onChange={(event) =>
            setValue(event.target.value)
          }
          disabled={disabled}
          className={inputClass}
          placeholder={`Enter ${definition.name.toLowerCase()}...`}
        />
      );
  }
}

function GroupCard({
  group,
  values,
  setValue,
  disabled,
}: {
  group: ProductSpecificationGroup;
  values: SpecificationState;
  setValue: (
    definitionId: string,
    value: unknown,
  ) => void;
  disabled: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white">
      <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">
              {group.name}
            </h3>

            {group.description && (
              <p className="mt-1 text-xs text-slate-500">
                {group.description}
              </p>
            )}
          </div>

          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-violet-600 shadow-sm">
            {group.definitions.length}{" "}
            {group.definitions.length === 1
              ? "field"
              : "fields"}
          </span>
        </div>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-2">
        {group.definitions.map((definition) => (
          <div
            key={definition.id}
            className={
              definition.dataType === "LONG_TEXT" ||
              definition.dataType === "JSON" ||
              definition.dataType === "MULTI_SELECT" ||
              definition.dataType === "RANGE" ||
              definition.dataType === "IMAGE"
                ? "md:col-span-2"
                : ""
            }
          >
            <InputLabel definition={definition} />

            {renderField(
              definition,
              values[definition.id],
              (nextValue) =>
                setValue(
                  definition.id,
                  nextValue,
                ),
              disabled,
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              {definition.isFilterable && (
                <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
                  Filterable
                </span>
              )}

              {definition.isComparable && (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                  Comparable
                </span>
              )}

              {definition.isSearchable && (
                <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600">
                  Searchable
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductSpecificationEditor({
  productId,
  refreshKey = 0,
}: ProductSpecificationEditorProps) {
  const [data, setData] =
    useState<ProductSpecificationsResponse | null>(
      null,
    );

  const [values, setValues] =
    useState<SpecificationState>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const definitions = useMemo(() => {
    if (!data) return [];

    return data.schema.groups.flatMap(
      (group) => group.definitions,
    );
  }, [data]);

const loadSpecifications = async (
  showLoading = false,
) => {
  if (showLoading) {
    setLoading(true);
    setError("");
  }

  try {
    const response =
      await getProductSpecifications(productId);

    const specificationData = response.data;

    setData(specificationData);

    const existingValues = new Map(
      specificationData.values
        .filter((item) => item.definitionId)
        .map((item) => [
          item.definitionId as string,
          item,
        ]),
    );

    const initialValues: SpecificationState = {};

    for (const definition of specificationData.schema.groups.flatMap(
      (group) => group.definitions,
    )) {
      initialValues[definition.id] =
        normalizeInitialValue(
          definition,
          existingValues.get(definition.id),
        );
    }

    setValues(initialValues);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to load specifications.",
    );
  } finally {
    setLoading(false);
  }
};

 useEffect(() => {
  let cancelled = false;

  const loadInitialSpecifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getProductSpecifications(productId);

      if (cancelled) return;

      const specificationData = response.data;

      setData(specificationData);

      const existingValues = new Map(
        specificationData.values
          .filter((item) => item.definitionId)
          .map((item) => [
            item.definitionId as string,
            item,
          ]),
      );

      const initialValues: SpecificationState = {};

      for (
        const definition of specificationData.schema.groups.flatMap(
          (group) => group.definitions,
        )
      ) {
        initialValues[definition.id] =
          normalizeInitialValue(
            definition,
            existingValues.get(definition.id),
          );
      }

      setValues(initialValues);
    } catch (err) {
      if (cancelled) return;

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load specifications.",
      );
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  void loadInitialSpecifications();

  return () => {
    cancelled = true;
  };
}, [productId, refreshKey]);

  const setValue = (
    definitionId: string,
    value: unknown,
  ) => {
    setValues((current) => ({
      ...current,
      [definitionId]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSave = async () => {
    if (!data) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload: ProductSpecificationInput[] =
        [];

      for (const definition of definitions) {
        const value = values[definition.id];

        if (
          isEmptyValue(definition, value)
        ) {
          if (definition.isRequired) {
            throw new Error(
              `${definition.name} is required.`,
            );
          }

          continue;
        }

        if (
          definition.dataType === "JSON" &&
          typeof value === "string"
        ) {
          try {
            JSON.parse(value);
          } catch {
            throw new Error(
              `${definition.name} contains invalid JSON.`,
            );
          }
        }

        payload.push({
          definitionId: definition.id,
          value: formatValueForApi(
            definition,
            value,
          ),
        });
      }

      await updateProductSpecifications(
        productId,
        payload,
      );

      setSuccess(
        "Specifications saved successfully.",
      );

    await loadSpecifications();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save specifications.",
      );
    } finally {
      setSaving(false);
    }
  };
  

  if (loading) {
    return (
      <section className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-lg shadow-violet-100/40">
        <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 animate-pulse rounded-2xl bg-violet-200" />

            <div className="space-y-2">
              <div className="h-5 w-36 animate-pulse rounded bg-violet-100" />
              <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-100 p-5"
            >
              <div className="h-5 w-32 rounded bg-slate-200" />

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="h-12 rounded-xl bg-slate-100" />
                <div className="h-12 rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section className="rounded-3xl border border-red-200 bg-white p-6 shadow-lg">
        <div className="rounded-2xl bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 text-sm font-black text-white">
              !
            </span>

            <div>
              <h3 className="font-bold text-red-800">
                Unable to load specifications
              </h3>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
               onClick={() => {
  void loadSpecifications(true);
}}
                className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!data) return null;

  return (
    <section className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-lg shadow-violet-100/40">
      <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-xl text-white shadow-lg shadow-violet-200">
              ⚙️
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Specifications
              </h2>

              <p className="text-sm text-slate-500">
                {data.schema.name} · Version{" "}
                {data.schema.version}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "✓ Save Specifications"}
          </button>
        </div>
      </div>

      {data.schema.description && (
        <div className="border-b border-slate-100 px-6 py-4">
          <p className="text-sm leading-6 text-slate-500">
            {data.schema.description}
          </p>
        </div>
      )}

      <div className="space-y-5 p-6">
        {data.schema.groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            values={values}
            setValue={setValue}
            disabled={saving}
          />
        ))}

        {data.schema.groups.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <div className="text-4xl">⚙️</div>

            <h3 className="mt-3 font-bold text-slate-800">
              No specification fields configured
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add groups and definitions to the active
              schema first.
            </p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
              ✓
            </span>

            {success}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white">
              !
            </span>

            {error}
          </div>
        )}
      </div>
    </section>
  );
}