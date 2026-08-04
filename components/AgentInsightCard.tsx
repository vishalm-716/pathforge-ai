"use client";

import { useState } from "react";
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  Check,
  X,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface InsightCardProps {
  insight: {
    id: string;
    riskType: string;
    priority: number;
    signal: string;
    explanation: string;
    recommendedChanges: string;
    status: string;
    createdAt: string;
  };
  onRespond: (insightId: string, decision: string, reason?: string) => Promise<void>;
}

const riskConfig: Record<string, { icon: typeof Brain; color: string; bg: string; label: string }> = {
  MASTERY_GAP: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Mastery Gap Detected" },
  CODING_GAP: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", label: "Coding Gap Detected" },
  INACTIVITY_RISK: { icon: Clock, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Inactivity Risk" },
  SCHEDULE_RISK: { icon: Calendar, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", label: "Schedule Risk" },
  ACCELERATION_OPPORTUNITY: { icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Acceleration Opportunity" },
};

export default function AgentInsightCard({ insight, onRespond }: InsightCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [responded, setResponded] = useState(false);

  const config = riskConfig[insight.riskType] || riskConfig.MASTERY_GAP;
  const Icon = config.icon;

  let changes: Array<{ type: string; description: string }> = [];
  try {
    changes = JSON.parse(insight.recommendedChanges);
  } catch {
    changes = [];
  }

  const handleRespond = async (decision: string) => {
    setLoading(true);
    await onRespond(insight.id, decision);
    setResponded(true);
    setLoading(false);
  };

  if (responded) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
        <div className="flex items-center gap-3 text-emerald-400">
          <Check className="w-5 h-5" />
          <span className="font-medium">Response recorded. Your plan has been updated.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border ${config.bg} p-6 space-y-4`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center`}>
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-purple-400">PathForge Agent Insight</h3>
            <p className={`text-lg font-bold ${config.color}`}>{config.label}</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-white transition"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Signal */}
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span>{insight.signal}</span>
      </div>

      {expanded && (
        <>
          {/* Explanation */}
          <div className="bg-slate-900/50 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
            {insight.explanation}
          </div>

          {/* Recommended Changes */}
          {changes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-400">Recommended Changes</h4>
              {changes.map((change, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                  {change.description}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => handleRespond("ACCEPTED")}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all text-sm font-medium disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Accept Update
            </button>
            <button
              onClick={() => handleRespond("RESCHEDULED")}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all text-sm font-medium disabled:opacity-50"
            >
              <Calendar className="w-4 h-4" />
              Reschedule
            </button>
            <button
              onClick={() => handleRespond("REJECTED")}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Reject Update
            </button>
          </div>
        </>
      )}
    </div>
  );
}
