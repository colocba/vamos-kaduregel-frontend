import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Match } from "../types/match";
import type { Participant } from "../types/participant";
import {
  setParticipantTeams,
  type TeamAssignment,
} from "../matches/api/setParticipantTeams";
import { Avatar } from "./Avatar";

type TeamId = number;
type Slot = TeamId | null; // null = pool

const TEAM_TINT_PALETTE: { ring: string; chip: string; halo: string }[] = [
  {
    ring: "border-pitch-300",
    chip: "bg-pitch-50 text-pitch-800 border-pitch-200",
    halo: "from-pitch-100/70",
  },
  {
    ring: "border-stadium-400/60",
    chip: "bg-stadium-400/10 text-stadium-600 border-stadium-400/40",
    halo: "from-stadium-400/20",
  },
  {
    ring: "border-sky-300",
    chip: "bg-sky-50 text-sky-800 border-sky-200",
    halo: "from-sky-100/70",
  },
  {
    ring: "border-violet-300",
    chip: "bg-violet-50 text-violet-800 border-violet-200",
    halo: "from-violet-100/70",
  },
  {
    ring: "border-rose-300",
    chip: "bg-rose-50 text-rose-800 border-rose-200",
    halo: "from-rose-100/70",
  },
  {
    ring: "border-amber-300",
    chip: "bg-amber-50 text-amber-800 border-amber-200",
    halo: "from-amber-100/70",
  },
];

function tintForTeam(id: TeamId) {
  return TEAM_TINT_PALETTE[(id - 1) % TEAM_TINT_PALETTE.length];
}

function nameOf(p: Participant) {
  return p.isGuest ? (p.guestName ?? "?") : p.paidByName;
}

function PlayerChip({
  participant,
  selected,
  draggable,
  onClick,
  onDragStart,
}: {
  participant: Participant;
  selected: boolean;
  draggable: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
}) {
  const name = nameOf(participant);
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      disabled={!onClick && !draggable}
      className={`group/chip flex w-full items-center gap-2 rounded-full border bg-white px-2.5 py-1.5 text-start text-xs font-semibold shadow-sm transition-all ${
        selected
          ? "border-pitch-500 bg-pitch-50 ring-2 ring-pitch-200"
          : "border-line hover:border-pitch-200"
      } ${draggable ? "cursor-grab active:cursor-grabbing" : ""} disabled:cursor-default`}
      aria-pressed={selected}
    >
      <Avatar name={name} size="sm" />
      <span className="min-w-0 flex-1 truncate text-ink">{name}</span>
      {participant.isGuest && (
        <span className="pill border-stadium-400/40 bg-stadium-400/10 text-[10px] text-stadium-600">
          G
        </span>
      )}
    </button>
  );
}

