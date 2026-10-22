import MonacoEditor from '@monaco-editor/react';
export function Editor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <MonacoEditor
      height="100%" defaultLanguage="json" value={value}
      onChange={(v) => onChange(v ?? '')}
      options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on', wordWrap: 'on', scrollBeyondLastLine: false, automaticLayout: true, tabSize: 2 }}
    />
  );
}
