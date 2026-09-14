"use client";

import {
  Activity,
  Clock3,
  GitBranch,
  Users,
} from "lucide-react";

interface HistoryStatsProps {
  totalEvents: number;
  todayEvents: number;
  uniqueActors: number;
  changes: number;
  loading?: boolean;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}

function StatCard({
  label,
  value,
  icon,
  description,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100 opacity-60 transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all duration-300 group-hover:scale-105">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-4 w-24 rounded bg-slate-200" />

          <div className="mt-3 h-9 w-20 rounded bg-slate-200" />

          <div className="mt-2 h-3 w-32 rounded bg-slate-200" />
        </div>

        <div className="h-11 w-11 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

export default function HistoryStats({
  totalEvents,
  todayEvents,
  uniqueActors,
  changes,
  loading = false,
}: HistoryStatsProps) {
  if (loading) {
    return (
      <section
        aria-label="History statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </section>
    );
  }

  return (
    <section
      aria-label="History statistics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <StatCard
        label="Total events"
        value={totalEvents}
        description="All recorded history events"
        icon={<Activity className="h-5 w-5" />}
      />

      <StatCard
        label="Today"
        value={todayEvents}
        description="Events recorded today"
        icon={<Clock3 className="h-5 w-5" />}
      />

      <StatCard
        label="Active actors"
        value={uniqueActors}
        description="Users who generated activity"
        icon={<Users className="h-5 w-5" />}
      />

      <StatCard
        label="Changes"
        value={changes}
        description="Events containing data changes"
        icon={<GitBranch className="h-5 w-5" />}
      />
    </section>
  );
}