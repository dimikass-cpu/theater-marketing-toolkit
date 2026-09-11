import { useState } from "react";

// ── API ──────────────────────────────────────────────
async function callClaude(prompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  return data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

// ── DESIGN TOKENS ────────────────────────────────────
const T = {
  bg:       "#F7F7F5",
  surface:  "#FFFFFF",
  border:   "#E8E8E4",
  accent:   "#2D5BE3",
  ink:      "#0F0F0F",
  muted:    "#6B6B68",
  error:    "#C0392B",
};

const font = "'DM Sans', system-ui, sans-serif";

// ── SHARED COMPONENTS ────────────────────────────────
function Label({ children }) {
  return (
    <div style={{
      fontFamily: font, fontSize: 12, fontWeight: 600,
      color: T.muted, marginBottom: 6, letterSpacing: "0.01em",
    }}>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

const inputBase = {
  width: "100%",
  fontFamily: font,
  fontSize: 14,
  color: T.ink,
  background: T.surface,
  border: `1.5px solid ${T.border}`,
  borderRadius: 8,
  padding: "10px 12px",
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.15s",
};

function Input({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputBase, borderColor: focused ? T.accent : T.border }}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 5 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        resize: "vertical",
        lineHeight: 1.6,
        borderColor: focused ? T.accent : T.border,
      }}
    />
  );
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{ ...inputBase, cursor: "pointer", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B6B68' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
        paddingRight: 32,
      }}
    >
      {children}
    </select>
  );
}

function RunButton({ onClick, disabled, loading, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        fontFamily: font,
        fontSize: 14,
        fontWeight: 600,
        color: "#FFFFFF",
        background: disabled ? "#C8C8C4" : T.accent,
        border: "none",
        borderRadius: 8,
        padding: "12px 0",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s",
        marginTop: 4,
      }}
    >
      {loading ? "Bezig…" : label}
    </button>
  );
}

function ToneField({ value, onChange, placeholder }) {
  return (
    <Field label="Toon & stijl (optioneel)">
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </Field>
  );
}

function Output({ result, error, meta }) {
  const [copied, setCopied] = useState(false);
  if (error) {
    return (
      <div style={{
        marginTop: 20, padding: "12px 14px",
        background: "#FEF2F2", borderRadius: 8,
        border: `1.5px solid #F5C6C6`,
        fontFamily: font, fontSize: 13, color: T.error,
      }}>
        {error}
      </div>
    );
  }
  if (!result) return null;
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{
        borderLeft: `3px solid ${T.accent}`,
        paddingLeft: 16,
        paddingTop: 2,
        paddingBottom: 2,
      }}>
        {meta && (
          <div style={{
            fontFamily: font, fontSize: 11, fontWeight: 600,
            color: T.accent, marginBottom: 8, letterSpacing: "0.04em",
          }}>
            {meta}
          </div>
        )}
        <div style={{
          fontFamily: font, fontSize: 14, color: T.ink,
          lineHeight: 1.7, whiteSpace: "pre-wrap",
        }}>
          {result}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
        <button
          onClick={() => {
            navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          style={{
            fontFamily: font, fontSize: 12, fontWeight: 600,
            color: copied ? T.muted : T.accent,
            background: "none", border: "none", cursor: "pointer",
            padding: 0, transition: "color 0.15s",
          }}
        >
          {copied ? "Gekopieerd ✓" : "Kopieer tekst"}
        </button>
      </div>
    </div>
  );
}

