import { useEffect, useRef, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlock from '@tiptap/extension-code-block';
import HorizontalRule from '@tiptap/extension-horizontal-rule';

interface TipTapEditorProps {
  content: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

const TOOLBAR_BG = '#0a0f1a';
const CARD_BG = '#0e1626';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#d7deeb';
const TEXT_DIM = '#8797b3';
const ACCENT = '#00d68f';
const INK_900 = '#070c16';
const INK_800 = '#0e1626';
const INK_700 = '#16223a';

function ToolbarButton({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: active ? ACCENT : 'transparent',
        color: active ? INK_900 : TEXT_DIM,
        border: `1px solid ${active ? ACCENT : BORDER}`,
        borderRadius: 6,
        padding: '5px 9px',
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        fontFamily: 'inherit',
        transition: 'all .12s',
        lineHeight: 1,
      }}
      title={label}
    >
      {label}
    </button>
  );
}

function ToolbarDivider() {
  return (
    <div
      style={{
        width: 1,
        height: 24,
        background: BORDER,
        alignSelf: 'center',
        flexShrink: 0,
      }}
    />
  );
}

export default function TipTapEditor({ content, onChange, placeholder }: TipTapEditorProps) {
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const initialContentRef = useRef(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Image,
      Placeholder.configure({ placeholder: placeholder || 'Start writing...' }),
      CharacterCount,
      CodeBlock,
      HorizontalRule,
    ],
    content: content || '',
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      if (typeof onChange === 'function') onChange(html);
      window.dispatchEvent(new CustomEvent('yarrwin:post-content', { detail: html }));
      setHasUnsaved(html !== initialContentRef.current);
    },
    editorProps: {
      attributes: {
        style: `min-height:500px;outline:none;padding:24px 28px;font-size:15px;line-height:1.7;color:${TEXT};`,
      },
    },
  });

  useEffect(() => {
    if (!editor || !content || editor.getHTML() === content) return;
    editor.commands.setContent(content, false);
    initialContentRef.current = content;
    setHasUnsaved(false);
  }, [content]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsaved]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL:', 'https://');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words?.() ?? 0;
  const charCount = editor.storage.characterCount?.characters?.() ?? 0;

  return (
    <div
      style={{
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* Sticky toolbar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: TOOLBAR_BG,
          borderBottom: `1px solid ${BORDER}`,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexWrap: 'wrap',
        }}
      >
        <ToolbarButton
          label="B"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="I"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="U"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          label="S"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="H2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="H3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarButton
          label="H4"
          active={editor.isActive('heading', { level: 4 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="UL"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="OL"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="❝"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          label="</>"
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarButton
          label="—"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="🔗"
          active={editor.isActive('link')}
          onClick={setLink}
        />
        <ToolbarButton
          label="🖼"
          onClick={addImage}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="⫷"
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        />
        <ToolbarButton
          label="⫶"
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        />
        <ToolbarButton
          label="⫸"
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="↩"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        />
        <ToolbarButton
          label="↪"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        />
        <ToolbarButton
          label="✕"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        />
      </div>

      {/* Editor area */}
      <div style={{ minHeight: 500 }} aria-label="Post body content">
        <EditorContent editor={editor} />
      </div>

      {/* Footer stats */}
      <div
        style={{
          borderTop: `1px solid ${BORDER}`,
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: TEXT_DIM,
          background: TOOLBAR_BG,
        }}
      >
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>
    </div>
  );
}
