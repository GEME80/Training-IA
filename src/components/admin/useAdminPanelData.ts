"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminUserListItem, AdminStats } from "@/lib/db/types";
import { useAuth } from "@/context/AuthContext";
import { AgentPromptsLibrary, DEFAULT_PROMPTS } from "@/lib/ai/prompts";
import {
  MacrocycleDefinition,
  DEFAULT_MACROCYCLE_LIBRARY,
} from "@/lib/physiology/macrocycleLibrary";
import {
  TokenPeriod,
  GeminiModelDto,
  GlobalAISettings,
  FirestoreStatsData,
  TokenTelemetryData,
  LiveConnectionsData,
} from "./types";

export function useAdminPanelData() {
  const { user, userProfile } = useAuth();
  const [tokenPeriod, setTokenPeriod] = useState<TokenPeriod>("monthly");

  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [tokenTelemetry, setTokenTelemetry] = useState<TokenTelemetryData | null>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [firestoreStats, setFirestoreStats] = useState<FirestoreStatsData | null>(null);

  const [aiSettings, setAiSettings] = useState<GlobalAISettings>({
    primaryModel: "gemini-2.5-flash",
    temperature: 0.0,
    fallbackModels: ["gemini-2.0-flash", "gemini-1.5-pro"],
    systemPrompt: "",
    hasCustomApiKey: false,
  });
  const [availableModels, setAvailableModels] = useState<GeminiModelDto[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);
  const [isSavingAI, setIsSavingAI] = useState<boolean>(false);

  const [prompts, setPrompts] = useState<AgentPromptsLibrary>(DEFAULT_PROMPTS);
  const [isSavingPrompts, setIsSavingPrompts] = useState<boolean>(false);

  const [connections, setConnections] = useState<LiveConnectionsData | null>(null);
  const [programs, setPrograms] = useState<MacrocycleDefinition[]>(DEFAULT_MACROCYCLE_LIBRARY);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState<boolean>(false);

  const showMessage = (text: string, type: "success" | "error") => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const getAuthParams = useCallback(() => {
    const currentUid = user?.uid || userProfile?.uid || "superadmin-root";
    const currentEmail = user?.email || userProfile?.email || "gerkof@gmail.com";
    return { requesterUid: currentUid, requesterEmail: currentEmail };
  }, [user, userProfile]);

  const fetchPrograms = useCallback(async () => {
    setIsLoadingPrograms(true);
    try {
      const authParams = getAuthParams();
      const queryParams = new URLSearchParams();
      queryParams.set("requesterUid", authParams.requesterUid);
      queryParams.set("requesterEmail", authParams.requesterEmail);

      const res = await fetch(`/api/admin/programs?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.programs) setPrograms(data.programs);
      }
    } catch (err) {
      console.error("Error al cargar programas deportivos:", err);
    } finally {
      setIsLoadingPrograms(false);
    }
  }, [getAuthParams]);

  const fetchUsersAndStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const authParams = getAuthParams();
      const queryParams = new URLSearchParams();
      queryParams.set("requesterUid", authParams.requesterUid);
      queryParams.set("requesterEmail", authParams.requesterEmail);

      const res = await fetch(`/api/admin/users?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsers(data.users || []);
          setStats(data.stats || null);
        }
      }
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthParams]);

  const fetchTokenTelemetry = useCallback(async (period: TokenPeriod) => {
    try {
      const authParams = getAuthParams();
      const queryParams = new URLSearchParams();
      queryParams.set("requesterUid", authParams.requesterUid);
      queryParams.set("requesterEmail", authParams.requesterEmail);
      queryParams.set("period", period);

      const res = await fetch(`/api/admin/tokens?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setTokenTelemetry(data);
      }
    } catch (err) {
      console.error("Error al cargar tokens:", err);
    }
  }, [getAuthParams]);

  const fetchSystemConfig = useCallback(async () => {
    try {
      const authParams = getAuthParams();
      const queryParams = new URLSearchParams();
      queryParams.set("requesterUid", authParams.requesterUid);
      queryParams.set("requesterEmail", authParams.requesterEmail);

      const res = await fetch(`/api/admin/config?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProjectId(data.projectId);
          setFirestoreStats(data.firestoreStats || null);
          if (data.aiSettings) setAiSettings(data.aiSettings);
        }
      }
    } catch (err) {
      console.error("Error al cargar config:", err);
    }
  }, [getAuthParams]);

  const fetchPrompts = useCallback(async () => {
    try {
      const authParams = getAuthParams();
      const queryParams = new URLSearchParams();
      queryParams.set("requesterUid", authParams.requesterUid);
      queryParams.set("requesterEmail", authParams.requesterEmail);

      const res = await fetch(`/api/admin/prompts?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.prompts) setPrompts(data.prompts);
      }
    } catch (err) {
      console.error("Error al cargar prompts:", err);
    }
  }, [getAuthParams]);

  const testLiveConnections = useCallback(async () => {
    try {
      const authParams = getAuthParams();
      const queryParams = new URLSearchParams();
      queryParams.set("requesterUid", authParams.requesterUid);
      queryParams.set("requesterEmail", authParams.requesterEmail);

      const res = await fetch(`/api/admin/connections?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.connections) setConnections(data.connections);
      }
    } catch (err) {
      console.error("Error al probar conexiones:", err);
    }
  }, [getAuthParams]);

  const fetchGeminiModels = async () => {
    setIsLoadingModels(true);
    try {
      const res = await fetch("/api/gemini/models?refresh=true");
      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models)) setAvailableModels(data.models);
      }
    } catch (err) {
      console.warn("Error al consultar modelos:", err);
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchUsersAndStats();
    fetchTokenTelemetry(tokenPeriod);
    fetchSystemConfig();
    fetchPrompts();
    testLiveConnections();
    fetchGeminiModels();
    fetchPrograms();
  }, [fetchUsersAndStats, fetchTokenTelemetry, fetchSystemConfig, fetchPrompts, testLiveConnections, fetchPrograms, tokenPeriod]);

  const handleSavePrompts = async () => {
    setIsSavingPrompts(true);
    try {
      const authParams = getAuthParams();
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterUid: authParams.requesterUid,
          requesterEmail: authParams.requesterEmail,
          headCoachPrompt: prompts.headCoachPrompt,
          macrocyclePrompt: prompts.macrocyclePrompt,
          dailyAuditPrompt: prompts.dailyAuditPrompt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage("Biblioteca de Prompts guardada con éxito.", "success");
      } else {
        showMessage(data.error || "Error al guardar prompts.", "error");
      }
    } catch {
      showMessage("Error al guardar prompts.", "error");
    } finally {
      setIsSavingPrompts(false);
    }
  };

  const handleSaveAISettings = async () => {
    setIsSavingAI(true);
    try {
      const authParams = getAuthParams();
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterUid: authParams.requesterUid,
          requesterEmail: authParams.requesterEmail,
          primaryModel: aiSettings.primaryModel,
          temperature: aiSettings.temperature,
          fallbackModels: aiSettings.fallbackModels,
          systemPrompt: aiSettings.systemPrompt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage("Ajustes de IA guardados con éxito.", "success");
        fetchSystemConfig();
      } else {
        showMessage(data.error || "Error al guardar ajustes.", "error");
      }
    } catch {
      showMessage("Error de comunicación al guardar.", "error");
    } finally {
      setIsSavingAI(false);
    }
  };

  const handleRefreshAll = () => {
    fetchUsersAndStats();
    fetchTokenTelemetry(tokenPeriod);
    fetchSystemConfig();
    testLiveConnections();
  };

  return {
    tokenPeriod,
    setTokenPeriod,
    users,
    stats,
    isLoading,
    actionMessage,
    setActionMessage,
    showMessage,
    tokenTelemetry,
    projectId,
    firestoreStats,
    aiSettings,
    setAiSettings,
    availableModels,
    isLoadingModels,
    isSavingAI,
    prompts,
    setPrompts,
    isSavingPrompts,
    connections,
    programs,
    isLoadingPrograms,
    getAuthParams,
    fetchPrograms,
    fetchUsersAndStats,
    fetchGeminiModels,
    handleSavePrompts,
    handleSaveAISettings,
    handleRefreshAll,
  };
}
