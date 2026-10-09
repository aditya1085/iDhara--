import React from 'react';
import {
  DataProvenance,
  FloodSeverity,
  ProductMode,
  RoadStatus,
  SensorFreshnessState,
  WarningLevel,
} from '../types/idhara';

export const SENSOR_FRESHNESS_META: Record<
  SensorFreshnessState,
  {
    label: SensorFreshnessState;
    glyph: string;
    textColor: string;
    borderColor: string;
    bgTint: string;
  }
> = {
  FRESH: {
    label: 'FRESH',
    glyph: '●',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-300',
    bgTint: 'bg-emerald-50',
  },
  STALE: {
    label: 'STALE',
    glyph: '◷',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
    bgTint: 'bg-amber-50',
  },
  SUSPECT: {
    label: 'SUSPECT',
    glyph: '▲',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
    bgTint: 'bg-orange-50',
  },
  MISSING: {
    label: 'MISSING',
    glyph: '✖',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-300',
    bgTint: 'bg-rose-50',
  },
};

export const WARNING_LEVEL_META: Record<
  WarningLevel,
  {
    level: WarningLevel;
    actionTitle: string;
    glyph: string;
    textColor: string;
    borderColor: string;
    bgTint: string;
    ruleSummary: string;
  }
> = {
  [WarningLevel.RED]: {
    level: WarningLevel.RED,
    actionTitle: 'RED — EVACUATE & BARRICADE',
    glyph: '✖',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-300',
    bgTint: 'bg-rose-50',
    ruleSummary: 'Severity = CRITICAL AND Flood Probability ≥ 72%',
  },
  [WarningLevel.ORANGE]: {
    level: WarningLevel.ORANGE,
    actionTitle: 'ORANGE — PREPARE',
    glyph: '▲',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
    bgTint: 'bg-orange-50',
    ruleSummary: 'Severity = CRITICAL OR (Severity = HIGH AND Probability ≥ 54%)',
  },
  [WarningLevel.YELLOW]: {
    level: WarningLevel.YELLOW,
    actionTitle: 'YELLOW — WATCH',
    glyph: '◆',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
    bgTint: 'bg-amber-50',
    ruleSummary: 'Severity = MODERATE/HIGH OR Flood Probability ≥ 30%',
  },
  [WarningLevel.GREEN]: {
    level: WarningLevel.GREEN,
    actionTitle: 'GREEN — MONITOR',
    glyph: '●',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-300',
    bgTint: 'bg-emerald-50',
    ruleSummary: 'Severity = LOW AND Flood Probability < 30%',
  },
};