// ── TAB 1: SOCIAL POST ───────────────────────────────
function SocialTool() {
  const [text, setText]       = useState("");
  const [channel, setChannel] = useState("Instagram");
  const [cta, setCta]         = useState("");
  const [tone, setTone]       = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState("");
  const [error, setError]     = useState("");

  const run = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult("");
    try {
      const toneClause = tone.trim() ? `\nToon & stijl: ${tone.trim()}` : "";
      const ctaClause  = cta.trim()  ? `\nCall-to-action die erin moet: "${cta.trim()}"` : "";
      const prompt = `Schrijf een social media bericht in het Nederlands voor het kanaal ${channel}.${ctaClause}${toneClause}

Bronmateriaal:
"""
${text}
"""

Schrijf ALLEEN het bericht zelf. Geen aanhalingstekens eromheen, geen uitleg, geen titel. Pas de lengte en toon aan op het kanaal: Instagram is korter en losser, Facebook iets voller.`;
      setResult(await callClaude(prompt));
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Field label="Brontekst">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Plak hier de tekst waarop het bericht gebaseerd moet worden…"
          rows={5}
        />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Kanaal">
          <Select value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option>Instagram</option>
            <option>Facebook</option>
            <option>LinkedIn</option>
          </Select>
        </Field>
        <Field label="Call-to-action (optioneel)">
          <Input
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            placeholder="bijv. Koop nu je kaartjes"
          />
        </Field>
      </div>
      <ToneField
        value={tone}
        onChange={(e) => setTone(e.target.value)}
        placeholder="bijv. enthousiast en informeel, gebruik jij/jou"
      />
      <RunButton
        onClick={run}
        disabled={loading || !text.trim()}
        loading={loading}
        label="Genereer bericht"
      />
      <Output result={result} error={error} meta={`Klaar voor ${channel}`} />
    </div>
  );
}

