"use client";

import {
  useState,
} from "react";

import NewsEditor from "@/components/admin/news/NewsEditor";

export default function NewNewsPage() {
  const [title, setTitle] =
    useState("");

  const [authorName, setAuthorName] =
    useState("");

  const [content, setContent] =
    useState("");

  return (
    <div className="min-h-screen bg-[#f0f0f1]">
      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-gray-300 bg-white">
        <div className="flex h-14 items-center justify-between px-5">
          <h1 className="text-base font-semibold text-gray-900">
            Create News
          </h1>

          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm"
            >
              Save Draft
            </button>

            <button
              type="button"
              className="rounded-md bg-[#2271b1] px-4 py-2 text-sm font-semibold text-white"
            >
              Publish
            </button>
          </div>
        </div>
      </header>

      {/* PAGE */}

      <main className="mx-auto max-w-[1100px] px-5 py-8">
        <div className="rounded-lg border border-gray-300 bg-white">
          {/* TITLE */}

          <div className="px-8 pt-8">
            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              placeholder="Add title"
              className="w-full border-0 bg-transparent px-0 text-4xl font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:ring-0"
            />

            <div className="mt-4 border-b border-gray-200 pb-6">
              <input
                type="text"
                value={authorName}
                onChange={(event) =>
                  setAuthorName(
                    event.target.value,
                  )
                }
                placeholder="Author name"
                className="border-0 bg-transparent text-sm text-gray-600 outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* EDITOR */}

          <NewsEditor
            onChange={setContent}
          />
        </div>
      </main>
    </div>
  );
}