"use client";

import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";
import { useRef } from "react";

interface NewsEditorProps {
  value: string;
  onChange: (value: string) => void;
  onChangeJSON?: (value: Record<string, unknown>) => void;
  onChangeText?: (value: string) => void;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

const getFullMediaUrl = (url: string) => {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `http://localhost:5000${url}`;
};

export default function NewsEditor({
  value,
  onChange,
  onChangeJSON,
  onChangeText,
}: NewsEditorProps) {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  const uploadImage = async (
    blobInfo: {
      blob: () => Blob;
      filename: () => string;
    },
    progress: (percent: number) => void,
  ): Promise<string> => {
    try {
      const token =
        localStorage.getItem("smartprix_token");

      const formData = new FormData();

      formData.append(
        "file",
        blobInfo.blob(),
        blobInfo.filename(),
      );

      const response = await fetch(
        `${API_BASE_URL}/admin/media/upload`,
        {
          method: "POST",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Image upload failed",
        );
      }

      progress(100);

      return getFullMediaUrl(data.data.url);
    } catch (error) {
      console.error("TinyMCE image upload error:", error);

      throw new Error(
        error instanceof Error
          ? error.message
          : "Image upload failed",
      );
    }
  };

  const handleEditorChange = (
    content: string,
    editor: TinyMCEEditor,
  ) => {
    onChange(content);

    const text = editor
      .getContent({ format: "text" })
      .trim();

    onChangeText?.(text);

    onChangeJSON?.({
      type: "doc",
      html: content,
      text,
    });
  };

  return (
    <div className="w-full">
      <Editor
        apiKey={
          process.env.NEXT_PUBLIC_TINYMCE_API_KEY
        }

        onInit={(_evt, editor) => {
          editorRef.current = editor;
        }}

        value={value}

        onEditorChange={handleEditorChange}

        init={{
          height: 650,

          menubar:
            "file edit view insert format tools table help",

          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "media",
            "table",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "wordcount",
            "help",
            "directionality",
            "emoticons",
          ],

          toolbar:
            "undo redo | " +
            "blocks fontfamily fontsize | " +
            "bold italic underline strikethrough | " +
            "forecolor backcolor | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | " +
            "link image media table | " +
            "blockquote hr | " +
            "removeformat | " +
            "code fullscreen",

          toolbar_mode: "sliding",

          branding: false,

          promotion: false,

          statusbar: true,

          elementpath: true,

          resize: true,

          browser_spellcheck: true,

          contextmenu:
            "link image table",

          paste_data_images: true,

          automatic_uploads: true,

          images_upload_handler:
            uploadImage,

          image_advtab: true,

          image_title: true,

          image_caption: true,

          image_dimensions: true,

          image_description: true,

          object_resizing: true,

          resize_img_proportional: true,

          media_live_embeds: true,

          link_default_target: "_blank",

          link_target_list: [
            {
              title: "New window",
              value: "_blank",
            },
            {
              title: "Same window",
              value: "_self",
            },
          ],

          font_family_formats:
            "Arial=arial,helvetica,sans-serif;" +
            "Georgia=Georgia,serif;" +
            "Helvetica=Helvetica,Arial,sans-serif;" +
            "Tahoma=Tahoma,sans-serif;" +
            "Times New Roman=times new roman,times,serif;" +
            "Trebuchet MS=trebuchet ms,geneva,sans-serif;" +
            "Verdana=Verdana,sans-serif;" +
            "Courier New=courier new,courier,monospace;",

          font_size_formats:
            "8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 28pt 32pt 36pt 48pt",

          table_default_attributes: {
            border: "1",
          },

          table_default_styles: {
            width: "100%",
          },

          content_style: `
            body {
              font-family:
                Arial,
                Helvetica,
                sans-serif;
              font-size: 16px;
              line-height: 1.7;
              padding: 12px;
              color: #111827;
            }

            img {
              max-width: 100%;
              height: auto;
            }

            table {
              border-collapse: collapse;
              width: 100%;
            }

            table td,
            table th {
              border: 1px solid #d1d5db;
              padding: 8px;
            }

            blockquote {
              border-left: 4px solid #d1d5db;
              margin-left: 0;
              padding-left: 16px;
              color: #4b5563;
            }

            a {
              color: #2563eb;
            }
          `,
        }}
      />

      <div className="flex justify-end border border-t-0 border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
        TinyMCE Cloud Editor
      </div>
    </div>
  );
}