// ── TAB 2: TEXT TRIMMER ──────────────────────────────
function TrimTool() {
  const [text, setText]       = useState("");
  const [limit, setLimit]     = useState("300");
  const [tone, setTone]       = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState("");
  const [error, setError]     = useState("");

  const charLimit = parseInt(limit, 10);

  const run = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult("");
    try {
      const toneClause = tone.trim() ? `\nToon & stijl: ${tone.trim()}` : "";
      const prompt = `Verkort de volgende Nederlandse tekst tot MAXIMAAL ${charLimit} tekens (inclusief spaties). Behoud de kern van de boodschap. Schrijf vloeiende lopende tekst, geen opsomming.${toneClause} Geef ALLEEN de verkorte tekst terug, niets anders.

Originele tekst:
"""
${text}
"""`;
      setResult(await callClaude(prompt));
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  const overLimit = result.length > charLimit;

  return (
    <div>
      <Field label="Tekenlimiet">
        <Select value={limit} onChange={(e) => setLimit(e.target.value)}>
          <option value="100">100 tekens</option>
          <option value="200">200 tekens</option>
          <option value="300">300 tekens</option>
          <option value="500">500 tekens</option>
          <option value="1000">1000 tekens</option>
        </Select>
      </Field>
      <ToneField
        value={tone}
        onChange={(e) => setTone(e.target.value)}
        placeholder="bijv. zakelijk en bondig, geen uitroeptekens"
      />
      <Field label="Originele tekst">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Plak hier de tekst die verkort moet worden…"
          rows={6}
        />
        <div style={{
          fontFamily: font, fontSize: 11, color: T.muted,
          textAlign: "right", marginTop: 4,
        }}>
          {text.length} tekens
        </div>
      </Field>
      <RunButton
        onClick={run}
        disabled={loading || !text.trim()}
        loading={loading}
        label="Verkort tekst"
      />
      {result && (
        <div style={{ marginTop: 20 }}>
          <div style={{
            borderLeft: `3px solid ${overLimit ? T.error : T.accent}`,
            paddingLeft: 16,
          }}>
            <div style={{
              fontFamily: font, fontSize: 11, fontWeight: 600,
              color: overLimit ? T.error : T.accent,
              marginBottom: 8, letterSpacing: "0.04em",
            }}>
              {result.length} / {charLimit} tekens {overLimit ? "— nog te lang" : "✓"}
            </div>
            <div style={{
              fontFamily: font, fontSize: 14, color: T.ink,
              lineHeight: 1.7, whiteSpace: "pre-wrap",
            }}>
              {result}
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <Output result={result} error={error} />
          </div>
        </div>
      )}
      {error && <Output result="" error={error} />}
    </div>
  );
}

// ── TAB 3: PRESS RELEASE ────────────────────────────
function PressTool() {
  const [text, setText]       = useState("");
  const [goal, setGoal]       = useState("");
  const [tone, setTone]       = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState("");
  const [error, setError]     = useState("");

  const run = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult("");
    try {
      const toneClause = tone.trim() ? `\nToon & stijl: ${tone.trim()}` : "";
      const goalClause = goal.trim() ? `Doel / doelgroep: "${goal.trim()}"` : "Doel / doelgroep: niet opgegeven, leid dit af uit de tekst.";
      const prompt = `Je bent een ervaren persvoorlichter. Beoordeel en herschrijf het volgende persberichtconcept. ${goalClause}${toneClause}

Concept:
"""
${text}
"""

Geef je antwoord in twee delen, exact in dit format:

FEEDBACK:
(3–5 korte bullet punten over toon, opbouw, nieuwswaarde en eventueel ontbrekende informatie)

HERSCHREVEN VERSIE:
(de aangescherpte tekst, klaar voor publicatie)`;
      setResult(await callClaude(prompt));
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Field label="Doel / doelgroep (optioneel)">
        <Input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="bijv. lokale pers, brede consumentenmarkt"
        />
      </Field>
      <ToneField
        value={tone}
        onChange={(e) => setTone(e.target.value)}
        placeholder="bijv. professioneel maar toegankelijk, geen vakjargon"
      />
      <Field label="Concept persbericht">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Plak hier het concept dat beoordeeld en herschreven moet worden…"
          rows={8}
        />
      </Field>
      <RunButton
        onClick={run}
        disabled={loading || !text.trim()}
        loading={loading}
        label="Beoordeel en herschrijf"
      />
      <Output result={result} error={error} meta="Feedback & herschreven versie" />
    </div>
  );
}

// ── APP SHELL ────────────────────────────────────────
const TABS = [
  { id: "social",  label: "Social post" },
  { id: "trim",    label: "Tekst trimmen" },
  { id: "press",   label: "Persbericht" },
];

export default function WritingToolkit() {
  const [active, setActive] = useState("social");

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      display: "flex",
      justifyContent: "center",
      padding: "48px 16px 80px",
      boxSizing: "border-box",
    }}>
      <div style={{ width: "100%", maxWidth: 560 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: font, fontSize: 22, fontWeight: 600,
            color: T.ink, margin: 0, letterSpacing: "-0.02em",
          }}>
            Schrijfassistent
          </h1>
          <p style={{
            fontFamily: font, fontSize: 14, color: T.muted,
            margin: "6px 0 0", lineHeight: 1.5,
          }}>
            Genereer, verkort en verbeter teksten met AI.
          </p>
        </div>

        {/* Tab bar */}
        <div style={{
          display: "flex",
          background: T.border,
          borderRadius: 10,
          padding: 3,
          marginBottom: 28,
          gap: 2,
        }}>
          {TABS.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                style={{
                  flex: 1,
                  fontFamily: font,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? T.ink : T.muted,
                  background: isActive ? T.surface : "transparent",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 0",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tool panel */}
        <div style={{
          background: T.surface,
          border: `1.5px solid ${T.border}`,
          borderRadius: 12,
          padding: 24,
        }}>
          {active === "social" && <SocialTool />}
          {active === "trim"   && <TrimTool />}
          {active === "press"  && <PressTool />}
        </div>

        {/* Footer */}
        <p style={{
          fontFamily: font, fontSize: 11, color: T.muted,
          textAlign: "center", marginTop: 24,
        }}>
          Alle uitvoer is een concept — controleer voor gebruik.
        </p>
      </div>
    </div>
  );
}