function DropZone({
  label,
  team,
  count,
  isOver,
  isAdmin,
  selectedActive,
  tint,
  onActivate,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}: {
  label: string;
  team: Slot;
  count: number;
  isOver: boolean;
  isAdmin: boolean;
  selectedActive: boolean;
  tint?: { ring: string; chip: string; halo: string };
  onActivate?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  children: React.ReactNode;
}) {
  const ringColor = tint?.ring ?? "border-line";
  const chip = tint?.chip ?? "bg-paper text-ink border-line";
  const halo = tint?.halo ?? "from-pitch-100/0";

  return (
    <div
      onDragOver={isAdmin ? onDragOver : undefined}
      onDragLeave={isAdmin ? onDragLeave : undefined}
      onDrop={isAdmin ? onDrop : undefined}
      onClick={isAdmin && selectedActive ? onActivate : undefined}
      className={`relative flex min-h-[120px] flex-col rounded-2xl border-2 ${ringColor} bg-white p-3 shadow-card transition-all ${
        isOver ? "scale-[1.01] ring-4 ring-pitch-200" : ""
      } ${selectedActive ? "cursor-pointer hover:border-pitch-500" : ""}`}
      data-team={team ?? "pool"}
      role={isAdmin ? "region" : undefined}
      aria-label={label}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${halo} to-transparent opacity-50`}
      />
      <div className="relative mb-2 flex items-center justify-between">
        <span className={`pill ${chip} font-display !text-[10px] uppercase tracking-[0.18em]`}>
          {label}
        </span>
        <span className="font-display text-xs font-extrabold tabular-nums text-ash">
          {count}
        </span>
      </div>
      <div className="relative flex-1 space-y-1.5">{children}</div>
    </div>
  );
}

export function TeamsBoard({
  match,
  participants,
  isAdmin,
}: {
  match: Match;
  participants: Participant[];
  isAdmin: boolean;
}) {
  const { t } = useTranslation();
  const teams = match.numTeams;
  const teamIds = useMemo(
    () => Array.from({ length: teams }, (_, i) => i + 1),
    [teams],
  );

  const [overrides, setOverrides] = useState<Record<string, Slot>>({});
  const [overTarget, setOverTarget] = useState<Slot | "none">("none");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stage: Record<string, Slot> = {};
  for (const p of participants) {
    stage[p.id] =
      p.id in overrides ? overrides[p.id] : ((p.team as Slot | undefined) ?? null);
  }

  const groups: Record<string, Participant[]> = { pool: [] };
  for (const id of teamIds) groups[`t${id}`] = [];
  for (const p of participants) {
    const slot = stage[p.id];
    const bucket = slot === null ? "pool" : `t${slot}`;
    if (groups[bucket]) groups[bucket].push(p);
    else groups.pool.push(p);
  }

  const dirty = participants.some((p) => stage[p.id] !== ((p.team as Slot | undefined) ?? null));

  function handleDrop(target: Slot) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      setOverTarget("none");
      const id = e.dataTransfer.getData("text/plain");
      if (!id) return;
      const current = stage[id];
      if (current === target) return;
      setOverrides((prev) => ({ ...prev, [id]: target }));
    };
  }

  function handleTapAssign(target: Slot) {
    if (!selectedId) return;
    const current = stage[selectedId];
    if (current !== target) {
      setOverrides((prev) => ({ ...prev, [selectedId]: target }));
    }
    setSelectedId(null);
  }

  function handleSave() {
    setError(null);
    const assignments: TeamAssignment[] = participants
      .filter((p) => stage[p.id] !== ((p.team as Slot | undefined) ?? null))
      .map((p) => ({ participantId: p.id, team: stage[p.id] }));
    if (assignments.length === 0) return;
    setBusy(true);
    setParticipantTeams(match.id, assignments)
      .then(() => setOverrides({}))
      .catch((e: unknown) => setError((e as Error).message))
      .finally(() => setBusy(false));
  }

  function handleReset() {
    setOverrides({});
    setSelectedId(null);
  }

  if (participants.length === 0) {
    return (
      <section className="surface p-4 sm:p-5">
        <h3 className="font-display text-base font-extrabold uppercase tracking-[0.18em] text-ink">
          {t("match.teams")}
        </h3>
        <p className="mt-3 rounded-xl border border-dashed border-line bg-paper/50 p-6 text-center text-sm text-ash">
          {t("match.noPlayers")}
        </p>
      </section>
    );
  }

  if (!isAdmin) {
    const anyAssigned = participants.some((p) => p.team);
    return (
      <section className="surface p-4 sm:p-5">
        <header className="mb-3 flex items-baseline justify-between">
          <h3 className="font-display text-base font-extrabold uppercase tracking-[0.18em] text-ink">
            {t("match.teams")}
          </h3>
        </header>
        {!anyAssigned ? (
          <p className="rounded-xl border border-dashed border-line bg-paper/50 p-6 text-center text-sm text-ash">
            {t("match.viewTeamsHint")}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {teamIds.map((id) => (
              <DropZone
                key={id}
                team={id}
                isAdmin={false}
                selectedActive={false}
                isOver={false}
                tint={tintForTeam(id)}
                label={t("match.team", { n: id })}
                count={groups[`t${id}`].length}
              >
                {groups[`t${id}`].map((p) => (
                  <PlayerChip key={p.id} participant={p} selected={false} draggable={false} />
                ))}
              </DropZone>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="surface p-4 sm:p-5">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-extrabold uppercase tracking-[0.18em] text-ink">
            {t("match.teams")}
          </h3>
          <p className="mt-1 text-xs text-ash">{t("match.buildTeamsHint")}</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="pill border-stadium-400/40 bg-stadium-400/10 text-stadium-600">
              {t("match.unsaved")}
            </span>
          )}
          <button
            type="button"
            onClick={handleReset}
            disabled={!dirty || busy}
            className="btn-ghost px-3 py-1.5 text-xs"
          >
            {t("match.resetTeams")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || busy}
            className="btn-primary px-3 py-1.5 text-xs"
          >
            {t("match.saveTeams")}
          </button>
        </div>
      </header>

      {error && (
        <p className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <DropZone
          team={null}
          label={t("match.pool")}
          count={groups.pool.length}
          isAdmin
          selectedActive={selectedId !== null}
          isOver={overTarget === null}
          tint={undefined}
          onActivate={() => handleTapAssign(null)}
          onDragOver={(e) => {
            e.preventDefault();
            setOverTarget(null);
          }}
          onDragLeave={() => setOverTarget("none")}
          onDrop={handleDrop(null)}
        >
          {groups.pool.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line bg-paper/40 p-3 text-center text-xs text-ash-soft">
              —
            </p>
          ) : (
            groups.pool.map((p) => (
              <PlayerChip
                key={p.id}
                participant={p}
                selected={selectedId === p.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", p.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onClick={() => setSelectedId((id) => (id === p.id ? null : p.id))}
              />
            ))
          )}
        </DropZone>

        <div
          className={`grid gap-3 ${
            teams >= 4
              ? "sm:grid-cols-2"
              : teams === 3
                ? "sm:grid-cols-3"
                : teams === 2
                  ? "sm:grid-cols-2"
                  : "grid-cols-1"
          }`}
        >
          {teamIds.map((id) => (
            <DropZone
              key={id}
              team={id}
              tint={tintForTeam(id)}
              label={t("match.team", { n: id })}
              count={groups[`t${id}`].length}
              isAdmin
              selectedActive={selectedId !== null}
              isOver={overTarget === id}
              onActivate={() => handleTapAssign(id)}
              onDragOver={(e) => {
                e.preventDefault();
                setOverTarget(id);
              }}
              onDragLeave={() => setOverTarget("none")}
              onDrop={handleDrop(id)}
            >
              {groups[`t${id}`].length === 0 ? (
                <p className="rounded-lg border border-dashed border-line bg-paper/40 p-3 text-center text-xs text-ash-soft">
                  —
                </p>
              ) : (
                groups[`t${id}`].map((p) => (
                  <PlayerChip
                    key={p.id}
                    participant={p}
                    selected={selectedId === p.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", p.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onClick={() => setSelectedId((sid) => (sid === p.id ? null : p.id))}
                  />
                ))
              )}
            </DropZone>
          ))}
        </div>
      </div>
    </section>
  );
}
