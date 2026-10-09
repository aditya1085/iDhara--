import React, { useMemo, useState } from 'react';
import {
  ActivityFeedEntry,
  AlertItem,
  AlertLifecycleState,
  FloodRiskCell,
  RoadSegmentState,
  ScenarioParameters,
  Shelter,
  UserRole,
  WarningLevel,
} from '../types/idhara';
import {
  canRoleAcknowledgeAlert,
  canRoleChangeAlertLifecycle,
  canRolePublishAlert,
  isCitizenRole,
  isControlRoomOperator,
} from '../modules/alerts';
import { MapInspectionTarget } from './IndoreFloodMap';
import {
  ProvenanceStrip,
  ScreenHonestyHeader,
  WarningLevelIndicator,
  WARNING_LEVEL_META,
} from './SeverityVisuals';

export interface AlertCommandWorkspaceProps {
  alerts: AlertItem[];
  cells: FloodRiskCell[];
  roads: RoadSegmentState[];
  shelters: Shelter[];
  params: ScenarioParameters;
  activeRole: UserRole;
  activityFeed: ActivityFeedEntry[];
  onTransitionAlertLifecycle: (
    alertId: string,
    nextState: AlertLifecycleState
  ) => void;
  onSelectMapTarget: (target: MapInspectionTarget) => void;
  onAcknowledgeAlert?: (alertId: string) => void;
}

const LIFECYCLE_BADGE_STYLE: Record<
  AlertLifecycleState,
  { label: string; text: string; bg: string; border: string; glyph: string }
> = {
  PUBLISHED: {
    label: 'PUBLISHED',
    text: 'text-emerald-800',
    bg: 'bg-emerald-100',
    border: 'border-emerald-300',
    glyph: '●',
  },
  'PENDING REVIEW': {
    label: 'PENDING REVIEW',
    text: 'text-amber-800',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    glyph: '▲',
  },
  DRAFT: {
    label: 'DRAFT',
    text: 'text-sky-800',
    bg: 'bg-sky-100',
    border: 'border-sky-300',
    glyph: '✎',
  },
  UPDATED: {
    label: 'UPDATED',
    text: 'text-teal-800',
    bg: 'bg-teal-100',
    border: 'border-teal-300',
    glyph: '↻',
  },
  EXPIRED: {
    label: 'EXPIRED',
    text: 'text-[#526778]',
    bg: 'bg-[#EDF3F7]',
    border: 'border-[#D4E0E8]',
    glyph: '◷',
  },
  CANCELLED: {
    label: 'CANCELLED',
    text: 'text-zinc-600',
    bg: 'bg-zinc-100',
    border: 'border-zinc-300',
    glyph: '✖',
  },
  REJECTED: {
    label: 'REJECTED',
    text: 'text-rose-800',
    bg: 'bg-rose-100',
    border: 'border-rose-300',
    glyph: '✖',
  },
};

