import { useEffect, useMemo, useState } from "react";
import "./Styles/Graphs.css";
import Navbar from "./Components/Navbar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

/** ========================
 *  API config (env-based)
 *  ======================== */
const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "");
const API_KEY  = import.meta.env.VITE_API_KEY?.trim();
if (!API_BASE || !API_KEY) {
  // eslint-disable-next-line no-console
  console.warn("[Graphs] Missing VITE_API_BASE or VITE_API_KEY — add them to .env");
}

/** ========================
 *  Drivers / labels
 *  ======================== */
const DRIVER_COLS = [
  "temp_c",
  "ph",
  "oxygen_mgL",
  "chlorophyll_a_ugL",
  "nitrate_mgL",
  "nitrite_mgL",
  "turbidity_NTU",
];

const PRETTY = {
  temp_c: "Temp (°C)",
  ph: "pH",
  oxygen_mgL: "DO (mg/L)",
  chlorophyll_a_ugL: "Chl-a (µg/L)",
  nitrate_mgL: "Nitrate (mg/L)",
  nitrite_mgL: "Nitrite (mg/L)",
  turbidity_NTU: "Turbidity (NTU)",
};

const ZONE_COLOR = { green: "#2ecc71", yellow: "#f1c40f", red: "#e74c3c" };
const BAND_COLOR = { green: "#d9f7d9", yellow: "#fff3bf", red: "#ffd6d6" };

/* ---------- helpers ---------- */
function fmt(v) {
  if (v == null || Number.isNaN(v)) return "—";
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(3) : String(v);
}
function zoneMessage(row) {
  if (!row) return "";
  if (row.message) return row.message;
  const z = row.zone;
  const flagged = row.flagged_drivers || [];
  const pretty = flagged
    .map((k) => (PRETTY[k] ? PRETTY[k] : k.replace(/_/g, " ")))
    .join(", ");
  if (z === "green") return "Conditions look stable. Drivers within normal ranges.";
  if (z === "yellow") {
    return flagged.length
      ? `Elevated bloom risk (yellow). Pay attention to: ${pretty}.`
      : "Elevated bloom risk (yellow). No specific driver exceeded safe bounds.";
  }
  if (z === "red") {
    return flagged.length
      ? `High bloom risk (red). Critical drivers: ${pretty}. Consider immediate actions.`
      : "High bloom risk (red). No specific driver clearly exceeded bounds.";
  }
  return "";
}

