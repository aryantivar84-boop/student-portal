import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent, Highlighter, Palette, Eraser,
  Undo2, Redo2, ChevronDown, Check, Type, Baseline, Pilcrow,
  Code, Eye
} from 'lucide-react';

export default function WordRibbonEditor({
  value = '',
  onChange,
  placeholder = 'Type or paste the complete offer letter content here...',
  minHeight = '380px'
}) {
  const editorRef = useRef(null);
  const isInternalUpdate = useRef(false);

  // Formatting state for active buttons
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    subscript: false,
    superscript: false,
    justifyLeft: true,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  const [currentFont, setCurrentFont] = useState('Aptos (Body)');
  const [currentFontSize, setCurrentFontSize] = useState('12');
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#FEF08A');

  // Dropdown open states
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showSpacingDropdown, setShowSpacingDropdown] = useState(false);
  const [showPilcrow, setShowPilcrow] = useState(false);
  const [viewMode, setViewMode] = useState('visual'); // 'visual' or 'html'

  // Stats
  const [stats, setStats] = useState({ words: 0, characters: 0 });

  // Convert plain text to HTML paragraphs if necessary
  const formatInitialHtml = useCallback((raw) => {
    if (!raw) return '<p><br></p>';
    if (raw.includes('<p>') || raw.includes('<div>') || raw.includes('<br>') || raw.includes('<b>')) {
      return raw;
    }
    const paras = raw.split(/\n\s*\n/).filter(Boolean);
    if (paras.length === 0) return `<p>${raw.replace(/\n/g, '<br>')}</p>`;
    return paras.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  }, []);

  // Sync incoming value to editor content when value changes externally
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (editorRef.current) {
      const html = formatInitialHtml(value);
      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;
        updateStats();
      }
    }
  }, [value, formatInitialHtml]);

  // Update words & characters count
  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const cleanText = text.trim();
    const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
    const characters = text.length;
    setStats({ words, characters });
  };

  // Inspect current selection for active formats
  const updateActiveFormats = () => {
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        subscript: document.queryCommandState('subscript'),
        superscript: document.queryCommandState('superscript'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        justifyFull: document.queryCommandState('justifyFull'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });
    } catch (e) {}
  };

  // Trigger change upward
  const handleEditorInput = () => {
    if (!editorRef.current) return;
    isInternalUpdate.current = true;
    const html = editorRef.current.innerHTML;
    updateStats();
    updateActiveFormats();
    if (onChange) {
      onChange(html);
    }
  };

  // Execute standard formatting commands
  const execCmd = (cmd, val = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(cmd, false, val);
    handleEditorInput();
    updateActiveFormats();
  };

  // Apply Font Family
  const handleSelectFont = (font) => {
    setCurrentFont(font);
    setShowFontDropdown(false);
    if (editorRef.current) editorRef.current.focus();
    document.execCommand('fontName', false, font);
    handleEditorInput();
  };

  // Apply Font Size in points
  const handleSelectFontSize = (size) => {
    setCurrentFontSize(size);
    setShowSizeDropdown(false);
    if (editorRef.current) editorRef.current.focus();

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || selection.isCollapsed) return;

    // Apply font size style to selected range
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = `${size}pt`;
    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
      selection.selectAllChildren(span);
    } catch (e) {
      document.execCommand('fontSize', false, '3');
    }
    handleEditorInput();
  };

  // Increase / Decrease font size
  const handleStepFontSize = (step) => {
    const sizes = [9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36];
    let cur = parseInt(currentFontSize, 10) || 12;
    let nextIdx = sizes.findIndex(s => s >= cur);
    if (nextIdx === -1) nextIdx = sizes.length - 1;
    let newIdx = Math.max(0, Math.min(sizes.length - 1, nextIdx + step));
    handleSelectFontSize(String(sizes[newIdx]));
  };

  // Change Case (Aa)
  const handleChangeCase = (type) => {
    setShowCaseDropdown(false);
    if (editorRef.current) editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    const text = selection.toString();
    if (!text) return;

    let res = text;
    if (type === 'upper') res = text.toUpperCase();
    else if (type === 'lower') res = text.toLowerCase();
    else if (type === 'sentence') {
      res = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    } else if (type === 'capitalize') {
      res = text.replace(/\b\w/g, c => c.toUpperCase());
    }
    document.execCommand('insertText', false, res);
    handleEditorInput();
  };

  // Text Color
  const handleSelectTextColor = (color) => {
    setTextColor(color);
    setShowColorPicker(false);
    execCmd('foreColor', color);
  };

  // Highlight Color
  const handleSelectHighlightColor = (color) => {
    setHighlightColor(color);
    setShowHighlightPicker(false);
    execCmd('hiliteColor', color);
  };

  // Line Spacing
  const handleSelectLineSpacing = (spacing) => {
    setShowSpacingDropdown(false);
    if (editorRef.current) editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    let node = selection.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === 1 && (node.tagName === 'P' || node.tagName === 'DIV' || node.tagName === 'LI')) {
        node.style.lineHeight = spacing;
        break;
      }
      node = node.parentNode;
    }
    if (!node || node === editorRef.current) {
      editorRef.current.style.lineHeight = spacing;
    }
    handleEditorInput();
  };

  // Apply Word Styles (Normal, Heading 1, Heading 2, Heading 3, No Spacing)
  const handleApplyStyle = (styleName) => {
    if (editorRef.current) editorRef.current.focus();
    if (styleName === 'Normal') {
      document.execCommand('formatBlock', false, '<p>');
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        let node = selection.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeType === 1 && node.tagName === 'P') {
            node.style.fontSize = '12pt';
            node.style.fontWeight = 'normal';
            node.style.lineHeight = '1.6';
            node.style.color = '#1E293B';
            node.style.margin = '0 0 12px 0';
            break;
          }
          node = node.parentNode;
        }
      }
    } else if (styleName === 'No Spacing') {
      document.execCommand('formatBlock', false, '<p>');
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        let node = selection.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeType === 1 && node.tagName === 'P') {
            node.style.fontSize = '11pt';
            node.style.lineHeight = '1.15';
            node.style.margin = '0 0 4px 0';
            break;
          }
          node = node.parentNode;
        }
      }
    } else if (styleName === 'Heading 1') {
      document.execCommand('formatBlock', false, '<h1>');
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        let node = selection.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeType === 1 && node.tagName === 'H1') {
            node.style.fontSize = '18pt';
            node.style.fontWeight = 'bold';
            node.style.color = '#1E3A8A';
            node.style.margin = '16px 0 8px 0';
            break;
          }
          node = node.parentNode;
        }
      }
    } else if (styleName === 'Heading 2') {
      document.execCommand('formatBlock', false, '<h2>');
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        let node = selection.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeType === 1 && node.tagName === 'H2') {
            node.style.fontSize = '15pt';
            node.style.fontWeight = 'bold';
            node.style.color = '#2563EB';
            node.style.margin = '12px 0 6px 0';
            break;
          }
          node = node.parentNode;
        }
      }
    } else if (styleName === 'Heading 3') {
      document.execCommand('formatBlock', false, '<h3>');
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        let node = selection.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeType === 1 && node.tagName === 'H3') {
            node.style.fontSize = '13pt';
            node.style.fontWeight = '600';
            node.style.color = '#475569';
            node.style.margin = '8px 0 4px 0';
            break;
          }
          node = node.parentNode;
        }
      }
    }
    handleEditorInput();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.word-ribbon-dropdown')) {
        setShowFontDropdown(false);
        setShowSizeDropdown(false);
        setShowCaseDropdown(false);
        setShowColorPicker(false);
        setShowHighlightPicker(false);
        setShowSpacingDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fontOptions = [
    'Aptos (Body)',
    'Calibri',
    'Arial',
    'Times New Roman',
    'Georgia',
    'Segoe UI',
    'Tahoma',
    'Verdana',
    'Courier New'
  ];

  const fontSizeOptions = ['9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '36'];

  const colorPalette = [
    { label: 'Automatic Black', color: '#000000' },
    { label: 'Slate Grey', color: '#475569' },
    { label: 'Corporate Blue', color: '#1E40AF' },
    { label: 'Accent Cyan', color: '#0284C7' },
    { label: 'Indigo Purple', color: '#4F46E5' },
    { label: 'Emerald Green', color: '#16A34A' },
    { label: 'Crimson Red', color: '#DC2626' },
    { label: 'Amber Orange', color: '#D97706' },
  ];

  const highlightPalette = [
    { label: 'No Color', color: 'transparent' },
    { label: 'Yellow', color: '#FEF08A' },
    { label: 'Bright Green', color: '#BBF7D0' },
    { label: 'Cyan Blue', color: '#BAE6FD' },
    { label: 'Magenta Pink', color: '#FBCFE8' },
    { label: 'Warm Orange', color: '#FED7AA' },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden flex flex-col transition">
      
      {/* ======================================================== */}
      {/* MICROSOFT WORD HOME RIBBON TOOLBAR                      */}
      {/* ======================================================== */}
      <div className="bg-[#2B2D30] text-slate-100 border-b border-slate-700 select-none">
        
        {/* Ribbon Top Mode / Title Bar */}
        <div className="px-3 py-1.5 bg-[#1E1F22] border-b border-slate-700/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-xs"></span>
            <span className="font-extrabold text-slate-200 tracking-wide text-[11px] uppercase">
              Offer Letter Content — Microsoft Word Ribbon Editor
            </span>
            <span className="text-[10px] bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold px-2 py-0.5 rounded-full">
              Full Typography & Layout
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'visual' ? 'html' : 'visual')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                viewMode === 'html'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Toggle between Visual Word Editor and HTML Markup"
            >
              {viewMode === 'visual' ? <Code className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{viewMode === 'visual' ? 'View HTML' : 'Visual Mode'}</span>
            </button>
          </div>
        </div>

        {/* The Ribbon Toolbar (Divided into Font, Paragraph, Styles) */}
        <div className="p-2 sm:p-2.5 flex flex-wrap items-stretch gap-2 sm:gap-3 overflow-x-auto text-xs">
          
          {/* GROUP 1: UNDO & REDO */}
          <div className="flex flex-col justify-between border-r border-slate-700/80 pr-2 pb-0.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => execCmd('undo')}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('redo')}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[9px] text-slate-500 text-center uppercase tracking-wider font-semibold">
              Edit
            </span>
          </div>

          {/* GROUP 2: FONT SECTION */}
          <div className="flex flex-col justify-between border-r border-slate-700/80 pr-3 pb-0.5 space-y-1">
            {/* Font Row 1: Font Family, Size, Grow/Shrink, Case, Eraser */}
            <div className="flex items-center gap-1.5 flex-wrap">
              
              {/* Font Family Dropdown */}
              <div className="relative word-ribbon-dropdown">
                <button
                  type="button"
                  onClick={() => setShowFontDropdown(!showFontDropdown)}
                  className="flex items-center justify-between gap-1 px-2.5 py-1 bg-[#1E1F22] hover:bg-[#161719] border border-slate-600 rounded text-slate-200 text-xs w-32 font-medium"
                  title="Font Family"
                >
                  <span className="truncate">{currentFont}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
                </button>
                {showFontDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-[#1E1F22] border border-slate-600 rounded-lg shadow-2xl z-50 py-1 max-h-56 overflow-y-auto">
                    {fontOptions.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => handleSelectFont(f)}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-600 hover:text-white flex items-center justify-between ${
                          currentFont === f ? 'bg-blue-600/30 text-blue-300 font-bold' : 'text-slate-200'
                        }`}
                        style={{ fontFamily: f }}
                      >
                        <span>{f}</span>
                        {currentFont === f && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Font Size Dropdown */}
              <div className="relative word-ribbon-dropdown">
                <button
                  type="button"
                  onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                  className="flex items-center justify-between gap-1 px-2 py-1 bg-[#1E1F22] hover:bg-[#161719] border border-slate-600 rounded text-slate-200 text-xs w-14 font-medium"
                  title="Font Size (pt)"
                >
                  <span>{currentFontSize}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
                </button>
                {showSizeDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-20 bg-[#1E1F22] border border-slate-600 rounded-lg shadow-2xl z-50 py-1 max-h-56 overflow-y-auto">
                    {fontSizeOptions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSelectFontSize(s)}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-600 hover:text-white flex items-center justify-between ${
                          currentFontSize === s ? 'bg-blue-600/30 text-blue-300 font-bold' : 'text-slate-200'
                        }`}
                      >
                        <span>{s}</span>
                        {currentFontSize === s && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Grow Font (A^) */}
              <button
                type="button"
                onClick={() => handleStepFontSize(1)}
                className="px-1.5 py-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs"
                title="Increase Font Size (Ctrl+Shift+>)"
              >
                A<span className="text-[10px] align-super">▲</span>
              </button>

              {/* Shrink Font (Av) */}
              <button
                type="button"
                onClick={() => handleStepFontSize(-1)}
                className="px-1.5 py-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs"
                title="Decrease Font Size (Ctrl+Shift+<)"
              >
                A<span className="text-[10px] align-sub">▼</span>
              </button>

              {/* Change Case (Aa) */}
              <div className="relative word-ribbon-dropdown">
                <button
                  type="button"
                  onClick={() => setShowCaseDropdown(!showCaseDropdown)}
                  className="flex items-center gap-0.5 px-1.5 py-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs"
                  title="Change Case"
                >
                  <span>Aa</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>
                {showCaseDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-36 bg-[#1E1F22] border border-slate-600 rounded-lg shadow-2xl z-50 py-1">
                    <button
                      type="button"
                      onClick={() => handleChangeCase('sentence')}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-blue-600 hover:text-white"
                    >
                      Sentence case
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeCase('lower')}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-blue-600 hover:text-white"
                    >
                      lowercase
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeCase('upper')}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-blue-600 hover:text-white"
                    >
                      UPPERCASE
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeCase('capitalize')}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-blue-600 hover:text-white"
                    >
                      Capitalize Each Word
                    </button>
                  </div>
                )}
              </div>

              {/* Clear Formatting (Eraser) */}
              <button
                type="button"
                onClick={() => execCmd('removeFormat')}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
                title="Clear All Formatting"
              >
                <Eraser className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Font Row 2: Bold, Italic, Underline, Strike, Sub, Super, Highlight, Font Color */}
            <div className="flex items-center gap-1 flex-wrap">
              {/* Bold */}
              <button
                type="button"
                onClick={() => execCmd('bold')}
                className={`p-1.5 rounded transition ${
                  activeFormats.bold
                    ? 'bg-blue-600 text-white font-black shadow-xs'
                    : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              {/* Italic */}
              <button
                type="button"
                onClick={() => execCmd('italic')}
                className={`p-1.5 rounded transition ${
                  activeFormats.italic
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              {/* Underline */}
              <button
                type="button"
                onClick={() => execCmd('underline')}
                className={`p-1.5 rounded transition ${
                  activeFormats.underline
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>

              {/* Strikethrough */}
              <button
                type="button"
                onClick={() => execCmd('strikeThrough')}
                className={`p-1.5 rounded transition ${
                  activeFormats.strikeThrough
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>

              {/* Subscript */}
              <button
                type="button"
                onClick={() => execCmd('subscript')}
                className={`p-1.5 rounded transition ${
                  activeFormats.subscript
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Subscript (x₂)"
              >
                <Subscript className="w-3.5 h-3.5" />
              </button>

              {/* Superscript */}
              <button
                type="button"
                onClick={() => execCmd('superscript')}
                className={`p-1.5 rounded transition ${
                  activeFormats.superscript
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Superscript (x²)"
              >
                <Superscript className="w-3.5 h-3.5" />
              </button>

              {/* Text Highlight Color */}
              <div className="relative word-ribbon-dropdown ml-1">
                <button
                  type="button"
                  onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                  className="flex items-center gap-0.5 p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
                  title="Text Highlight Color"
                >
                  <div className="flex flex-col items-center">
                    <Highlighter className="w-3.5 h-3.5" />
                    <span className="w-3.5 h-1 rounded-full mt-0.5" style={{ backgroundColor: highlightColor }}></span>
                  </div>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>
                {showHighlightPicker && (
                  <div className="absolute top-full left-0 mt-1 p-2 bg-[#1E1F22] border border-slate-600 rounded-lg shadow-2xl z-50 grid grid-cols-3 gap-1.5 w-36">
                    {highlightPalette.map((h) => (
                      <button
                        key={h.label}
                        type="button"
                        onClick={() => handleSelectHighlightColor(h.color)}
                        className="w-8 h-8 rounded border border-slate-500 hover:scale-110 transition flex items-center justify-center"
                        style={{ backgroundColor: h.color === 'transparent' ? '#334155' : h.color }}
                        title={h.label}
                      >
                        {h.color === 'transparent' && <span className="text-[10px] text-white">✕</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Font Color (A) */}
              <div className="relative word-ribbon-dropdown">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex items-center gap-0.5 p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
                  title="Font Color"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-extrabold text-xs">A</span>
                    <span className="w-3.5 h-1 rounded-full mt-0.5" style={{ backgroundColor: textColor }}></span>
                  </div>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-1 p-2 bg-[#1E1F22] border border-slate-600 rounded-lg shadow-2xl z-50 grid grid-cols-4 gap-1.5 w-40">
                    {colorPalette.map((c) => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => handleSelectTextColor(c.color)}
                        className="w-7 h-7 rounded border border-slate-600 hover:scale-110 transition"
                        style={{ backgroundColor: c.color }}
                        title={c.label}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <span className="text-[9px] text-slate-500 text-center uppercase tracking-wider font-semibold">
              Font
            </span>
          </div>

          {/* GROUP 3: PARAGRAPH SECTION */}
          <div className="flex flex-col justify-between border-r border-slate-700/80 pr-3 pb-0.5 space-y-1">
            {/* Paragraph Row 1: Bullets, Numbering, Indents, Show/Hide Pilcrow */}
            <div className="flex items-center gap-1 flex-wrap">
              {/* Bulleted List */}
              <button
                type="button"
                onClick={() => execCmd('insertUnorderedList')}
                className={`p-1.5 rounded transition ${
                  activeFormats.insertUnorderedList
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Bullets"
              >
                <List className="w-3.5 h-3.5" />
              </button>

              {/* Numbered List */}
              <button
                type="button"
                onClick={() => execCmd('insertOrderedList')}
                className={`p-1.5 rounded transition ${
                  activeFormats.insertOrderedList
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Numbering"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>

              {/* Decrease Indent */}
              <button
                type="button"
                onClick={() => execCmd('outdent')}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
                title="Decrease Indent"
              >
                <Outdent className="w-3.5 h-3.5" />
              </button>

              {/* Increase Indent */}
              <button
                type="button"
                onClick={() => execCmd('indent')}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
                title="Increase Indent"
              >
                <Indent className="w-3.5 h-3.5" />
              </button>

              {/* Show/Hide Paragraph Marks */}
              <button
                type="button"
                onClick={() => setShowPilcrow(!showPilcrow)}
                className={`p-1.5 rounded transition ${
                  showPilcrow
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Show/Hide Paragraph Marks (¶)"
              >
                <Pilcrow className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Paragraph Row 2: Alignments & Line Spacing */}
            <div className="flex items-center gap-1 flex-wrap">
              {/* Align Left */}
              <button
                type="button"
                onClick={() => execCmd('justifyLeft')}
                className={`p-1.5 rounded transition ${
                  activeFormats.justifyLeft
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Align Left (Ctrl+L)"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>

              {/* Align Center */}
              <button
                type="button"
                onClick={() => execCmd('justifyCenter')}
                className={`p-1.5 rounded transition ${
                  activeFormats.justifyCenter
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Center (Ctrl+E)"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>

              {/* Align Right */}
              <button
                type="button"
                onClick={() => execCmd('justifyRight')}
                className={`p-1.5 rounded transition ${
                  activeFormats.justifyRight
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Align Right (Ctrl+R)"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>

              {/* Justify */}
              <button
                type="button"
                onClick={() => execCmd('justifyFull')}
                className={`p-1.5 rounded transition ${
                  activeFormats.justifyFull
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Justify (Ctrl+J)"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>

              {/* Line and Paragraph Spacing */}
              <div className="relative word-ribbon-dropdown ml-1">
                <button
                  type="button"
                  onClick={() => setShowSpacingDropdown(!showSpacingDropdown)}
                  className="flex items-center gap-0.5 px-1.5 py-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
                  title="Line and Paragraph Spacing"
                >
                  <Baseline className="w-3.5 h-3.5" />
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>
                {showSpacingDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-32 bg-[#1E1F22] border border-slate-600 rounded-lg shadow-2xl z-50 py-1">
                    {['1.0', '1.15', '1.5', '2.0'].map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => handleSelectLineSpacing(sp)}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-blue-600 hover:text-white"
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <span className="text-[9px] text-slate-500 text-center uppercase tracking-wider font-semibold">
              Paragraph
            </span>
          </div>

          {/* GROUP 4: STYLES TILES (EXACTLY LIKE MS WORD SCREENSHOT) */}
          <div className="flex flex-col justify-between pb-0.5 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              
              {/* Normal Style Tile */}
              <button
                type="button"
                onClick={() => handleApplyStyle('Normal')}
                className="px-3 py-1.5 bg-white text-slate-900 border border-slate-300 hover:border-blue-500 rounded-md font-sans text-xs font-medium shadow-xs transition hover:bg-blue-50/50 flex flex-col items-center justify-center min-w-[65px] h-[46px]"
                title="Normal Style"
              >
                <span className="font-bold text-slate-900">Normal</span>
                <span className="text-[9px] text-slate-500">12pt body</span>
              </button>

              {/* No Spacing Style Tile */}
              <button
                type="button"
                onClick={() => handleApplyStyle('No Spacing')}
                className="px-2.5 py-1.5 bg-white text-slate-900 border border-slate-300 hover:border-blue-500 rounded-md font-sans text-xs font-medium shadow-xs transition hover:bg-blue-50/50 flex flex-col items-center justify-center min-w-[75px] h-[46px]"
                title="No Spacing Style"
              >
                <span className="font-bold text-slate-900">No Spacing</span>
                <span className="text-[9px] text-slate-500">Compact</span>
              </button>

              {/* Heading 1 Style Tile */}
              <button
                type="button"
                onClick={() => handleApplyStyle('Heading 1')}
                className="px-3 py-1.5 bg-white text-blue-900 border border-slate-300 hover:border-blue-500 rounded-md font-sans text-xs font-bold shadow-xs transition hover:bg-blue-50/50 flex flex-col items-center justify-center min-w-[75px] h-[46px]"
                title="Heading 1"
              >
                <span className="font-black text-blue-900 text-sm">Heading 1</span>
                <span className="text-[9px] text-blue-600">Title 18pt</span>
              </button>

              {/* Heading 2 Style Tile */}
              <button
                type="button"
                onClick={() => handleApplyStyle('Heading 2')}
                className="px-3 py-1.5 bg-white text-blue-800 border border-slate-300 hover:border-blue-500 rounded-md font-sans text-xs font-bold shadow-xs transition hover:bg-blue-50/50 flex flex-col items-center justify-center min-w-[75px] h-[46px]"
                title="Heading 2"
              >
                <span className="font-bold text-blue-800">Heading 2</span>
                <span className="text-[9px] text-blue-500">Sub 15pt</span>
              </button>

              {/* Heading 3 Style Tile */}
              <button
                type="button"
                onClick={() => handleApplyStyle('Heading 3')}
                className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 hover:border-blue-500 rounded-md font-sans text-xs font-semibold shadow-xs transition hover:bg-blue-50/50 flex flex-col items-center justify-center min-w-[75px] h-[46px]"
                title="Heading 3"
              >
                <span className="font-semibold text-slate-700">Heading 3</span>
                <span className="text-[9px] text-slate-400">Section 13pt</span>
              </button>

            </div>

            <span className="text-[9px] text-slate-500 text-center uppercase tracking-wider font-semibold">
              Styles
            </span>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* WORD HORIZONTAL RULER BAR (AUTHENTIC WORD FEEL)          */}
      {/* ======================================================== */}
      <div className="bg-slate-100 border-b border-slate-200 px-8 py-1 flex items-center justify-between text-[10px] text-slate-400 font-mono select-none">
        <div className="flex items-center gap-12 w-full max-w-4xl mx-auto px-4">
          <span>| 1</span>
          <span>| 2</span>
          <span>| 3</span>
          <span>| 4</span>
          <span>| 5</span>
          <span>| 6</span>
          <span>| 7</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DOCUMENT PAPER CANVAS (EDITABLE WORD PAGE)               */}
      {/* ======================================================== */}
      <div className="bg-slate-200/70 p-4 sm:p-6 overflow-y-auto max-h-[600px] flex justify-center">
        {viewMode === 'visual' ? (
          <div
            ref={editorRef}
            contentEditable={true}
            spellCheck={true}
            onInput={handleEditorInput}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            data-placeholder={placeholder}
            className={`w-full max-w-4xl bg-white rounded-lg shadow-md border border-slate-300/80 p-8 sm:p-12 text-slate-800 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-sans min-h-[380px] ${
              showPilcrow ? 'word-show-pilcrow' : ''
            }`}
            style={{
              minHeight: minHeight,
              fontFamily: currentFont,
              lineHeight: '1.7',
            }}
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => {
              if (onChange) onChange(e.target.value);
            }}
            rows={16}
            className="w-full max-w-4xl bg-slate-900 text-emerald-400 font-mono text-xs p-6 rounded-lg shadow-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 leading-relaxed resize-y"
            placeholder="Edit raw HTML markup..."
          />
        )}
      </div>

      {/* ======================================================== */}
      {/* MICROSOFT WORD BLUE STATUS BAR                           */}
      {/* ======================================================== */}
      <div className="bg-[#1E3A8A] text-white px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-sans select-none">
        <div className="flex items-center gap-4">
          <span className="font-medium">Page 1 of 1</span>
          <span className="opacity-80">|</span>
          <span className="font-semibold">{stats.words} words</span>
          <span className="opacity-80">|</span>
          <span className="opacity-90">{stats.characters} characters</span>
          <span className="hidden sm:inline opacity-80">|</span>
          <span className="hidden sm:inline opacity-90">English (India)</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-blue-700/60 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded">
            100% Zoom
          </span>
          <span className="text-[10px] text-blue-200">Print Layout</span>
        </div>
      </div>

    </div>
  );
}
