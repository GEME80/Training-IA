"use client";

import React from "react";
import { Info } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";

export interface FormattedAerobicSection {
  warmup?: string;
  mainParts: string[];
  cooldown?: string;
}

export interface FormattedGymStructure {
  roundsLabel?: string;
  exercises: string[];
}

export function gymShortDesc(workoutDoc?: string, focus?: string): string {
  if (focus && focus.length > 3) return focus;
  if (!workoutDoc) return "Fortalecimiento neuromuscular";
  const lines = workoutDoc.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#") && !l.startsWith("---"));
  const first = lines[0] || "";
  return first.length > 50 ? first.slice(0, 47) + "…" : first;
}

export function parseGymExercises(workoutDoc?: string): FormattedGymStructure {
  if (!workoutDoc) return { exercises: [] };
  const lines = workoutDoc.split("\n").map((l) => l.trim()).filter(Boolean);
  
  const roundMatch = workoutDoc.match(/\((\d+)\s*rondas?\)/i) || workoutDoc.match(/(\d+)\s*rondas?/i);
  const roundsLabel = roundMatch ? `${roundMatch[1]} Rondas` : undefined;

  const exercises: string[] = [];
  for (const line of lines) {
    if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
      const clean = line.replace(/^[-•*]+\s*/, "").trim();
      if (/bisagra|foam|respiraci|soltura|estiramiento/i.test(clean)) continue;
      if (clean.length > 3) exercises.push(clean);
    }
  }

  return { roundsLabel, exercises: exercises.slice(0, 4) };
}

export function parseAerobicSections(workoutDoc?: string, workoutStructure?: string): FormattedAerobicSection {
  const doc = workoutDoc || workoutStructure || "";
  if (!doc) return { mainParts: [] };

  const lines = doc.split("\n").map((l) => l.trim()).filter(Boolean);
  let warmup: string | undefined;
  let cooldown: string | undefined;
  const mainParts: string[] = [];
  let currentSection: "warmup" | "main" | "cooldown" | "none" = "none";
  let repeatContext = "";

  for (const line of lines) {
    if (/warmup|calentamiento/i.test(line)) { currentSection = "warmup"; continue; }
    if (/cooldown|enfriamiento|vuelta a la calma/i.test(line)) { currentSection = "cooldown"; continue; }
    if (/main|principal|fartlek|series|interval|bloque/i.test(line)) {
      currentSection = "main";
      if (/\d+x/i.test(line)) repeatContext = line.replace(/^#+\s*/, "");
      continue;
    }

    if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
      const clean = line.replace(/^[-•*]+\s*/, "").trim();
      if (currentSection === "warmup" && !warmup) {
        warmup = clean;
      } else if (currentSection === "cooldown" && !cooldown) {
        cooldown = clean;
      } else {
        const prefix = repeatContext ? `[${repeatContext}] ` : "";
        mainParts.push(`${prefix}${clean}`);
        repeatContext = "";
      }
    } else if (/\d+x/i.test(line)) {
      repeatContext = line;
    } else if (currentSection === "main" && cleanSimpleLine(line)) {
      mainParts.push(cleanSimpleLine(line));
    }
  }

  return { warmup, mainParts: mainParts.slice(0, 4), cooldown };
}

function cleanSimpleLine(l: string): string {
  const trimmed = l.trim();
  if (trimmed.startsWith("#") || trimmed.startsWith("---") || /nutric|fueling/i.test(trimmed)) return "";
  return trimmed;
}

export const HeadCoachExpandedGym: React.FC<{ item: PlanItem }> = ({ item }) => {
  const gym = parseGymExercises(item.workoutDoc);
  return (
    <div className="pt-1.5 border-t border-purple-200/50 dark:border-purple-900/50 text-[10px] space-y-1.5">
      {gym.exercises.length > 0 && (
        <div className="space-y-1 bg-purple-100/60 dark:bg-purple-950/40 rounded-lg p-2 font-mono text-[10px]">
          <div className="font-bold text-purple-900 dark:text-purple-200 flex items-center justify-between">
            <span>Circuito de Fuerza:</span>
            {gym.roundsLabel && <span className="text-[9px] px-1.5 py-0.2 bg-purple-200/80 dark:bg-purple-900/60 rounded text-purple-800 dark:text-purple-300">{gym.roundsLabel}</span>}
          </div>
          {gym.exercises.map((ex, exIdx) => (
            <div key={exIdx} className="pl-1.5 border-l-2 border-purple-400 text-slate-800 dark:text-slate-200">
              • {ex}
            </div>
          ))}
        </div>
      )}
      {item.justification && (
        <p className="italic flex items-start gap-1 text-slate-600 dark:text-slate-300">
          <Info className="h-3 w-3 text-purple-500 shrink-0 mt-0.5" />
          <span>{item.justification}</span>
        </p>
      )}
    </div>
  );
};

export const HeadCoachExpandedAerobic: React.FC<{ item: PlanItem }> = ({ item }) => {
  const sec = parseAerobicSections(item.workoutDoc, item.workoutStructure);
  const hasSections = Boolean(sec.warmup || sec.mainParts.length > 0 || sec.cooldown);

  return (
    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/80 text-[10px] space-y-1.5">
      {hasSections && (
        <div className="space-y-1 bg-slate-50 dark:bg-slate-900/60 rounded-lg p-2 font-mono text-[10px]">
          {sec.warmup && (
            <div className="text-sky-600 dark:text-sky-400 font-semibold">
              ⏱️ Calentamiento: <span className="font-normal text-slate-700 dark:text-slate-300">{sec.warmup}</span>
            </div>
          )}
          {sec.mainParts.length > 0 && (
            <div className="space-y-0.5">
              <span className="font-semibold text-amber-600 dark:text-amber-400 block">⚡ Principal:</span>
              {sec.mainParts.map((mp, mIdx) => (
                <div key={mIdx} className="pl-1.5 border-l-2 border-amber-400 text-slate-800 dark:text-slate-200">
                  • {mp}
                </div>
              ))}
            </div>
          )}
          {sec.cooldown && (
            <div className="text-slate-500 font-semibold">
              🧊 Enfriamiento: <span className="font-normal text-slate-600 dark:text-slate-400">{sec.cooldown}</span>
            </div>
          )}
        </div>
      )}
      {item.justification && (
        <p className="italic flex items-start gap-1 text-slate-600 dark:text-slate-300">
          <Info className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
          <span>{item.justification}</span>
        </p>
      )}
    </div>
  );
};
