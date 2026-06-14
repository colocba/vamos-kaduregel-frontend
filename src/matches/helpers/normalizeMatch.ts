import type { MatchDoc } from "../../types/match";

type LegacyShape = Partial<MatchDoc> & { numFields?: 1 | 2 };

export function normalizeMatchDoc(raw: unknown): MatchDoc {
  const data = raw as LegacyShape;
  let numTeams: number;
  if (typeof data.numTeams === "number" && data.numTeams >= 1) {
    numTeams = data.numTeams;
  } else if (data.numFields === 1) {
    numTeams = 2;
  } else if (data.numFields === 2) {
    numTeams = 4;
  } else {
    numTeams = 2;
  }
  const playerLimit =
    typeof data.playerLimit === "number" && data.playerLimit > 0
      ? data.playerLimit
      : numTeams * 6;
  const teamsPublished = data.teamsPublished === true;
  return { ...(data as MatchDoc), numTeams, playerLimit, teamsPublished };
}