export const AlertCommandWorkspace: React.FC<AlertCommandWorkspaceProps> = ({
  alerts,
  cells,
  roads,
  shelters: _shelters,
  params,
  activeRole,
  activityFeed,
  onTransitionAlertLifecycle,
  onSelectMapTarget,
  onAcknowledgeAlert,
}) => {
  const isOperator = isControlRoomOperator(activeRole);
  const isCitizen = isCitizenRole(activeRole);
  const canPublish = canRolePublishAlert(activeRole);
  const canAcknowledge = canRoleAcknowledgeAlert(activeRole);

  const [filterState, setFilterState] = useState<string>('ALL');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileView, setMobileView] = useState<'alerts' | 'audit'>('alerts');
  const [desktopSplitView, setDesktopSplitView] = useState<boolean>(true);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Citizen role has read-only access to published official dispatches only
      if (
        isCitizen &&
        alert.lifecycleState !== 'PUBLISHED' &&
        alert.lifecycleState !== 'UPDATED'
      ) {
        return false;
      }
      if (filterState !== 'ALL' && alert.lifecycleState !== filterState) {
        return false;
      }
      if (filterLevel !== 'ALL' && alert.warningLevel !== filterLevel) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = alert.title.toLowerCase().includes(q);
        const matchLoc = alert.location.toLowerCase().includes(q);
        const matchAction = alert.recommendedAction.toLowerCase().includes(q);
        const matchId = alert.id.toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchAction && !matchId) {
          return false;
        }
      }
      return true;
    });
  }, [alerts, filterState, filterLevel, searchQuery, isCitizen]);

  const _alertStats = useMemo(() => {
    const published = alerts.filter((a) => a.lifecycleState === 'PUBLISHED').length;
    const pending = alerts.filter((a) => a.lifecycleState === 'PENDING REVIEW').length;
    const draft = alerts.filter((a) => a.lifecycleState === 'DRAFT').length;
    const critical = alerts.filter(
      (a) => a.warningLevel === WarningLevel.RED || a.isEvacuationAlert
    ).length;
    return { published, pending, draft, critical };
  }, [alerts]);

  return (
    <div className="flex flex-col h-full bg-[#EDF3F7] text-[#263746] min-w-0 max-w-full overflow-hidden">
      {/* Citizen Read-Only Notice Banner */}
      {isCitizen && (
        <div className="shrink-0 bg-sky-50 border-b border-sky-300 px-3 sm:px-4 py-2 font-mono text-xs text-sky-900 flex flex-wrap items-center justify-between gap-2 min-w-0 max-w-full">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sky-400">🛡</span>
            <span className="break-words">
              <strong>Citizen Public Advisory Feed:</strong> Displaying official published bulletins from the Indore Municipal EOC. (Read-only access)
            </span>
          </div>
          <span className="text-[#526778] text-[11px] shrink-0">
            Role: Citizen · Direct publishing & acknowledge restricted
          </span>
        </div>
      )}

      {/* 2. Top Summary Row & Controls */}
      <div className="shrink-0 bg-[#F7FAFC] border-b border-[#D4E0E8] px-3 sm:px-4 py-3 min-w-0 max-w-full">
        <div className="flex items-center justify-end gap-3 min-w-0 max-w-full">
          {/* Desktop Layout Split Toggle */}
          <div className="hidden lg:flex items-center gap-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setDesktopSplitView((v) => !v)}
              className={`px-2.5 py-1 border text-xs cursor-pointer transition flex items-center gap-1.5 ${
                desktopSplitView
                  ? 'bg-[#EDF3F7] border-[#287FB5] text-[#287FB5]'
                  : 'bg-[#FFFFFF] border-[#D4E0E8] text-[#526778] hover:text-[#263746]'
              }`}
              title="Toggle Command Audit Trail panel visibility"
            >
              <span>{desktopSplitView ? '⊞ Split View (Alerts + Audit)' : '⤢ Alerts Full Width'}</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-3 pt-3 border-t border-[#D4E0E8] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono min-w-0 max-w-full">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0 max-w-full">
            <span className="text-[#526778]">LIFECYCLE:</span>
            {(
              isCitizen
                ? (['ALL', 'PUBLISHED', 'UPDATED'] as const)
                : ([
                    'ALL',
                    'PUBLISHED',
                    'PENDING REVIEW',
                    'DRAFT',
                    'UPDATED',
                    'EXPIRED',
                    'CANCELLED',
                  ] as const)
            ).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterState(st)}
                className={`px-2 py-0.5 border rounded-none cursor-pointer break-words ${
                  filterState === st
                    ? 'bg-[#287FB5] border-[#287FB5] text-white font-semibold shadow-xs'
                    : 'bg-[#FFFFFF] border-[#D4E0E8] text-[#526778] hover:text-[#263746]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-full">
            <span className="text-[#526778]">SEVERITY:</span>
            {(['ALL', 'RED', 'ORANGE', 'YELLOW', 'GREEN'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setFilterLevel(lvl)}
                className={`px-2 py-0.5 border cursor-pointer break-words ${
                  filterLevel === lvl
                    ? 'bg-[#287FB5] border-[#287FB5] text-white font-semibold shadow-xs'
                    : 'bg-[#FFFFFF] border-[#D4E0E8] text-[#526778] hover:text-[#263746]'
                }`}
              >
                {lvl}
              </button>
            ))}

            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-44 px-2.5 py-1 bg-[#FFFFFF] border border-[#D4E0E8] text-[#263746] text-xs placeholder:text-[#526778] focus:outline-none focus:border-cyan-500 font-mono box-border"
            />
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Compact View Switcher (< lg) */}
      <div className="lg:hidden flex border-b border-[#D4E0E8] bg-[#FFFFFF] shrink-0 font-mono text-xs select-none">
        <button
          type="button"
          onClick={() => setMobileView('alerts')}
          className={`flex-1 py-2 px-3 text-center border-b-2 font-semibold transition cursor-pointer ${
            mobileView === 'alerts'
              ? 'border-[#287FB5] text-[#287FB5] bg-[#EDF3F7]'
              : 'border-transparent text-[#526778] hover:text-[#263746]'
          }`}
        >
          Operational Alerts ({filteredAlerts.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileView('audit')}
          className={`flex-1 py-2 px-3 text-center border-b-2 font-semibold transition cursor-pointer ${
            mobileView === 'audit'
              ? 'border-[#287FB5] text-[#287FB5] bg-[#EDF3F7]'
              : 'border-transparent text-[#526778] hover:text-[#263746]'
          }`}
        >
          Command Audit Log ({activityFeed.length})
        </button>
      </div>

      {/* 3. Main Body: Independent Full-Height Scroll Containers */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Col: Alerts Stream */}
        <div
          id="alerts-scroll-container"
          tabIndex={0}
          role="region"
          aria-label="Operational Alerts List"
          className={`flex-1 min-w-0 min-h-0 h-full overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-4 border-r border-[#D4E0E8] focus:outline-none custom-scrollbar ${
            mobileView === 'audit' ? 'hidden lg:block' : 'block'
          }`}
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-[#526778] font-mono text-xs border border-dashed border-[#D4E0E8]">
              No alerts match the selected criteria ({filterState} · {filterLevel}).
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const lcMeta =
                LIFECYCLE_BADGE_STYLE[alert.lifecycleState] ??
                LIFECYCLE_BADGE_STYLE.DRAFT;
              const warnMeta = WARNING_LEVEL_META[alert.warningLevel];

              // Check if matching road exists
              const matchedRoad = roads.find((r) =>
                alert.recommendedAction.includes(r.id) ||
                alert.title.includes(r.id) ||
                alert.triggerEvidence.includes(r.id)
              );

              const cardBorderClass =
                alert.warningLevel === WarningLevel.RED
                  ? 'border-rose-200 border-l-4 border-l-rose-600 bg-rose-50/70'
                  : alert.warningLevel === WarningLevel.ORANGE
                  ? 'border-amber-200 border-l-4 border-l-amber-500 bg-amber-50/70'
                  : alert.warningLevel === WarningLevel.YELLOW
                  ? 'border-amber-200 border-l-4 border-l-yellow-500 bg-amber-50/70'
                  : 'border-emerald-200 border-l-4 border-l-emerald-600 bg-emerald-50/70';

              return (
                <div
                  key={alert.id}
                  className={`border ${cardBorderClass} p-3.5 sm:p-4 transition-all shadow-md space-y-3 min-w-0`}
                >
                  {/* Alert Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-[#D4E0E8] pb-2.5 min-w-0 max-w-full">
                    <div className="space-y-1.5 min-w-0 max-w-full flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0 max-w-full">
                        <WarningLevelIndicator
                          level={alert.warningLevel}
                          showDirective={false}
                        />

                        {/* Lifecycle Badge */}
                        <span
                          className={`font-mono text-[11px] font-bold px-2 py-0.5 border ${lcMeta.border} ${lcMeta.bg} ${lcMeta.text} inline-flex items-center gap-1 break-words`}
                        >
                          <span aria-hidden="true">{lcMeta.glyph}</span>
                          <span>{lcMeta.label}</span>
                        </span>

                        {alert.isEvacuationAlert && (
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-rose-100 border border-rose-500/70 text-rose-800 break-words">
                            EVACUATION DIRECTIVE
                          </span>
                        )}

                        <span className="font-mono text-[11px] text-[#526778] break-words">
                          ID: <strong className="text-[#263746]">{alert.id}</strong>
                        </span>
                      </div>

                      <h3 className="font-sans font-bold text-sm sm:text-base text-[#263746] break-words min-w-0 max-w-full leading-snug">
                        {alert.title}
                      </h3>
                    </div>

                    {/* Human Confirmation Badge */}
                    <div className="text-left sm:text-right font-mono text-[11px] min-w-0 max-w-full shrink-0">
                      {alert.humanConfirmedBy ? (
                        <div className="text-emerald-700 bg-emerald-100 border border-emerald-500/40 px-2.5 py-1 inline-block break-words max-w-full">
                          ✓ Confirmed by {alert.humanConfirmedBy}
                          {alert.humanConfirmedAt && (
                            <span className="text-[#526778] ml-1">
                              ({alert.humanConfirmedAt})
                            </span>
                          )}
                        </div>
                      ) : alert.requiresHumanConfirmation ? (
                        <div className="text-amber-800 bg-amber-100 border border-amber-500/50 px-2.5 py-1 inline-block break-words max-w-full">
                          ▲ Requires Human Confirmation
                        </div>
                      ) : (
                        <div className="text-[#526778] text-[10px] break-words">
                          Automated Telemetry Dispatch
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-3 font-sans text-xs min-w-0 max-w-full">
                    {/* Probability & Forecast statement + Trigger Evidence */}
                    <div className="bg-[#FFFFFF] border border-[#D4E0E8] p-2.5 sm:p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-[#287FB5] font-mono text-xs shrink-0 mt-0.5">ℹ</span>
                        <p className="text-[#263746] font-medium text-xs leading-relaxed break-words flex-1">
                          {alert.probabilityStatement}
                        </p>
                      </div>

                      <div className="font-mono text-[11px] text-[#526778] bg-[#F7FAFC] p-2 border border-[#D4E0E8] break-words min-w-0 max-w-full overflow-hidden">
                        <strong className="text-[#263746]">TRIGGER EVIDENCE: </strong>
                        <span className="text-[#526778] break-words">{alert.triggerEvidence}</span>
                      </div>
                    </div>

                    {/* Recommended Actions Bullets */}
                    <div className="space-y-1.5 min-w-0 max-w-full">
                      <div className="font-mono text-[11px] text-[#287FB5] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <span>📋</span>
                        <span>Action Plan Directives:</span>
                      </div>
                      <ul className="space-y-1 text-[#263746] pl-1 min-w-0 max-w-full">
                        {alert.recommendedActionBullets &&
                        alert.recommendedActionBullets.length > 0 ? (
                          alert.recommendedActionBullets.map((b, idx) => (
                            <li key={idx} className="flex items-start gap-2 leading-relaxed break-words min-w-0 max-w-full text-xs">
                              <span className="text-cyan-500 font-mono text-[10px] shrink-0 mt-1">▸</span>
                              <span className="flex-1">{b}</span>
                            </li>
                          ))
                        ) : (
                          <li className="flex items-start gap-2 leading-relaxed break-words min-w-0 max-w-full text-xs">
                            <span className="text-cyan-500 font-mono text-[10px] shrink-0 mt-1">▸</span>
                            <span className="flex-1">{alert.recommendedAction}</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Target Audiences & Location Links */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#D4E0E8] font-mono text-[11px] min-w-0 max-w-full">
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0 max-w-full">
                        <span className="text-[#526778] text-[10.5px]">DISPATCH RECIPIENTS:</span>
                        {alert.audiences.map((aud) => (
                          <span
                            key={aud}
                            className="px-2 py-0.5 bg-[#FFFFFF] border border-[#D4E0E8] text-[#263746] text-[10.5px] break-words"
                          >
                            {aud}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (matchedRoad) {
                              onSelectMapTarget({ type: 'ROAD', id: matchedRoad.id });
                            } else {
                              const foundCell = cells.find((c) =>
                                alert.location.includes(c.localityName)
                              );
                              if (foundCell) {
                                onSelectMapTarget({ type: 'CELL', id: foundCell.id });
                              }
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[#287FB5] hover:text-[#287FB5] text-xs font-semibold hover:underline cursor-pointer transition shrink-0"
                        >
                          <span>Inspect Location on Map</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Provenance Strip */}
                  <ProvenanceStrip
                    provenance={alert}
                    expiry={alert.expiry}
                    compact
                  />

                  {/* Lifecycle State Transition & Acknowledgment Controls */}
                  <div className="mt-3 pt-2.5 border-t border-[#D4E0E8] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono text-xs min-w-0 max-w-full">
                    {/* Left: Acknowledge & Accept Action / Status */}
                    <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-full">
                      {isCitizen ? (
                        <span className="text-[11px] font-mono px-2.5 py-1 border border-[#D4E0E8] bg-[#FFFFFF] text-[#263746] inline-flex items-center gap-1.5 break-words">
                          <span>{alert.acknowledged ? '✓ Official EOC Confirmed' : '● EOC Active Dispatch'}</span>
                        </span>
                      ) : canAcknowledge ? (
                        <button
                          type="button"
                          onClick={() => onAcknowledgeAlert?.(alert.id)}
                          className={`px-3 py-1.5 text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 break-words ${
                            alert.acknowledged
                              ? 'bg-emerald-100 border-emerald-500/60 text-emerald-800 hover:bg-emerald-900/80'
                              : 'bg-amber-600 hover:bg-amber-500 border-amber-500 text-slate-950 shadow-sm'
                          }`}
                          title="Acknowledge and accept alert (Control-room operator authority)"
                        >
                          <span>{alert.acknowledged ? '✓' : '▲'}</span>
                          <span>{alert.acknowledged ? 'Acknowledged / Accepted' : 'Acknowledge & Accept'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="px-2.5 py-1 text-xs font-semibold border border-[#D4E0E8] bg-[#FFFFFF] text-[#526778] cursor-not-allowed opacity-60 flex items-center gap-1.5 break-words"
                          title="Only Control-room operator is authorized to acknowledge or accept alerts"
                        >
                          <span>🔒</span>
                          <span>
                            {alert.acknowledged ? 'Acknowledged (Read-Only)' : 'Acknowledge (Operator Only)'}
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Right: Lifecycle Transition Controls */}
                    {!isCitizen && (
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0 max-w-full">
                        {alert.lifecycleState === 'PENDING REVIEW' && (
                          <>
                            {canPublish ? (
                              <button
                                type="button"
                                onClick={() =>
                                  onTransitionAlertLifecycle(alert.id, 'PUBLISHED')
                                }
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold cursor-pointer transition shadow-sm break-words"
                              >
                                ✓ Confirm & Publish
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                title="Only Control-room operator is authorized to publish official alerts"
                                className="px-2.5 py-1 bg-[#FFFFFF] border border-[#D4E0E8] text-[#526778] cursor-not-allowed opacity-60 font-semibold break-words"
                              >
                                🔒 Publish Restricted (Operator Only)
                              </button>
                            )}

                            {canRoleChangeAlertLifecycle(activeRole, 'REJECTED') && (
                              <button
                                type="button"
                                onClick={() =>
                                  onTransitionAlertLifecycle(alert.id, 'REJECTED')
                                }
                                className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-800 cursor-pointer transition break-words"
                              >
                                Reject
                              </button>
                            )}
                          </>
                        )}

                        {alert.lifecycleState === 'DRAFT' && (
                          <>
                            {canRoleChangeAlertLifecycle(activeRole, 'PENDING REVIEW') && (
                              <button
                                type="button"
                                onClick={() =>
                                  onTransitionAlertLifecycle(alert.id, 'PENDING REVIEW')
                                }
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold cursor-pointer transition break-words"
                              >
                                Submit for Review
                              </button>
                            )}

                            {!alert.requiresHumanConfirmation && (
                              canPublish ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onTransitionAlertLifecycle(alert.id, 'PUBLISHED')
                                  }
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold cursor-pointer transition break-words"
                                >
                                  Publish Directly
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  title="Only Control-room operator is authorized to publish official alerts"
                                  className="px-2.5 py-1 bg-[#FFFFFF] border border-[#D4E0E8] text-[#526778] cursor-not-allowed opacity-60 font-semibold break-words"
                                >
                                  🔒 Publish Restricted
                                </button>
                              )
                            )}

                            {canRoleChangeAlertLifecycle(activeRole, 'CANCELLED') && (
                              <button
                                type="button"
                                onClick={() =>
                                  onTransitionAlertLifecycle(alert.id, 'CANCELLED')
                                }
                                className="px-2 py-1 bg-[#FFFFFF] hover:bg-[#EDF3F7] border border-[#D4E0E8] text-[#526778] cursor-pointer transition break-words"
                              >
                                Discard
                              </button>
                            )}
                          </>
                        )}

                        {(alert.lifecycleState === 'PUBLISHED' ||
                          alert.lifecycleState === 'UPDATED') && (
                          <>
                            {canPublish ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onTransitionAlertLifecycle(alert.id, 'UPDATED')
                                  }
                                  className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-[#287FB5] cursor-pointer transition break-words"
                                >
                                  ↻ Broadcast Update
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onTransitionAlertLifecycle(alert.id, 'EXPIRED')
                                  }
                                  className="px-2 py-1 bg-[#FFFFFF] hover:bg-[#EDF3F7] border border-[#D4E0E8] text-[#526778] cursor-pointer transition break-words"
                                >
                                  Mark Expired
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onTransitionAlertLifecycle(alert.id, 'CANCELLED')
                                  }
                                  className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 cursor-pointer transition break-words"
                                >
                                  Cancel Alert
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-[#526778] italic break-words">
                                Status modifications restricted to Control-room operator
                              </span>
                            )}
                          </>
                        )}

                        {(alert.lifecycleState === 'REJECTED' ||
                          alert.lifecycleState === 'CANCELLED' ||
                          alert.lifecycleState === 'EXPIRED') && (
                          canRoleChangeAlertLifecycle(activeRole, 'DRAFT') ? (
                            <button
                              type="button"
                              onClick={() =>
                                onTransitionAlertLifecycle(alert.id, 'DRAFT')
                              }
                              className="px-2 py-1 bg-[#FFFFFF] hover:bg-[#EDF3F7] border border-[#D4E0E8] text-[#263746] cursor-pointer transition break-words"
                            >
                              Clone to Draft
                            </button>
                          ) : null
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Col: Chronological Command Audit Trail & Guidelines */}
        <div
          id="audit-trail-scroll-container"
          tabIndex={0}
          role="region"
          aria-label="EOC Live Command Audit Trail"
          className={`w-full lg:w-80 xl:w-96 shrink-0 min-h-0 h-full overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-4 bg-[#050811] min-w-0 max-w-full overflow-x-hidden border-t lg:border-t-0 border-[#D4E0E8] focus:outline-none custom-scrollbar ${
            desktopSplitView ? 'block' : 'hidden'
          } ${mobileView === 'alerts' ? 'hidden lg:block' : 'block'}`}
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* EOC Human Confirmation Mandate Card */}
          <div className="bg-[#FFFFFF] border border-[#D4E0E8] p-3.5 space-y-2 min-w-0 max-w-full break-words">
            <h4 className="font-mono text-xs font-bold text-[#287FB5] uppercase tracking-wide flex items-center gap-1.5">
              <span>🛡</span> EOC Dispatch Protocol
            </h4>
            <p className="text-xs text-[#263746] leading-relaxed font-sans break-words">
              Pursuant to NDMA and Indore Municipal Corporation disaster SOPs, any alert
              escalated to <strong className="text-amber-800">ORANGE</strong> or{' '}
              <strong className="text-rose-800">RED</strong> requires active human
              confirmation before dispatching automated SMS/PA alerts to citizens or field
              corridor closures.
            </p>
            <div className="font-mono text-[11px] text-[#526778] space-y-1.5 border-t border-[#D4E0E8] pt-2 break-words">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span>Active Role Desk:</span>
                <span className="text-[#263746] font-semibold break-words">{activeRole}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span>Control Mode:</span>
                <span className="text-emerald-700 font-semibold">
                  HUMAN-IN-THE-LOOP (HITL)
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-[#D4E0E8]">
                <span>Desk Authority:</span>
                <span
                  className={`font-semibold break-words ${
                    isOperator ? 'text-emerald-700' : 'text-amber-800'
                  }`}
                >
                  {isOperator
                    ? '✓ Publish & Acknowledge Authorized'
                    : isCitizen
                    ? 'Public Citizen Advisory (Read-Only)'
                    : 'Read-Only (Publish & Acknowledge Restricted)'}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Feed Audit Log */}
          <div className="space-y-2 min-w-0 max-w-full">
            <div className="flex items-center justify-between border-b border-[#D4E0E8] pb-1.5 min-w-0">
              <h4 className="font-mono text-xs font-semibold text-[#263746] uppercase tracking-wide">
                Live Command Log
              </h4>
              <span className="font-mono text-[10px] text-[#526778]">
                {activityFeed.length} EVENTS
              </span>
            </div>

            <div className="space-y-2 min-w-0 max-w-full">
              {activityFeed.slice(0, 15).map((act) => (
                <div
                  key={act.id}
                  className="bg-[#FFFFFF] border border-[#D4E0E8] p-2.5 font-mono text-[11px] space-y-1 min-w-0 max-w-full break-words overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[#526778] text-[10px] min-w-0">
                    <span className="text-[#526778] shrink-0">{act.timestamp}</span>
                    <span
                      className={`font-semibold break-words ${
                        act.severity === 'CRITICAL'
                          ? 'text-rose-800'
                          : act.severity === 'WARNING'
                          ? 'text-amber-800'
                          : act.severity === 'SUCCESS'
                          ? 'text-emerald-700'
                          : 'text-[#287FB5]'
                      }`}
                    >
                      {act.eventTypeLabel || act.category}
                    </span>
                  </div>
                  <div className="text-[#263746] font-sans font-medium text-xs break-words min-w-0 max-w-full">
                    {act.message}
                  </div>
                  {act.detail && (
                    <div className="text-[#526778] text-[10.5px] leading-snug break-words min-w-0 max-w-full">
                      {act.detail}
                    </div>
                  )}
                  {act.relatedTarget && (
                    <div className="pt-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => onSelectMapTarget(act.relatedTarget!)}
                        className="text-[#287FB5] hover:underline text-[10px] cursor-pointer break-words max-w-full text-left"
                      >
                        Target: {act.relatedTarget.type} · {act.relatedTarget.id} →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