export const WarningLevelIndicator: React.FC<{
  level: WarningLevel;
  showDirective?: boolean;
}> = ({ level, showDirective = true }) => {
  const meta = WARNING_LEVEL_META[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs font-bold ${meta.textColor} ${
        !showDirective
          ? `px-2 py-0.5 border ${meta.borderColor} ${meta.bgTint} rounded-xs`
          : ''
      }`}
    >
      <span aria-hidden="true">{meta.glyph}</span>
      <span>{showDirective ? meta.actionTitle : `${meta.level} WARNING`}</span>
    </span>
  );
};

export const SEVERITY_META: Record<
  FloodSeverity,
  {
    label: string;
    shortCode: string;
    glyph: string;
    patternId: string;
    textColor: string;
    borderColor: string;
    bgTint: string;
    svgFill: string;
    svgStroke: string;
    patternDescription: string;
  }
> = {
  [FloodSeverity.CRITICAL]: {
    label: 'CRITICAL',
    shortCode: 'CRIT',
    glyph: '✖',
    patternId: 'url(#pattern-critical-crosshatch)',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-300',
    bgTint: 'bg-rose-50',
    svgFill: 'rgba(239, 68, 68, 0.36)',
    svgStroke: '#EF4444',
    patternDescription: 'Crosshatch + ✖ Critical',
  },
  [FloodSeverity.HIGH]: {
    label: 'HIGH',
    shortCode: 'HIGH',
    glyph: '▲',
    patternId: 'url(#pattern-high-diagonal)',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
    bgTint: 'bg-orange-50',
    svgFill: 'rgba(249, 115, 22, 0.30)',
    svgStroke: '#F97316',
    patternDescription: 'Diagonal Stripe + ▲ High',
  },
  [FloodSeverity.MODERATE]: {
    label: 'MODERATE',
    shortCode: 'MOD',
    glyph: '◆',
    patternId: 'url(#pattern-moderate-dots)',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
    bgTint: 'bg-amber-50',
    svgFill: 'rgba(234, 179, 8, 0.22)',
    svgStroke: '#EAB308',
    patternDescription: 'Stipple Dots + ◆ Moderate',
  },
  [FloodSeverity.LOW]: {
    label: 'LOW',
    shortCode: 'LOW',
    glyph: '●',
    patternId: 'none',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-300',
    bgTint: 'bg-emerald-50',
    svgFill: 'rgba(16, 185, 129, 0.12)',
    svgStroke: '#10B981',
    patternDescription: 'Solid Clear + ● Low',
  },
};

export const ROAD_STATUS_META: Record<
  RoadStatus,
  {
    label: string;
    glyph: string;
    textColor: string;
    strokeColor: string;
    dashArray: string;
  }
> = {
  [RoadStatus.CLOSED]: {
    label: 'CLOSED',
    glyph: '✖',
    textColor: 'text-rose-700',
    strokeColor: '#EF4444',
    dashArray: '4 4',
  },
  [RoadStatus.LIKELY_FLOODED]: {
    label: 'LIKELY_FLOODED',
    glyph: '▲',
    textColor: 'text-orange-700',
    strokeColor: '#F97316',
    dashArray: '8 4',
  },
  [RoadStatus.AT_RISK]: {
    label: 'AT_RISK',
    glyph: '◆',
    textColor: 'text-amber-700',
    strokeColor: '#EAB308',
    dashArray: 'none',
  },
  [RoadStatus.OPEN]: {
    label: 'OPEN',
    glyph: '●',
    textColor: 'text-emerald-700',
    strokeColor: '#10B981',
    dashArray: 'none',
  },
};

export const MODE_META: Record<
  ProductMode,
  {
    label: string;
    shortDesc: string;
    accentText: string;
    borderClass: string;
    bgClass: string;
    indicatorSymbol: string;
    watermarkLabel: string;
    chipStyle: string;
  }
> = {
  [ProductMode.LIVE]: {
    label: 'LIVE',
    shortDesc: 'Live Municipal Telemetry Stream (Synthetic Sensors Active)',
    accentText: 'text-[#258C91]',
    borderClass: 'border-emerald-300',
    bgClass: 'bg-emerald-50/80',
    indicatorSymbol: '●',
    watermarkLabel: 'LIVE TELEMETRY STREAM',
    chipStyle: 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs',
  },
  [ProductMode.SIMULATED]: {
    label: 'SIMULATED',
    shortDesc: 'Hydrological-Terrain Simulation (Digital Twin Scenario)',
    accentText: 'text-[#287FB5]',
    borderClass: 'border-sky-300',
    bgClass: 'bg-sky-50/80',
    indicatorSymbol: '◈',
    watermarkLabel: 'HYDRAULIC TWIN MODEL',
    chipStyle: 'bg-sky-100 text-sky-800 border border-sky-300 shadow-xs',
  },
  [ProductMode.HISTORICAL]: {
    label: 'HISTORICAL',
    shortDesc: 'Archived Indore Cloudburst Replay (Historical Log)',
    accentText: 'text-amber-700',
    borderClass: 'border-amber-300',
    bgClass: 'bg-amber-50/80',
    indicatorSymbol: '◷',
    watermarkLabel: 'ARCHIVED EVENT REPLAY',
    chipStyle: 'bg-amber-100 text-amber-800 border border-amber-300 shadow-xs',
  },
  [ProductMode.MOCK]: {
    label: 'MOCK',
    shortDesc: 'Deterministic Stress Benchmark (Offline Stub Bench)',
    accentText: 'text-purple-700',
    borderClass: 'border-purple-300',
    bgClass: 'bg-purple-50/80',
    indicatorSymbol: '▣',
    watermarkLabel: 'SYNTHETIC TEST BENCH',
    chipStyle: 'bg-purple-100 text-purple-800 border border-purple-300 shadow-xs',
  },
};

export const SeverityIndicator: React.FC<{
  severity: FloodSeverity;
  showPatternNote?: boolean;
}> = ({ severity, showPatternNote = false }) => {
  const meta = SEVERITY_META[severity];
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold ${meta.textColor}`}>
      <span aria-hidden="true">{meta.glyph}</span>
      <span>{meta.label}</span>
      {showPatternNote && (
        <span className="text-[#526778] font-normal">({meta.patternDescription})</span>
      )}
    </span>
  );
};

