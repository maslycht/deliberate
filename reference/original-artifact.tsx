/**
 * Original "Decision Matrix" React artifact.
 *
 * This file is kept as a reference for the Vue 3 rewrite ("Deliberate").
 * It should be removed once all functionality has been translated.
 */

import { useState, useEffect, useRef } from "react";
// ─── Utilities ────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
function getWeight(idx, total) {
  if (total === 1) return 5;
  return Math.max(1, Math.min(5, 5 - Math.floor((idx * 4) / (total - 1))));
}
function getWeights(total) {
  return Array.from({ length: total }, (_, i) => getWeight(i, total));
}
function getCompletionStatus(item, categories) {
  const done = categories.filter(c => item.scores?.[c.id] != null).length;
  return { done, total: categories.length };
}
function isComplete(item, categories) {
  const { done, total } = getCompletionStatus(item, categories);
  return total > 0 && done === total;
}
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
const STORAGE_KEY = "decision-matrix-v1";
const DEFAULT_CATEGORIES = [
  { id: uid(), name: "Criteria 1" },
  { id: uid(), name: "Criteria 2" },
  { id: uid(), name: "Criteria 3" },
];
// ─── Tab: Setup ───────────────────────────────────────────────────────────────
function SetupTab({ categories, setCategories, items, setItems, onGoToScore }) {
  const [newCatName, setNewCatName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemDetails, setNewItemDetails] = useState("");
  const dragRef = useRef(null);
  const dragOverRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const weights = getWeights(categories.length);
  const canScore = categories.length >= 1 && items.length >= 2;
  const addCategory = () => {
    if (!newCatName.trim()) return;
    setCategories(prev => [...prev, { id: uid(), name: newCatName.trim() }]);
    setNewCatName("");
  };
  const removeCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setItems(prev => prev.map(item => {
      const scores = { ...item.scores };
      delete scores[id];
      return { ...item, scores };
    }));
  };
  const updateCatName = (id, name) =>
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  const addItem = () => {
    if (!newItemName.trim()) return;
    setItems(prev => [...prev, { id: uid(), name: newItemName.trim(), details: newItemDetails.trim(), scores: {} }]);
    setNewItemName("");
    setNewItemDetails("");
  };
  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const onDragStart = (e, idx) => { dragRef.current = idx; setDragging(idx); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = (e, idx) => { e.preventDefault(); dragOverRef.current = idx; };
  const onDrop = () => {
    const from = dragRef.current, to = dragOverRef.current;
    if (from != null && to != null && from !== to) {
      setCategories(prev => {
        const arr = [...prev];
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
        return arr;
      });
    }
    dragRef.current = null; dragOverRef.current = null; setDragging(null);
  };
  return (
    <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 320px", minWidth: 280 }}>
        <SectionHeader title="Categories" subtitle="Drag to reorder — position determines weight (top = highest)" />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {categories.map((cat, idx) => (
            <div key={cat.id} draggable
              onDragStart={e => onDragStart(e, idx)} onDragOver={e => onDragOver(e, idx)}
              onDrop={onDrop} onDragEnd={() => setDragging(null)}
              style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "grab", userSelect: "none", opacity: dragging === idx ? 0.4 : 1, transition: "opacity 0.15s" }}
            >
              <span style={{ color: "var(--muted)", fontSize: "1.1rem" }}>⠿</span>
              <div style={{ background: "var(--accent)", color: "var(--bg)", borderRadius: "6px", padding: "2px 8px", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)", minWidth: 28, textAlign: "center", flexShrink: 0 }}>×{weights[idx]}</div>
              <input value={cat.name} onChange={e => updateCatName(cat.id, e.target.value)}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--text)" }} />
              <button onClick={() => removeCategory(cat.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "1.1rem", padding: "0 2px", lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>
          ))}
          {categories.length === 0 && <EmptyState text="No categories yet." />}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCategory()}
            placeholder="New category name…" style={inputStyle} />
          <Btn onClick={addCategory} small>Add</Btn>
        </div>
        <div style={{ marginTop: "0.85rem", padding: "0.7rem 0.9rem", background: "var(--subtle)", borderRadius: "8px", fontSize: "0.77rem", color: "var(--muted)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--text)" }}>How weights work:</strong> The ×N badge is auto-assigned by position. Top = most important. Final score = Σ (rating × weight).
        </div>
      </div>
      <div style={{ flex: "1 1 320px", minWidth: 280 }}>
        <SectionHeader title="Options" subtitle="Add options to compare" />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {items.map(item => {
            const { done, total } = getCompletionStatus(item, categories);
            const complete = done === total && total > 0;
            return (
              <div key={item.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                  {item.details && <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.details}</div>}
                </div>
                <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: complete ? "var(--green)" : "var(--muted)", flexShrink: 0 }}>{done}/{total}</div>
                <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "1.1rem", padding: "0 2px", lineHeight: 1 }}>×</button>
              </div>
            );
          })}
          {items.length === 0 && <EmptyState text="No options yet. Add one below." />}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <input value={newItemName} onChange={e => setNewItemName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addItem()}
            placeholder="Option name…" style={inputStyle} />
          <textarea value={newItemDetails} onChange={e => setNewItemDetails(e.target.value)}
            placeholder="Details (optional)…" rows={3}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
          <Btn onClick={addItem} small>Add Option</Btn>
        </div>
        <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
          <Btn onClick={onGoToScore} disabled={!canScore} style={{ width: "100%" }}>Start Scoring →</Btn>
          {!canScore && (
            <div style={{ textAlign: "center", fontSize: "0.77rem", color: "var(--muted)", marginTop: "0.5rem" }}>
              {categories.length === 0 ? "Add at least one category first" : items.length < 2 ? `Add ${2 - items.length} more option${items.length === 0 ? "s" : ""} to begin` : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ─── Tab: Scoring ─────────────────────────────────────────────────────────────
function ScoringTab({ categories, items, setItems, onGoToResults }) {
  const [queue, setQueue] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(null);
  const [localScores, setLocalScores] = useState({});
  const [initialized, setInitialized] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const allComplete = items.length > 0 && items.every(item => isComplete(item, categories));
  useEffect(() => {
    const incomplete = items.filter(i => { const { done, total } = getCompletionStatus(i, categories); return done > 0 && done < total; });
    const noScores = items.filter(i => Object.keys(i.scores || {}).length === 0);
    const complete = items.filter(i => isComplete(i, categories));
    const ordered = [...shuffle(incomplete), ...shuffle(noScores), ...shuffle(complete)];
    setQueue(ordered.map(i => i.id));
    setCurrentIdx((incomplete.length > 0 || noScores.length > 0) ? 0 : null);
    setLocalScores({});
    setInitialized(true);
  }, []);
  const handleReset = () => {
    const cleared = items.map(item => ({ ...item, scores: {} }));
    setItems(() => cleared);
    setQueue(shuffle([...cleared]).map(i => i.id));
    setCurrentIdx(0);
    setLocalScores({});
    setConfirmReset(false);
  };
  const ResetButton = () => confirmReset ? (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
      <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>Sure?</span>
      <button onClick={handleReset} style={{ background: "var(--accent)", border: "none", cursor: "pointer", color: "var(--bg)", fontSize: "0.75rem", fontFamily: "var(--font-body)", fontWeight: 600, borderRadius: "6px", padding: "0.3rem 0.7rem" }}>Yes, reset</button>
      <button onClick={() => setConfirmReset(false)} style={{ background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "var(--muted)", fontSize: "0.75rem", fontFamily: "var(--font-body)", borderRadius: "6px", padding: "0.3rem 0.7rem" }}>Cancel</button>
    </div>
  ) : (
    <button onClick={() => setConfirmReset(true)} style={{ background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "var(--muted)", fontSize: "0.78rem", fontFamily: "var(--font-body)", borderRadius: "6px", padding: "0.3rem 0.7rem" }}>Reset all scores</button>
  );
  if (!initialized) return null;
  if (items.length === 0) return <Placeholder icon="📋" text="Add options in the Setup tab first." />;
  if (categories.length === 0) return <Placeholder icon="🏷️" text="Add categories in the Setup tab first." />;
  if (currentIdx === null) {
    return (
      <ScoringListView items={items} categories={categories} queue={queue} allComplete={allComplete}
        onSelectItem={(itemId) => { const idx = queue.indexOf(itemId); setCurrentIdx(idx >= 0 ? idx : 0); setLocalScores({}); }}
        onReset={<ResetButton />} onGoToResults={onGoToResults} />
    );
  }
  if (currentIdx >= queue.length) { setTimeout(() => setCurrentIdx(null), 0); return null; }
  const currentItemId = queue[currentIdx];
  const currentItem = items.find(i => i.id === currentItemId);
  if (!currentItem) { setCurrentIdx(i => i + 1); return null; }
  const weights = getWeights(categories.length);
  const allFilled = categories.every(c => (localScores[c.id] ?? currentItem.scores?.[c.id]) != null);
  const progress = currentIdx / queue.length;
  const handleSave = () => {
    setItems(prev => prev.map(item => item.id === currentItem.id ? { ...item, scores: { ...item.scores, ...localScores } } : item));
    setLocalScores({});
    const next = currentIdx + 1;
    if (next >= queue.length) setCurrentIdx(null); else setCurrentIdx(next);
  };
  const handleSkip = () => { setLocalScores({}); const next = currentIdx + 1; if (next >= queue.length) setCurrentIdx(null); else setCurrentIdx(next); };
  const handleBackToList = () => { setLocalScores({}); setCurrentIdx(null); };
  return (
    <div style={{ maxWidth: 540, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <button onClick={handleBackToList} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "0.82rem", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: "0.3rem", padding: 0 }}>← Back to list</button>
        <ResetButton />
      </div>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--muted)", marginBottom: "0.4rem", fontFamily: "var(--font-mono)" }}>
          <span>Option {currentIdx + 1} of {queue.length}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress * 100}%`, background: "var(--accent)", transition: "width 0.3s ease", borderRadius: 2 }} />
        </div>
      </div>
      <div style={{ background: "var(--card)", border: "2px solid var(--accent)", borderRadius: "14px", padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <div style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.2rem" }}>Now scoring</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--text)", margin: 0 }}>{currentItem.name}</h2>
        {currentItem.details && <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.4rem", whiteSpace: "pre-wrap" }}>{currentItem.details}</div>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
        {categories.map((cat, idx) => {
          const w = weights[idx];
          const score = localScores[cat.id] ?? currentItem.scores?.[cat.id] ?? null;
          return (
            <div key={cat.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.9rem 1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text)" }}>{cat.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>weight ×{w}</span>
                  {score != null && <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 700 }}>= {score * w} pts</span>}
                </div>
              </div>
              <ScorePicker value={score} onChange={v => setLocalScores(prev => ({ ...prev, [cat.id]: v }))} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <Btn onClick={handleSave} disabled={!allFilled} style={{ flex: 1 }}>Save & {currentIdx < queue.length - 1 ? "Next →" : "Finish ✓"}</Btn>
        <Btn onClick={handleSkip} variant="ghost" small>Skip</Btn>
      </div>
      {!allFilled && <div style={{ textAlign: "center", fontSize: "0.77rem", color: "var(--muted)", marginTop: "0.6rem" }}>Rate all categories to continue</div>}
    </div>
  );
}
function ScoringListView({ items, categories, queue, allComplete, onSelectItem, onReset, onGoToResults }) {
  const orderedItems = queue.map(id => items.find(i => i.id === id)).filter(Boolean);
  return (
    <div style={{ maxWidth: 540, margin: "0 auto" }}>
      {allComplete ? (
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✓</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--text)", marginBottom: "0.35rem" }}>All scored!</h2>
          <p style={{ color: "var(--muted)", marginBottom: "1.25rem" }}>Click any option below to review or edit its scores.</p>
          <Btn onClick={onGoToResults} style={{ minWidth: 200 }}>View Results →</Btn>
        </div>
      ) : (
        <div style={{ marginBottom: "1.25rem" }}>
          <SectionHeader title="Options" subtitle="Click an option to score it. Incomplete items are shown first." />
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {orderedItems.map(item => {
          const { done, total } = getCompletionStatus(item, categories);
          const complete = done === total && total > 0;
          return (
            <button key={item.id} onClick={() => onSelectItem(item.id)} style={{ background: "var(--card)", border: complete ? "1px solid var(--border)" : "1.5px solid var(--accent)", borderRadius: "10px", padding: "0.85rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", textAlign: "left", width: "100%", transition: "box-shadow 0.12s" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: complete ? "var(--green)" : "var(--accent)" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                {item.details && <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.details}</div>}
              </div>
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: complete ? "var(--green)" : "var(--accent)" }}>{done}/{total}</span>
                <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>›</span>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>{onReset}</div>
    </div>
  );
}
function ScorePicker({ value, onChange }) {
  const labels = ["Poor", "Fair", "OK", "Good", "Great"];
  return (
    <div style={{ display: "flex", gap: "0.4rem" }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)} title={labels[n - 1]} style={{ flex: 1, padding: "0.45rem 0", borderRadius: "7px", border: value === n ? "2px solid var(--accent)" : "1.5px solid var(--border)", background: value === n ? "var(--accent)" : "transparent", color: value === n ? "var(--bg)" : "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "0.9rem", fontWeight: value === n ? 700 : 400, cursor: "pointer", transition: "all 0.1s", lineHeight: 1 }}>
          {n}
          <div style={{ fontSize: "0.55rem", marginTop: 2, opacity: 0.75, fontFamily: "var(--font-body)" }}>{labels[n - 1]}</div>
        </button>
      ))}
    </div>
  );
}
// ─── Tab: Results ─────────────────────────────────────────────────────────────
function ViewToggle({ view, onChange }) {
  return (
    <div style={{ display: "inline-flex", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
      {[{ value: "list", label: "List" }, { value: "table", label: "Table" }].map(({ value, label }) => (
        <button key={value} onClick={() => onChange(value)} style={{ padding: "0.35rem 1rem", background: view === value ? "var(--text)" : "transparent", color: view === value ? "var(--bg)" : "var(--muted)", border: "none", borderRight: value === "list" ? "1px solid var(--border)" : "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: view === value ? 600 : 400, transition: "all 0.12s" }}>{label}</button>
      ))}
    </div>
  );
}
function ResultsTab({ categories, items }) {
  const [view, setView] = useState("list");
  const weights = getWeights(categories.length);
  const ranked = items.map(item => {
    const breakdown = categories.map((cat, idx) => { const w = weights[idx]; const score = item.scores?.[cat.id] ?? null; return { cat, weight: w, score, weighted: score != null ? score * w : null }; });
    const total = breakdown.reduce((sum, b) => sum + (b.weighted ?? 0), 0);
    const maxPossible = weights.reduce((sum, w) => sum + 5 * w, 0);
    return { ...item, total, maxPossible, breakdown };
  }).sort((a, b) => b.total - a.total);
  if (items.length === 0) return <Placeholder icon="📊" text="No options to show yet." />;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div style={{ fontSize: "0.8rem", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{ranked.length} option{ranked.length !== 1 ? "s" : ""} · sorted by score</div>
        <ViewToggle view={view} onChange={setView} />
      </div>
      {view === "list" ? <ResultsListView ranked={ranked} categories={categories} /> : <ResultsTableView ranked={ranked} categories={categories} />}
    </div>
  );
}
function ResultsListView({ ranked, categories }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 680, margin: "0 auto" }}>
      {ranked.map((item, rank) => {
        const { done, total: catTotal } = getCompletionStatus(item, categories);
        const complete = done === catTotal && catTotal > 0;
        const pct = item.maxPossible > 0 ? item.total / item.maxPossible : 0;
        return (
          <div key={item.id} style={{ background: "var(--card)", border: rank === 0 && complete ? "2px solid var(--accent)" : "1px solid var(--border)", borderRadius: "14px", padding: "1.25rem 1.5rem", position: "relative", overflow: "hidden" }}>
            {rank === 0 && complete && <div style={{ position: "absolute", top: 0, right: 0, background: "var(--accent)", color: "var(--bg)", fontSize: "0.68rem", fontFamily: "var(--font-mono)", fontWeight: 700, padding: "3px 10px", borderBottomLeftRadius: "8px", letterSpacing: "0.06em" }}>TOP PICK</div>}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "0.75rem" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: rank === 0 && complete ? "var(--accent)" : "var(--muted)", lineHeight: 1, minWidth: 40, fontWeight: 800 }}>#{rank + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)" }}>{item.name}</div>
                {item.details && <div style={{ fontSize: "0.77rem", color: "var(--muted)", marginTop: 2, whiteSpace: "pre-wrap" }}>{item.details}</div>}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem", fontWeight: 700, color: complete ? "var(--text)" : "var(--muted)" }}>{item.total}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>/ {item.maxPossible} pts</div>
              </div>
            </div>
            <div style={{ height: 3, background: "var(--border)", borderRadius: 2, marginBottom: "0.85rem", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct * 100}%`, background: complete ? "var(--accent)" : "var(--border)", borderRadius: 2, transition: "width 0.5s ease" }} />
            </div>
            {complete ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {item.breakdown.map(({ cat, weight, score, weighted }) => (
                  <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem" }}>
                    <div style={{ flex: 1, color: "var(--muted)" }}>{cat.name}</div>
                    <div style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", fontSize: "0.75rem" }}>{score} × {weight}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text)", minWidth: 32, textAlign: "right" }}>{weighted}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "0.78rem", color: "var(--muted)", fontStyle: "italic" }}>{done}/{catTotal} categories scored</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
function ResultsTableView({ ranked, categories }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-body)", fontSize: "0.85rem" }}>
        <thead>
          <tr>
            <th style={thStyle({ isFirst: true })}>Rank</th>
            <th style={thStyle({})}>Option</th>
            {categories.map((cat, idx) => (
              <th key={cat.id} style={thStyle({ numeric: true })}>
                <div style={{ fontWeight: 700 }}>{cat.name}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "var(--font-mono)", fontWeight: 400, marginTop: 2 }}>×{getWeight(idx, categories.length)}</div>
              </th>
            ))}
            <th style={thStyle({ numeric: true, isLast: true })}>Total</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((item, rank) => {
            const { done, total: catTotal } = getCompletionStatus(item, categories);
            const complete = done === catTotal && catTotal > 0;
            const isTop = rank === 0 && complete;
            return (
              <tr key={item.id} style={{ background: isTop ? "rgba(200,92,45,0.04)" : rank % 2 === 0 ? "var(--card)" : "var(--bg)" }}>
                <td style={tdStyle({ isFirst: true })}><span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: isTop ? "var(--accent)" : "var(--muted)" }}>#{rank + 1}</span></td>
                <td style={tdStyle({})}>
                  <div style={{ fontWeight: 600, color: "var(--text)" }}>{item.name}</div>
                  {item.details && <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 1 }}>{item.details}</div>}
                </td>
                {item.breakdown.map(({ cat, score, weighted }) => (
                  <td key={cat.id} style={tdStyle({ numeric: true })}>
                    {score != null ? (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text)", fontSize: "0.95rem" }}>{score}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--muted)", marginTop: 1 }}>={weighted}</div>
                      </div>
                    ) : <div style={{ textAlign: "center", color: "var(--border)", fontSize: "1rem" }}>—</div>}
                  </td>
                ))}
                <td style={tdStyle({ numeric: true, isLast: true })}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.05rem", color: complete ? (isTop ? "var(--accent)" : "var(--text)") : "var(--muted)" }}>{item.total}</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 1 }}>/{item.maxPossible}</div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