/* ---------- data hook ---------- */
function useAdvisory() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${API_BASE}/advisory`, {
          headers: {
            "X-API-Key": API_KEY,
            "ngrok-skip-browser-warning": "1",
          },
        });
        if (!res.ok) throw new Error(`advisory ${res.status}`);
        const j = await res.json();

        // normalize into typed rows
        const adv = (j?.rows || []).map((r) => {
          const rec = {
            ...r,
            date: new Date(r.date),
            CDI: r.CDI == null ? null : Number(r.CDI),
            zone: String(r.zone || "").toLowerCase(),
            flagged_drivers: Array.isArray(r.flagged_drivers) ? r.flagged_drivers : [],
          };
          DRIVER_COLS.forEach((k) => {
            rec[k] = r[k] == null ? null : Number(r[k]);
          });
          return rec;
        });

        if (!cancelled) {
          adv.sort((a, b) => a.date - b.date);
          setRows(adv);
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || "Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { rows, loading, err };
}

function percentile(arr, p) {
  const xs = arr
    .filter((v) => typeof v === "number" && !Number.isNaN(v))
    .slice()
    .sort((a, b) => a - b);
  if (!xs.length) return null;
  const idx = (p / 100) * (xs.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return xs[lo];
  const w = idx - lo;
  return xs[lo] * (1 - w) + xs[hi] * w;
}

/* ===================================================================== */

export default function Graphs() {
  const { rows: advisory, loading, err } = useAdvisory();

  // thresholds for CDI bands
  const { p80, p95 } = useMemo(() => {
    const vals = (advisory || []).map((r) => r.CDI).filter((v) => typeof v === "number");
    return { p80: percentile(vals, 80), p95: percentile(vals, 95) };
  }, [advisory]);

  // chart data (string date for axis)
  const chartData = useMemo(() => {
    if (!advisory) return [];
    return advisory.map((r) => ({
      ...r,
      dateLabel: r.date.toISOString().slice(0, 10),
    }));
  }, [advisory]);

  // quick map: dateLabel -> index
  const labelToIndex = useMemo(() => {
    const m = new Map();
    chartData.forEach((row, idx) => m.set(row.dateLabel, idx));
    return m;
  }, [chartData]);

  // hovered point (default latest)
  const [hoverIdx, setHoverIdx] = useState(null);
  const current = useMemo(() => {
    if (!chartData.length) return null;
    if (hoverIdx == null) return chartData[chartData.length - 1];
    return chartData[Math.max(0, Math.min(chartData.length - 1, hoverIdx))];
  }, [chartData, hoverIdx]);

  /* ===== Dynamic driver graph state ===== */
  const [selectedDriver, setSelectedDriver] = useState(DRIVER_COLS[0]); // default first
  const driverSeries = useMemo(() => {
    if (!chartData.length) return [];
    return chartData.map((r) => ({
      dateLabel: r.dateLabel,
      value: r[selectedDriver] == null ? null : Number(r[selectedDriver]),
      zone: r.zone,
      flagged: Array.isArray(r.flagged_drivers) && r.flagged_drivers.includes(selectedDriver),
    }));
  }, [chartData, selectedDriver]);

  // compute y-domain for selected driver (ignore nulls)
  const driverDomain = useMemo(() => {
    const nums = driverSeries.map((d) => d.value).filter((v) => typeof v === "number" && !Number.isNaN(v));
    if (!nums.length) return [0, 1];
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    // pad a bit so the line doesn’t touch the edges
    const pad = (max - min) * 0.08 || 0.5;
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [driverSeries]);

  return (
    <div className="graphs-page">
      <Navbar />

      <div className="graphs-header">
        <h1>BloomGuard • CDI Dashboard</h1>
        <div className="kpis">
          <KPI title="Records" value={advisory?.length ?? 0} />
          <KPI
            title="Latest Zone"
            value={(advisory && advisory[advisory.length - 1]?.zone) || "—"}
            badge
          />
          <KPI title="P80" value={p80 != null ? p80.toFixed(2) : "—"} />
          <KPI title="P95" value={p95 != null ? p95.toFixed(2) : "—"} />
        </div>
      </div>

      {/* ===================== CDI chart ===================== */}
      <div className="card">
        <div className="card-header">
          <h2>CDI (with zone bands)</h2>
          <div className="chip-row">
            <Chip color={BAND_COLOR.green}>Green</Chip>
            <Chip color={BAND_COLOR.yellow}>Yellow</Chip>
            <Chip color={BAND_COLOR.red}>Red</Chip>
          </div>
        </div>

        <div className="chart-wrap">
          {loading ? (
            <div className="loading">Loading chart…</div>
          ) : err ? (
            <div className="error">Error: {err}</div>
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 24, bottom: 10, left: 0 }}
                onMouseMove={(state) => {
                  const lbl = state && state.activeLabel;
                  if (lbl && labelToIndex.has(lbl)) {
                    setHoverIdx(labelToIndex.get(lbl));
                  }
                }}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <CartesianGrid strokeDasharray="3 3" />
                {/* Zone bands */}
                {p80 != null && (
                  <ReferenceArea
                    y1={0}
                    y2={p80}
                    fill={BAND_COLOR.green}
                    fillOpacity={0.35}
                    strokeOpacity={0}
                  />
                )}
                {p80 != null && p95 != null && (
                  <ReferenceArea
                    y1={p80}
                    y2={p95}
                    fill={BAND_COLOR.yellow}
                    fillOpacity={0.35}
                    strokeOpacity={0}
                  />
                )}
                {p95 != null && (
                  <ReferenceArea
                    y1={p95}
                    y2={1.0}
                    fill={BAND_COLOR.red}
                    fillOpacity={0.35}
                    strokeOpacity={0}
                  />
                )}

                <XAxis dataKey="dateLabel" minTickGap={24} />
                <YAxis domain={[0, 1]} />
                <Tooltip
                  formatter={(value, name) =>
                    name === "CDI" ? Number(value).toFixed(3) : value
                  }
                  labelFormatter={(label) => `Date: ${label}`}
                />
                {p80 != null && <ReferenceLine y={p80} strokeDasharray="4 4" />}
                {p95 != null && <ReferenceLine y={p95} strokeDasharray="4 4" />}
                <Line
                  type="monotone"
                  dataKey="CDI"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Hover panel under the chart */}
        <HoverPanel row={current} />
      </div>

      {/* ===================== Dynamic Driver chart ===================== */}
      <div className="card">
        <div className="card-header" style={{ gap: 12, flexWrap: "wrap" }}>
          <h2>Drivers — click to view trend</h2>
          <div className="chip-row" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {DRIVER_COLS.map((k) => {
              const active = k === selectedDriver;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSelectedDriver(k)}
                  className="chip"
                  style={{
                    cursor: "pointer",
                    border: active ? "2px solid rgba(255,255,255,.35)" : "1px solid rgba(0,0,0,0.06)",
                    background: active ? "rgba(71,179,255,.22)" : undefined,
                    fontWeight: active ? 800 : 600,
                  }}
                  title={`Show ${PRETTY[k]} over time`}
                >
                  {PRETTY[k]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="chart-wrap">
          {loading ? (
            <div className="loading">Loading chart…</div>
          ) : err ? (
            <div className="error">Error: {err}</div>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <LineChart
                data={driverSeries}
                margin={{ top: 10, right: 24, bottom: 10, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateLabel" minTickGap={24} />
                <YAxis domain={driverDomain} />
                <Tooltip
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(v) => [fmt(v), PRETTY[selectedDriver]]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- UI bits ---------- */
function HoverPanel({ row }) {
  if (!row) return null;
  const zone = row.zone || "green";
  const zoneHex = ZONE_COLOR[zone] || "#999";
  const flagged = row.flagged_drivers || [];

  return (
    <div className="hover-panel">
      <div className="hover-top">
        <div className="hover-left">
          <div className="hover-date">
            <b>Date:</b> {row.dateLabel}
          </div>
          <div>
            <b>CDI:</b> {fmt(row.CDI)}
          </div>
        </div>
        <div className="hover-right">
          <span className="zone-badge" style={{ background: zoneHex }}>
            {zone}
          </span>
        </div>
      </div>

      <div className="hover-drivers">
        {DRIVER_COLS.map((k) => {
          const highlight = flagged.includes(k);
          const style = highlight ? { color: zoneHex, fontWeight: 700 } : {};
          return (
            <div key={k} className="driver-chip">
              <span className="driver-name" style={style}>
                {PRETTY[k]}
              </span>
              : {fmt(row[k])}
            </div>
          );
        })}
      </div>

      <div className="hover-msg">{zoneMessage(row)}</div>
    </div>
  );
}

function KPI({ title, value, badge = false }) {
  return (
    <div className="kpi">
      <div className="kpi-title">{title}</div>
      <div className={`kpi-value ${badge ? "badge" : ""}`}>{String(value)}</div>
    </div>
  );
}

function Chip({ color, children }) {
  return (
    <span className="chip" style={{ background: color }}>
      {children}
    </span>
  );
}