export const RoadStateIndicator: React.FC<{ state: RoadStatus }> = ({ state }) => {
  const meta = ROAD_STATUS_META[state];
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold ${meta.textColor}`}>
      <span aria-hidden="true">{meta.glyph}</span>
      <span>{meta.label}</span>
    </span>
  );
};

/**
 * Displays mandatory iDhara provenance metadata contract:
 * mode · scope_id · generated_at · data_as_of · confidence
 * Uses clean unboxed text with typographic separators (no static pill clutter).
 */
export const ProvenanceStrip: React.FC<{
  provenance: DataProvenance;
  expiry?: string;
  freshness?: string;
  compact?: boolean;
}> = ({ provenance, expiry, freshness = 'FRESH (<60s)', compact = false }) => {
  const modeMeta = MODE_META[provenance.mode];
  const genTime = provenance.generated_at.slice(11, 19) + 'Z';
  const asOfTime = provenance.data_as_of.slice(11, 19) + 'Z';
  const expTime = expiry ? expiry.slice(11, 19) + 'Z' : null;
  const confPct = Math.round(provenance.confidence * 100);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-[#526778] tabular-nums border-t border-[#D4E0E8] pt-2 mt-2 break-words min-w-0">
      <span className={`font-semibold ${modeMeta.accentText} break-words`}>
        {modeMeta.indicatorSymbol} MODE: {provenance.mode}
      </span>
      <span aria-hidden="true">·</span>
      <span className="break-words">SCOPE: {provenance.scope_id}</span>
      <span aria-hidden="true">·</span>
      <span className="text-[#263746] font-medium break-words">CONF: {confPct}%</span>
      <span aria-hidden="true">·</span>
      <span className="text-emerald-700 font-medium break-words">FRESHNESS: {freshness}</span>
      {!compact && (
        <>
          <span aria-hidden="true">·</span>
          <span className="break-words">TIMESTAMP: {genTime}</span>
          <span aria-hidden="true">·</span>
          <span className="break-words">AS_OF: {asOfTime}</span>
        </>
      )}
      {expTime && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-amber-700 break-words">EXP: {expTime}</span>
        </>
      )}
    </div>
  );
};

/**
 * Mandatory Data Honesty Strip for every major screen:
 * Clearly shows mode · scope · timestamp · confidence · freshness
 */
export const ScreenHonestyHeader: React.FC<{
  screenTitle: string;
  screenSubtle?: string;
  mode: ProductMode;
  scopeId: string;
  timestamp: string;
  confidencePct: number;
  freshnessLabel: string;
}> = ({
  screenTitle,
  screenSubtle,
  mode,
  scopeId,
  timestamp,
  confidencePct,
  freshnessLabel,
}) => {
  const modeMeta = MODE_META[mode];
  const cleanTime = timestamp.includes('T')
    ? timestamp.slice(11, 19) + ' UTC'
    : timestamp;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#F7FAFC] border border-[#D4E0E8] font-mono text-[11px] tabular-nums text-[#263746]">
      <div className="flex items-center gap-2">
        <span className="text-[#263746] font-semibold tracking-tight">{screenTitle}</span>
        {screenSubtle && (
          <>
            <span className="text-[#D4E0E8]" aria-hidden="true">·</span>
            <span className="text-[#526778]">{screenSubtle}</span>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10.5px]">
        <span className={`font-semibold ${modeMeta.accentText}`}>
          {modeMeta.indicatorSymbol} MODE: {mode}
        </span>
        <span className="text-[#D4E0E8]" aria-hidden="true">·</span>
        <span className="text-[#526778]">
          SCOPE: <strong className="text-[#263746] font-semibold">{scopeId}</strong>
        </span>
        <span className="text-[#D4E0E8]" aria-hidden="true">·</span>
        <span className="text-[#526778]">
          TIMESTAMP: <strong className="text-[#263746] font-normal">{cleanTime}</strong>
        </span>
        <span className="text-[#D4E0E8]" aria-hidden="true">·</span>
        <span className="text-[#526778]">
          CONFIDENCE: <strong className="text-[#287FB5] font-semibold">{confidencePct}%</strong>
        </span>
        <span className="text-[#D4E0E8]" aria-hidden="true">·</span>
        <span className="text-[#526778]">
          FRESHNESS: <strong className="text-emerald-700 font-semibold">{freshnessLabel}</strong>
        </span>
      </div>
    </div>
  );
};
