import React, { useState } from 'react';
import { BASE_ROAD_SEGMENTS, BASE_SENSORS } from '../data/indorePilotData';
import {
  ActivityFeedEntry,
  ObservationInjectionType,
  RoadSegmentState,
  SensorNode,
} from '../types/idhara';
import { MapInspectionTarget } from './IndoreFloodMap';

interface LiveFeedSimulatorProps {
  roads: RoadSegmentState[];
  sensors: SensorNode[];
  activityFeed: ActivityFeedEntry[];
  activeRouteRoadIds?: string[];
  onInjectObservation: (
    type: ObservationInjectionType,
    targetId: string
  ) => void;
  onResetObservations: () => void;
  onSelectMapTarget: (target: MapInspectionTarget) => void;
  compact?: boolean;
}

export const LiveFeedSimulator: React.FC<LiveFeedSimulatorProps> = ({
  roads,
  sensors,
  activityFeed,
  activeRouteRoadIds,
  onInjectObservation,
  onResetObservations,
  onSelectMapTarget,
  compact = false,
}) => {
  const [selectedRoadId, setSelectedRoadId] = useState<string>(
    activeRouteRoadIds?.[0] ?? 'RD-14'
  ); // Defaults to first passable road on active route or Patel Bridge
  const [selectedSensorId, setSelectedSensorId] = useState<string>('SEN-WL-01'); // Krishnapura Bridge Gauge

  // Keep selectedRoadId aligned if active route changes and user hasn't manually switched
  React.useEffect(() => {
    if (activeRouteRoadIds && activeRouteRoadIds.length > 0 && !activeRouteRoadIds.includes(selectedRoadId)) {
      setSelectedRoadId(activeRouteRoadIds[0]);
    }
  }, [activeRouteRoadIds]);

  return (
    <div className="bg-[#F7FAFC] border border-[#D4E0E8] p-3 space-y-3 text-[#263746]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D4E0E8] pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#258C91] animate-pulse" />
          <div>
            <div className="font-mono text-[10.5px] text-[#287FB5] font-semibold">
              LIVE FEED SIMULATOR & OBSERVATION INJECTOR
            </div>
            {!compact && (
              <div className="text-xs text-[#526778]">
                Inject synthetic real-time observations into the prediction, road-state & routing pipeline
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onResetObservations}
          className="px-2 py-1 bg-[#EDF3F7] hover:bg-[#D4E0E8] border border-[#D4E0E8] font-mono text-[10.5px] text-[#263746] whitespace-nowrap transition-colors cursor-pointer rounded-xs"
        >
          ↺ Reset Feed
        </button>
      </div>

      {/* Target Selectors for Road & Sensor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
        <div className="flex items-center gap-1.5">
          <label htmlFor="sim-road-select" className="text-[#526778] shrink-0">
            Target Road:
          </label>
          <select
            id="sim-road-select"
            value={selectedRoadId}
            onChange={(e) => setSelectedRoadId(e.target.value)}
            className="flex-1 min-w-0 bg-[#FFFFFF] border border-[#D4E0E8] text-[#263746] px-2 py-1 text-[11px] truncate rounded-xs"
          >
            {roads.map((r) => {
              const isOnRoute = activeRouteRoadIds?.includes(r.id);
              return (
                <option key={r.id} value={r.id}>
                  {isOnRoute ? '★ [ON ROUTE] ' : ''}
                  {r.id}: {r.name.slice(0, 24)} ({r.currentState})
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label htmlFor="sim-sensor-select" className="text-[#526778] shrink-0">
            Target Sensor:
          </label>
          <select
            id="sim-sensor-select"
            value={selectedSensorId}
            onChange={(e) => setSelectedSensorId(e.target.value)}
            className="flex-1 min-w-0 bg-[#FFFFFF] border border-[#D4E0E8] text-[#263746] px-2 py-1 text-[11px] truncate rounded-xs"
          >
            {sensors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id}: {s.name.slice(0, 24)} ({s.freshnessState})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 7 Injection Action Buttons */}
      <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
        <button
          type="button"
          onClick={() => onInjectObservation('RAINFALL_INCREASE', selectedSensorId)}
          className="px-2 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-800 text-left text-[10.5px] leading-snug break-words min-w-0 transition-colors cursor-pointer rounded-xs"
        >
          + Rainfall increase
        </button>

        <button
          type="button"
          onClick={() => onInjectObservation('WATER_LEVEL_INCREASE', selectedSensorId)}
          className="px-2 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-300 text-teal-800 text-left text-[10.5px] leading-snug break-words min-w-0 transition-colors cursor-pointer rounded-xs"
        >
          ▲ Water-level increase
        </button>

        <button
          type="button"
          onClick={() => onInjectObservation('ROAD_LIKELY_FLOODED', selectedRoadId)}
          className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-left text-[10.5px] leading-snug break-words min-w-0 transition-colors cursor-pointer rounded-xs"
        >
          ▲ Road likely flooded
        </button>

        <button
          type="button"
          onClick={() => onInjectObservation('ROAD_CLOSURE', selectedRoadId)}
          className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-left text-[10.5px] leading-snug break-words min-w-0 transition-colors cursor-pointer rounded-xs"
        >
          ✖ Road closure
        </button>

        <button
          type="button"
          onClick={() => onInjectObservation('ROAD_REOPENED', selectedRoadId)}
          className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-left text-[10.5px] leading-snug break-words min-w-0 transition-colors cursor-pointer rounded-xs"
        >
          ● Road reopened
        </button>

        <button
          type="button"
          onClick={() => onInjectObservation('CROWD_REPORT', selectedRoadId)}
          className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-left text-[10.5px] leading-snug break-words min-w-0 transition-colors cursor-pointer rounded-xs"
        >
          ⚑ Crowd report
        </button>

        <button
          type="button"
          onClick={() => onInjectObservation('SENSOR_FAILURE', selectedSensorId)}
          className="col-span-2 px-2 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-800 text-left text-[10.5px] leading-snug break-words min-w-0 transition-colors cursor-pointer rounded-xs"
        >
          ⚡ Sensor failure
        </button>
      </div>

      {/* Real-Time Cascading Activity Feed */}
      <div className="bg-[#EDF3F7] border border-[#D4E0E8] p-2.5 rounded-xs">
        <div className="flex items-center justify-between font-mono text-[10px] text-[#526778] mb-1.5">
          <span>REAL-TIME OPERATIONS ACTIVITY FEED</span>
          <span className="text-[#258C91] font-semibold shrink-0">● STREAMING PIPELINE</span>
        </div>
        <div className="space-y-1.5 max-h-40 overflow-y-auto overflow-x-hidden font-mono text-[11px] tabular-nums pr-1">
          {activityFeed.map((entry) => (
            <div
              key={entry.id}
              onClick={() =>
                entry.relatedTarget && onSelectMapTarget(entry.relatedTarget)
              }
              className={`px-2 py-1 border-l-2 bg-[#FFFFFF] border-y border-r border-[#D4E0E8] flex items-start justify-between gap-2 rounded-xs ${
                entry.relatedTarget ? 'cursor-pointer hover:bg-[#EDF3F7]' : ''
              } ${
                entry.severity === 'CRITICAL'
                  ? 'border-l-rose-500 text-rose-800'
                  : entry.severity === 'WARNING'
                  ? 'border-l-amber-500 text-amber-800'
                  : entry.severity === 'SUCCESS'
                  ? 'border-l-emerald-500 text-emerald-800'
                  : 'border-l-[#287FB5] text-[#263746]'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[#526778]">{entry.timestamp}</span>
                  {entry.eventTypeLabel && (
                    <span className="px-1.5 py-0.2 bg-[#EDF3F7] border border-[#D4E0E8] text-[#287FB5] font-bold text-[10px] rounded-xs">
                      {entry.eventTypeLabel}
                    </span>
                  )}
                  <span className="font-medium break-words text-[#263746]">{entry.message}</span>
                </div>
                {entry.detail && (
                  <div className="text-[10px] text-[#526778] mt-0.5 break-words">
                    {entry.detail}
                  </div>
                )}
              </div>
              <span className="text-[9.5px] text-[#526778] shrink-0">
                {entry.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