function thStyle({ isFirst, isLast, numeric } = {}) {
  return { padding: "0.65rem 1rem", textAlign: numeric ? "center" : "left", fontWeight: 700, fontSize: "0.78rem", color: "var(--text)", background: "var(--subtle)", borderBottom: "2px solid var(--border)", borderLeft: isFirst ? "none" : "1px solid var(--border)", whiteSpace: "nowrap", ...(isFirst ? { borderRadius: "10px 0 0 0" } : {}), ...(isLast ? { borderRadius: "0 10px 0 0" } : {}) };
}
function tdStyle({ isFirst, numeric } = {}) {
  return { padding: "0.6rem 1rem", borderBottom: "1px solid var(--border)", borderLeft: isFirst ? "none" : "1px solid var(--border)", verticalAlign: "middle" };
}
// ─── Shared Components ────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--text)", margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: "0.79rem", color: "var(--muted)", margin: "0.2rem 0 0" }}>{subtitle}</p>}
    </div>
  );
}
function EmptyState({ text }) {
  return <div style={{ padding: "1.75rem", textAlign: "center", color: "var(--muted)", fontSize: "0.84rem", border: "1.5px dashed var(--border)", borderRadius: "10px" }}>{text}</div>;
}
function Placeholder({ icon, text }) {
  return <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--muted)" }}><div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{icon}</div><div>{text}</div></div>;
}
function Btn({ children, onClick, disabled, variant, small, style: extraStyle }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: small ? "0.45rem 1rem" : "0.65rem 1.5rem", background: variant === "ghost" ? "transparent" : disabled ? "var(--border)" : "var(--accent)", color: variant === "ghost" ? "var(--muted)" : disabled ? "var(--muted)" : "var(--bg)", border: variant === "ghost" ? "1px solid var(--border)" : "none", borderRadius: "8px", cursor: disabled ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: small ? "0.82rem" : "0.9rem", transition: "all 0.12s", ...extraStyle }}>{children}</button>
  );
}
const inputStyle = { padding: "0.55rem 0.85rem", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "var(--text)", outline: "none", width: "100%", boxSizing: "border-box" };
// ─── App Shell ────────────────────────────────────────────────────────────────
const TABS = ["Setup", "Score", "Results"];
export default function App() {
  const [tab, setTab] = useState(0);
  const [scoringKey, setScoringKey] = useState(0);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [items, setItems] = useState([]);
  const [storageReady, setStorageReady] = useState(false);
  // Load from persistent storage on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result?.value) {
          const saved = JSON.parse(result.value);
          if (saved.categories?.length) setCategories(saved.categories);
          if (saved.items) setItems(saved.items);
        }
      } catch {}
      setStorageReady(true);
    })();
  }, []);
  // Save to persistent storage whenever data changes (only after initial load)
  useEffect(() => {
    if (!storageReady) return;
    window.storage.set(STORAGE_KEY, JSON.stringify({ categories, items })).catch(() => {});
  }, [categories, items, storageReady]);
  const allComplete = items.length > 0 && categories.length > 0 && items.every(item => isComplete(item, categories));
  const goToTab = (idx) => {
    if (idx === 1) setScoringKey(k => k + 1);
    setTab(idx);
  };
  if (!storageReady) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f0e8", fontFamily: "sans-serif", color: "#9a9080", fontSize: "0.9rem" }}>
      Loading…
    </div>
  );
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;600;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #f5f0e8; --card: #fefcf7; --subtle: #ede8de; --border: #ddd7c9;
          --text: #2a2520; --muted: #9a9080; --accent: #c85c2d; --green: #3d8a5f;
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Sans', sans-serif;
          --font-mono: 'DM Mono', monospace;
        }
        body { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; }
        input:focus, textarea:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 2px rgba(200,92,45,0.15); outline: none; }
        button:hover:not(:disabled) { opacity: 0.85; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
      `}</style>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "var(--text)", color: "var(--bg)", padding: "1.25rem 2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ fontSize: "1.4rem" }}>⚖️</div>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", lineHeight: 1.1 }}>Decision Matrix</h1>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 2, letterSpacing: "0.05em" }}>DECISION MAKING TOOL</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.25rem" }}>
            {TABS.map((t, i) => {
              const locked = i === 2 && !allComplete;
              return (
                <button key={t} onClick={() => !locked && goToTab(i)} disabled={locked}
                  title={locked ? "Complete all scores to unlock" : ""}
                  style={{ padding: "0.4rem 1rem", background: tab === i ? "var(--accent)" : "transparent", color: locked ? "rgba(245,240,232,0.3)" : tab === i ? "var(--bg)" : "rgba(245,240,232,0.75)", border: "1px solid " + (tab === i ? "var(--accent)" : "rgba(245,240,232,0.2)"), borderRadius: "6px", cursor: locked ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 600, transition: "all 0.15s" }}
                >{t}{locked ? " 🔒" : ""}</button>
              );
            })}
          </div>
        </div>
        <div style={{ flex: 1, padding: "2rem", maxWidth: 1100, width: "100%", margin: "0 auto" }}>
          {tab === 0 && <SetupTab categories={categories} setCategories={setCategories} items={items} setItems={setItems} onGoToScore={() => goToTab(1)} />}
          {tab === 1 && <ScoringTab key={scoringKey} categories={categories} items={items} setItems={setItems} onGoToResults={() => goToTab(2)} />}
          {tab === 2 && <ResultsTab categories={categories} items={items} />}
        </div>
        <div style={{ textAlign: "center", padding: "1rem", fontSize: "0.72rem", color: "var(--muted)", fontFamily: "var(--font-mono)", borderTop: "1px solid var(--border)" }}>
          Data saved · {items.length} option{items.length !== 1 ? "s" : ""} · {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
        </div>
      </div>
    </>
  );
}
