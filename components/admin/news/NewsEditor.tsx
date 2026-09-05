"use client";

import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";

import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";

import styles from "./NewsEditor.module.css";
import { Video } from "./extensions/Video";
import { Audio } from "./extensions/Audio";

type NewsEditorProps = {
  value?: string;
  onChange?: (content: string) => void;
  onChangeJSON?: (json: Record<string, unknown>) => void;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function NewsEditor({
  value = "",
  onChange,
  onChangeJSON,
  onChangeText,
  placeholder = "Start writing your news article...",
  disabled = false,
}: NewsEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Upload images to backend.
   *
   * This uses the existing admin image upload endpoint.
   */
  const uploadImages = useCallback(async (files: File[]) => {
    const editor = editorRef.current;

    if (!editor || files.length === 0) {
      return;
    }

    const imageFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      return;
    }

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("smartprix_token")
          : null;

      for (const file of imageFiles) {
        const formData = new FormData();

        formData.append("file", file);

        const response = await fetch(
  `${API_BASE_URL}/admin/media/upload`,
  {
    method: "POST",
    headers: {
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    body: formData,
  }
);

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(
            errorText ||
              `Image upload failed with status ${response.status}`
          );
        }

        const result = await response.json();

        /**
         * Support different backend response structures.
         */
        const uploadedUrl = result?.data?.url;

if (!uploadedUrl) {
  throw new Error(
    "Image uploaded successfully, but the server did not return an image URL."
  );
}

const fullImageUrl = uploadedUrl.startsWith("http")
  ? uploadedUrl
  : `http://localhost:5000${uploadedUrl}`;

console.log("IMAGE URL:", fullImageUrl);

editor
  .chain()
  .focus()
  .setImage({
    src: fullImageUrl,
    alt: file.name,
  })
  .run();
      }
    } catch (error) {
      console.error("News image upload error:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to upload image."
      );
    }
  }, []);

  const uploadMedia = useCallback(async (file: File) => {
  const editor = editorRef.current;

  if (!editor) {
    return;
  }

  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("smartprix_token")
        : null;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${API_BASE_URL}/admin/media/upload`,
      {
        method: "POST",
        headers: {
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        errorText ||
          `Media upload failed with status ${response.status}`
      );
    }

    const result = await response.json();

    const uploadedUrl = result?.data?.url;

    if (!uploadedUrl) {
      throw new Error(
        "Media uploaded successfully, but the server did not return a URL."
      );
    }

    const fullMediaUrl = uploadedUrl.startsWith("http")
      ? uploadedUrl
      : `http://localhost:5000${uploadedUrl}`;

    const mediaType = result?.data?.type;

    console.log("MEDIA URL:", fullMediaUrl);
    console.log("MEDIA TYPE:", mediaType);

    if (mediaType === "video") {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "video",
          attrs: {
            src: fullMediaUrl,
          },
        })
        .run();
    }

    if (mediaType === "audio") {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "audio",
          attrs: {
            src: fullMediaUrl,
          },
        })
        .run();
    }
  } catch (error) {
    console.error("News media upload error:", error);

    window.alert(
      error instanceof Error
        ? error.message
        : "Failed to upload media."
    );
  }
}, []);


  /**
   * TipTap editor.
   */
  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),

      Underline,

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,

        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        },
      }),

      Image.configure({
  inline: false,
  allowBase64: false,
  HTMLAttributes: {
    class: styles.articleImage,
  },
}),

      Placeholder.configure({
        placeholder,
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      Table.configure({
        resizable: true,

        HTMLAttributes: {
          class: styles.articleTable,
        },
      }),

      TableRow,
      TableHeader,
      TableCell,
      Video,
      Audio,
    ],

    content: value,

    editable: !disabled,

    onCreate: ({ editor }) => {
      editorRef.current = editor;
    },

    onUpdate: ({ editor }) => {
  onChange?.(editor.getHTML());

  onChangeJSON?.(
    editor.getJSON() as Record<string, unknown>
  );

  onChangeText?.(editor.getText());
},

    editorProps: {
      attributes: {
        class: styles.content,
        spellcheck: "true",
      },

      /**
       * Drag & drop images.
       */
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;

        if (!files || files.length === 0) {
          return false;
        }

        const imageFiles = Array.from(files).filter((file) =>
          file.type.startsWith("image/")
        );

        if (imageFiles.length === 0) {
          return false;
        }

        event.preventDefault();

        void uploadImages(imageFiles);

        return true;
      },

      /**
       * Paste images from clipboard.
       */
      handlePaste: (_view, event) => {
        const files = event.clipboardData?.files;

        if (!files || files.length === 0) {
          return false;
        }

        const imageFiles = Array.from(files).filter((file) =>
          file.type.startsWith("image/")
        );

        if (imageFiles.length === 0) {
          return false;
        }

        event.preventDefault();

        void uploadImages(imageFiles);

        return true;
      },
    },
  });

  /**
   * Keep editorRef synchronized.
   */
  useEffect(() => {
    editorRef.current = editor;

    return () => {
      if (editorRef.current === editor) {
        editorRef.current = null;
      }
    };
  }, [editor]);

  /**
   * Update editor when external value changes.
   */
  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentHTML = editor.getHTML();

    if (value !== currentHTML) {
      editor.commands.setContent(value || "", {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  /**
   * Update editable state.
   */
  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!disabled);
  }, [editor, disabled]);

  /**
   * Open image picker.
   */
  const openImagePicker = () => {
    if (disabled) {
      return;
    }

    imageInputRef.current?.click();
  };

  const openMediaPicker = () => {
  if (disabled) {
    return;
  }

  mediaInputRef.current?.click();
};

  /**
   * Handle image selection.
   */
  const handleImageFiles = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (files.length > 0) {
      await uploadImages(files);
    }

    /**
     * Allow selecting the same file again.
     */
    event.target.value = "";
  };

  /**
   * Prevent toolbar from stealing editor selection.
   */
  const preventSelectionLoss = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  /**
   * Insert image from URL.
   */
  const insertImageFromUrl = () => {
    const currentEditor = editorRef.current;

    if (!currentEditor || disabled) {
      return;
    }

    const url = window.prompt("Enter image URL:");

    if (!url?.trim()) {
      return;
    }

    currentEditor
      .chain()
      .focus()
      .setImage({
        src: url.trim(),
      })
      .run();
  };

  /**
   * Insert/edit link.
   */
  const setLink = () => {
    const currentEditor = editorRef.current;

    if (!currentEditor || disabled) {
      return;
    }

    const previousUrl =
      currentEditor.getAttributes("link").href || "";

    const url = window.prompt(
      "Enter URL:",
      previousUrl
    );

    if (url === null) {
      return;
    }

    if (!url.trim()) {
      currentEditor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run();

      return;
    }

    currentEditor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url.trim(),
        target: "_blank",
        rel: "noopener noreferrer nofollow",
      })
      .run();
  };

  /**
   * Insert video URL.
   *
   * Currently inserts a clickable video link.
   * Actual uploaded video embedding will be added separately.
   */
  const insertVideo = () => {
    const currentEditor = editorRef.current;

    if (!currentEditor || disabled) {
      return;
    }

    const url = window.prompt(
      "Enter YouTube or video URL:"
    );

    if (!url?.trim()) {
      return;
    }

    currentEditor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: "▶ Watch Video",
        marks: [
          {
            type: "link",
            attrs: {
              href: url.trim(),
              target: "_blank",
              rel: "noopener noreferrer nofollow",
            },
          },
        ],
      })
      .run();
  };

  /**
   * Insert 3x3 table.
   */
  const insertTable = () => {
    const currentEditor = editorRef.current;

    if (!currentEditor || disabled) {
      return;
    }

    currentEditor
      .chain()
      .focus()
      .insertTable({
        rows: 3,
        cols: 3,
        withHeaderRow: true,
      })
      .run();
  };

  /**
   * Insert horizontal divider.
   */
  const insertDivider = () => {
    const currentEditor = editorRef.current;

    if (!currentEditor || disabled) {
      return;
    }

    currentEditor
      .chain()
      .focus()
      .setHorizontalRule()
      .run();
  };

  /**
   * Loading state.
   */
  if (!editor) {
    return (
      <div className={styles.editor}>
        <div className={styles.loading}>
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editor}>
      {/* Hidden image picker */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleImageFiles}
      />

      <input
  ref={mediaInputRef}
  type="file"
  accept="video/*,audio/*"
  hidden
  onChange={(event) => {
    const file = event.target.files?.[0];

    if (file) {
      uploadMedia(file);
    }

    event.target.value = "";
  }}
/>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* Undo */}
        <button
          type="button"
          className={styles.toolbarButton}
          title="Undo"
          disabled={
            disabled || !editor.can().undo()
          }
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor.chain().focus().undo().run()
          }
        >
          ↶
        </button>

        {/* Redo */}
        <button
          type="button"
          className={styles.toolbarButton}
          title="Redo"
          disabled={
            disabled || !editor.can().redo()
          }
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor.chain().focus().redo().run()
          }
        >
          ↷
        </button>

        <span className={styles.separator} />

        {/* Paragraph */}
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            editor.isActive("paragraph")
              ? styles.toolbarButtonActive
              : ""
          }`}
          title="Paragraph"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setParagraph()
              .run()
          }
        >
          P
        </button>

        {/* H1 */}
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            editor.isActive("heading", {
              level: 1,
            })
              ? styles.toolbarButtonActive
              : ""
          }`}
          title="Heading 1"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 1,
              })
              .run()
          }
        >
          H1
        </button>

        {/* H2 */}
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            editor.isActive("heading", {
              level: 2,
            })
              ? styles.toolbarButtonActive
              : ""
          }`}
          title="Heading 2"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
        >
          H2
        </button>

        {/* H3 */}
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            editor.isActive("heading", {
              level: 3,
            })
              ? styles.toolbarButtonActive
              : ""
          }`}
          title="Heading 3"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 3,
              })
              .run()
          }
        >
          H3
        </button>

        <span className={styles.separator} />

        {/* Bold */}
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            editor.isActive("bold")
              ? styles.toolbarButtonActive
              : ""
          }`}
          title="Bold"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
        >
          <strong>B</strong>
        </button>

        {/* Italic */}
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            editor.isActive("italic")
              ? styles.toolbarButtonActive
              : ""
          }`}
          title="Italic"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
        >
          <em>I</em>
        </button>

        {/* Underline */}
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            editor.isActive("underline")
              ? styles.toolbarButtonActive
              : ""
          }`}
          title="Underline"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleUnderline()
              .run()
          }
        >
          <u>U</u>
        </button>

        {/* Strike */}
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            editor.isActive("strike")
              ? styles.toolbarButtonActive
              : ""
          }`}
          title="Strikethrough"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleStrike()
              .run()
          }
        >
          <s>S</s>
        </button>

        {/* Clear formatting */}
        <button
          type="button"
          className={styles.toolbarButton}
          title="Clear Formatting"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor
              .chain()
              .focus()
              .unsetAllMarks()
              .clearNodes()
              .run()
          }
        >
          Tx
        </button>

        <span className={styles.separator} />

        {/* Bullet list */}
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            editor.isActive("bulletList")
              ? styles.toolbarButtonActive
              : ""
          }`}
          title="Bullet List"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
        >
          •☰
        </button>

        {/* Ordered list */}
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            editor.isActive("orderedList")
              ? styles.toolbarButtonActive
              : ""
          }`}
          title="Numbered List"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
        >
          1☰
        </button>

        {/* Blockquote */}
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            editor.isActive("blockquote")
              ? styles.toolbarButtonActive
              : ""
          }`}
          title="Blockquote"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBlockquote()
              .run()
          }
        >
          “
        </button>

        {/* Code */}
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            editor.isActive("code")
              ? styles.toolbarButtonActive
              : ""
          }`}
          title="Inline Code"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor.chain().focus().toggleCode().run()
          }
        >
          {"</>"}
        </button>

        <span className={styles.separator} />

        {/* Align left */}
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            editor.isActive({
              textAlign: "left",
            })
              ? styles.toolbarButtonActive
              : ""
          }`}
          title="Align Left"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("left")
              .run()
          }
        >
          ⬅
        </button>

        {/* Align center */}
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            editor.isActive({
              textAlign: "center",
            })
              ? styles.toolbarButtonActive
              : ""
          }`}
          title="Align Center"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("center")
              .run()
          }
        >
          ↔
        </button>

        {/* Align right */}
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            editor.isActive({
              textAlign: "right",
            })
              ? styles.toolbarButtonActive
              : ""
          }`}
          title="Align Right"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("right")
              .run()
          }
        >
          ➡
        </button>

        <span className={styles.separator} />

        {/* Link */}
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            editor.isActive("link")
              ? styles.toolbarButtonActive
              : ""
          }`}
          title="Insert Link"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={setLink}
        >
          🔗
        </button>

        {/* Remove Link */}
        <button
          type="button"
          className={styles.toolbarButton}
          title="Remove Link"
          disabled={
            disabled || !editor.isActive("link")
          }
          onMouseDown={preventSelectionLoss}
          onClick={() =>
            editor
              .chain()
              .focus()
              .unsetLink()
              .run()
          }
        >
          ⛓
        </button>

        <span className={styles.separator} />

        {/* Upload Image */}
        <button
          type="button"
          className={styles.toolbarButton}
          title="Upload Image"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={openImagePicker}
        >
          🖼
        </button>

  {/* Upload Upload Video or Audio */}
        <button
  type="button"
  className={styles.toolbarButton}
  title="Upload Video or Audio"
  disabled={disabled}
  onMouseDown={preventSelectionLoss}
  onClick={openMediaPicker}
>
  🎥🎵
</button>

        {/* Image URL */}
        <button
          type="button"
          className={styles.toolbarButton}
          title="Insert Image URL"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={insertImageFromUrl}
        >
          🌐
        </button>

        {/* Video */}
        <button
          type="button"
          className={styles.toolbarButton}
          title="Insert Video"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={insertVideo}
        >
          ▶
        </button>

        {/* Table */}
        <button
          type="button"
          className={styles.toolbarButton}
          title="Insert Table"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={insertTable}
        >
          ▦
        </button>

        {/* Divider */}
        <button
          type="button"
          className={styles.toolbarButton}
          title="Horizontal Divider"
          disabled={disabled}
          onMouseDown={preventSelectionLoss}
          onClick={insertDivider}
        >
          ―
        </button>
      </div>

      {/* Upload hint */}
      <div className={styles.uploadHint}>
        Drag & drop or paste images directly into the editor.
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}