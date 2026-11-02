const ICO: Record<string, string> = {
  cam: '<path d="M3 8h12v8H3zM15 11l6-3v8l-6-3"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  bell: '<path d="M6 17v-6a6 6 0 0112 0v6l2 2H4zM10 21h4"/>',
  wifi: '<path d="M2 9a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0"/><circle cx="12" cy="19" r="1"/>',
  gate: '<path d="M3 20V6M21 20V6M3 9h18M3 15h18M9 9v6M15 9v6"/>',
  bolt: '<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
  plug: '<path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 01-12 0zM12 17v5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  mon: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  tool: '<path d="M14 6a4 4 0 005 5l-9 9a2 2 0 01-3-3z"/>',
};

export default function Icon({ name }: { name: string }) {
  return <svg className="ic" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICO[name] ?? "" }} />;
}
