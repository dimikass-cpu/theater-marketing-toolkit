import { useState } from "react";

const TABS = [
  { id: "social", label: "Social Post", ticket: "01" },
  { id: "trim", label: "Trimmen", ticket: "02" },
  { id: "press", label: "Persbericht", ticket: "03" },
];

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

function TicketStub({ children, label }) {
  return (
    <div className="relative">
      <div
        className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full"
        style={{ background: "#F2EFE9" }}
      />
      <div
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full"
        style={{ background: "#F2EFE9" }}
      />
      <div
        className="border-2 rounded-lg px-6 py-5"
        style={{
          borderColor: "#1B1B1F",
          background: "#FFFFFF",
          borderStyle: "dashed",
        }}
      >
        <div
          className="text-xs tracking-widest uppercase mb-2 font-bold"
          style={{ color: "#E8472C", fontFamily: "Inter, sans-serif" }}
        >
          {label}
        </div>
        <div
          className="whitespace-pre-wrap text-sm leading-relaxed"
          style={{ color: "#1B1B1F", fontFamily: "Inter, sans-serif" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="mt-3 text-xs font-bold uppercase tracking-wide px-4 py-2 rounded transition-colors"
      style={{
        background: copied ? "#1B1B1F" : "#E8472C",
        color: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {copied ? "Gekopieerd ✓" : "Kopieer tekst"}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label
        className="block text-xs font-bold uppercase tracking-wide mb-1.5"
        style={{ color: "#6B6B70", fontFamily: "Inter, sans-serif" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  fontFamily: "Inter, sans-serif",
  borderColor: "#1B1B1F",
  color: "#1B1B1F",
};

function SocialTool() {
  const [text, setText] = useState("");
  const [channel, setChannel] = useState("Instagram");
  const [cta, setCta] = useState("Bekijk de film");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const generate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const toneInstruction = tone.trim()
        ? `\nToon & stijl instructies: ${tone.trim()}`
        : "";
      const prompt = `Je schrijft een social media bericht voor City of Wesopa, een theater/filmhuis. Kanaal: ${channel}. Call-to-action die erin moet: "${cta}".${toneInstruction}

Bronmateriaal (van website of theaterbureau):
"""
${text}
"""

Schrijf ALLEEN het social media bericht, in het Nederlands, passend bij de toon van ${channel} (Instagram = los en kort met evt. emoji, Facebook = iets voller). Pas de toon aan op de stijlinstructies als die zijn opgegeven. Geen aanhalingstekens om het bericht, geen uitleg, geen titel. Eindig met de call-to-action.`;
      const out = await callClaude(prompt);
      setResult(out);
    } catch (e) {
      setError("Kon geen bericht genereren. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Field label="Tekst van website / theaterbureau">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Plak hier de tekst over de voorstelling..."
          className="w-full border-2 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2"
          style={{ ...inputStyle, ringColor: "#E8472C" }}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Kanaal">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
          >
            <option>Instagram</option>
            <option>Facebook</option>
          </select>
        </Field>
        <Field label="Call-to-action">
          <input
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
          />
        </Field>
      </div>
      <Field label="Toon & stijl (optioneel)">
        <input
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="bijv. enthousiast en informeel, gebruik jij/jou, geen u"
          className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={{ ...inputStyle, borderColor: "#6B6B70" }}
        />
      </Field>
      <button
        onClick={generate}
        disabled={loading || !text.trim()}
        className="mt-2 w-full py-3 rounded-lg font-bold uppercase tracking-wide text-sm transition-opacity disabled:opacity-40"
        style={{ background: "#1B1B1F", color: "#FFFFFF", fontFamily: "Inter, sans-serif" }}
      >
        {loading ? "Bezig..." : "Genereer bericht"}
      </button>
      {error && <p className="text-sm mt-2" style={{ color: "#E8472C" }}>{error}</p>}
      {result && (
        <div className="mt-5">
          <TicketStub label={`Klaar voor ${channel}`}>{result}</TicketStub>
          <CopyButton text={result} />
        </div>
      )}
    </div>
  );
}

function TrimTool() {
  const [text, setText] = useState("");
  const [target, setTarget] = useState("website");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const limit = target === "website" ? 300 : 200;
  const targetLabel = target === "website" ? "Website (300 tekens)" : "Gooi Agenda / Weesper Nieuws (200 tekens)";

  const generate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const toneInstruction = tone.trim()
        ? `\nToon & stijl instructies: ${tone.trim()}`
        : "";
      const prompt = `Verkort de volgende Nederlandse tekst over een voorstelling/film tot MAXIMAAL ${limit} tekens (inclusief spaties). Behoud de belangrijkste informatie (wat, wanneer indien genoemd, waarom interessant). Schrijf vloeiend lopende tekst, geen opsomming.${toneInstruction} Geef ALLEEN de verkorte tekst terug, niets anders.

Originele tekst:
"""
${text}
"""`;
      const out = await callClaude(prompt);
      setResult(out);
    } catch (e) {
      setError("Kon de tekst niet verkorten. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Field label="Doel">
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={inputStyle}
        >
          <option value="website">Website (300 tekens)</option>
          <option value="agenda">Gooi Agenda / Weesper Nieuws (200 tekens)</option>
        </select>
      </Field>
      <Field label="Toon & stijl (optioneel)">
        <input
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="bijv. zakelijk en bondig, geen uitroeptekens"
          className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={{ ...inputStyle, borderColor: "#6B6B70" }}
        />
      </Field>
      <Field label="Originele tekst">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Plak hier de volledige tekst..."
          className="w-full border-2 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none"
          style={inputStyle}
        />
        <div className="text-xs mt-1 text-right" style={{ color: "#6B6B70", fontFamily: "Inter, sans-serif" }}>
          {text.length} tekens
        </div>
      </Field>
      <button
        onClick={generate}
        disabled={loading || !text.trim()}
        className="w-full py-3 rounded-lg font-bold uppercase tracking-wide text-sm transition-opacity disabled:opacity-40"
        style={{ background: "#1B1B1F", color: "#FFFFFF", fontFamily: "Inter, sans-serif" }}
      >
        {loading ? "Bezig..." : "Verkort tekst"}
      </button>
      {error && <p className="text-sm mt-2" style={{ color: "#E8472C" }}>{error}</p>}
      {result && (
        <div className="mt-5">
          <TicketStub label={targetLabel}>{result}</TicketStub>
          <div className="text-xs mt-1.5" style={{ color: result.length > limit ? "#E8472C" : "#6B6B70", fontFamily: "Inter, sans-serif" }}>
            {result.length} / {limit} tekens {result.length > limit ? "— nog te lang, kort verder handmatig" : "✓"}
          </div>
          <CopyButton text={result} />
        </div>
      )}
    </div>
  );
}

function PressTool() {
  const [text, setText] = useState("");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const generate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const toneInstruction = tone.trim()
        ? `\nToon & stijl instructies: ${tone.trim()}`
        : "";
      const prompt = `Je bent een ervaren persvoorlichter bij City of Wesopa, een theater/filmhuis. Beoordeel en herschrijf het volgende persbericht-concept. Doel/doelgroep indien opgegeven: "${goal || "niet opgegeven, leid dit af uit de tekst"}".${toneInstruction}

Concept:
"""
${text}
"""

Geef je antwoord in twee delen, exact in dit format:

FEEDBACK:
(3-5 korte bullet punten over toon, opbouw, nieuwswaarde, en ontbrekende info die nog moet worden opgevraagd bij de collega)

HERSCHREVEN VERSIE:
(de aangescherpte tekst, klaar om terug te sturen voor akkoord — gebruik de opgegeven toon & stijl instructies)`;
      const out = await callClaude(prompt);
      setResult(out);
    } catch (e) {
      setError("Kon het persbericht niet beoordelen. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Field label="Doel / doelgroep (optioneel)">
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="bijv. lokale aandacht trekken voor Sportfilmfestival"
          className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={inputStyle}
        />
      </Field>
      <Field label="Toon & stijl (optioneel)">
        <input
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="bijv. professioneel maar toegankelijk, geen vakjargon"
          className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={{ ...inputStyle, borderColor: "#6B6B70" }}
        />
      </Field>
      <Field label="Concept persbericht">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Plak hier het concept van de collega..."
          className="w-full border-2 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none"
          style={inputStyle}
        />
      </Field>
      <button
        onClick={generate}
        disabled={loading || !text.trim()}
        className="w-full py-3 rounded-lg font-bold uppercase tracking-wide text-sm transition-opacity disabled:opacity-40"
        style={{ background: "#1B1B1F", color: "#FFFFFF", fontFamily: "Inter, sans-serif" }}
      >
        {loading ? "Bezig..." : "Beoordeel en herschrijf"}
      </button>
      {error && <p className="text-sm mt-2" style={{ color: "#E8472C" }}>{error}</p>}
      {result && (
        <div className="mt-5">
          <TicketStub label="Feedback & herschreven versie">{result}</TicketStub>
          <CopyButton text={result} />
        </div>
      )}
    </div>
  );
}

export default function WesopaToolkit() {
  const [active, setActive] = useState("social");

  return (
    <div
      className="min-h-screen w-full flex items-start justify-center py-10 px-4"
      style={{ background: "#F2EFE9" }}
    >
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <h1
            className="text-4xl tracking-tight"
            style={{
              color: "#1B1B1F",
              fontFamily: "'Oswald', 'Arial Narrow', sans-serif",
              fontWeight: 700,
              letterSpacing: "0.02em",
            }}
          >
            CITY OF WESOPA
          </h1>
          <p
            className="text-xs uppercase tracking-widest mt-1"
            style={{ color: "#E8472C", fontFamily: "Inter, sans-serif", fontWeight: 700 }}
          >
            Marketing &amp; Communicatie Toolkit
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors"
              style={{
                fontFamily: "Inter, sans-serif",
                background: active === tab.id ? "#1B1B1F" : "#FFFFFF",
                color: active === tab.id ? "#FFFFFF" : "#1B1B1F",
                border: "2px solid #1B1B1F",
              }}
            >
              <span style={{ color: active === tab.id ? "#E8472C" : "#6B6B70" }}>{tab.ticket}</span>{" "}
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className="rounded-xl p-5"
          style={{ background: "#FFFFFF", border: "2px solid #1B1B1F" }}
        >
          {active === "social" && <SocialTool />}
          {active === "trim" && <TrimTool />}
          {active === "press" && <PressTool />}
        </div>

        <p
          className="text-center text-xs mt-6"
          style={{ color: "#6B6B70", fontFamily: "Inter, sans-serif" }}
        >
          Concepten — controleer altijd voor publicatie.
        </p>
      </div>
    </div>
  );
}
