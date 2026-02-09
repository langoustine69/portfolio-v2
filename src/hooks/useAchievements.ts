'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'exploration' | 'integration' | 'mastery' | 'community' | 'special';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: string;
  unlockedAt?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Exploration
  { id: 'first_visit', name: 'First Steps', description: 'Visit the portfolio for the first time', icon: '👋', category: 'exploration', points: 10, rarity: 'common', requirement: 'Visit homepage' },
  { id: 'agent_viewer', name: 'Window Shopper', description: 'View 5 different agents', icon: '👀', category: 'exploration', points: 25, rarity: 'common', requirement: 'View 5 agent pages' },
  { id: 'agent_explorer', name: 'Agent Explorer', description: 'View 20 different agents', icon: '🔍', category: 'exploration', points: 50, rarity: 'rare', requirement: 'View 20 agent pages' },
  { id: 'agent_connoisseur', name: 'Agent Connoisseur', description: 'View all 50+ agents', icon: '🎯', category: 'exploration', points: 100, rarity: 'epic', requirement: 'View all agents' },
  { id: 'category_hopper', name: 'Category Hopper', description: 'Explore agents from 5 different categories', icon: '🏷️', category: 'exploration', points: 30, rarity: 'common', requirement: 'Browse 5 categories' },
  { id: 'documentation_reader', name: 'RTFM', description: 'Read the documentation', icon: '📚', category: 'exploration', points: 20, rarity: 'common', requirement: 'Visit docs pages' },
  { id: 'changelog_checker', name: 'Changelog Stalker', description: 'Check the changelog', icon: '📋', category: 'exploration', points: 15, rarity: 'common', requirement: 'Visit changelog' },
  
  // Integration
  { id: 'playground_user', name: 'Playground Pioneer', description: 'Test an agent in the playground', icon: '🎮', category: 'integration', points: 40, rarity: 'common', requirement: 'Use API playground' },
  { id: 'sdk_generator', name: 'SDK Enthusiast', description: 'Generate an SDK', icon: '⚙️', category: 'integration', points: 35, rarity: 'common', requirement: 'Use SDK generator' },
  { id: 'code_copier', name: 'Copy Pasta', description: 'Copy 10 code snippets', icon: '📋', category: 'integration', points: 25, rarity: 'common', requirement: 'Copy 10 snippets' },
  { id: 'code_hoarder', name: 'Code Hoarder', description: 'Copy 50 code snippets', icon: '💾', category: 'integration', points: 75, rarity: 'rare', requirement: 'Copy 50 snippets' },
  { id: 'multi_language', name: 'Polyglot', description: 'View code examples in 4 different languages', icon: '🌍', category: 'integration', points: 40, rarity: 'rare', requirement: 'Use 4 languages' },
  { id: 'simulator_user', name: 'Simulation Theory', description: 'Use the request simulator', icon: '🎛️', category: 'integration', points: 30, rarity: 'common', requirement: 'Use simulator' },
  { id: 'export_master', name: 'Export Master', description: 'Export API collections', icon: '📤', category: 'integration', points: 35, rarity: 'common', requirement: 'Export collections' },
  
  // Mastery
  { id: 'comparator', name: 'Decision Maker', description: 'Compare 2 agents', icon: '⚖️', category: 'mastery', points: 30, rarity: 'common', requirement: 'Use comparison tool' },
  { id: 'deep_comparator', name: 'Deep Analyst', description: 'Use deep comparison on 3+ agents', icon: '🔬', category: 'mastery', points: 60, rarity: 'rare', requirement: 'Deep compare 3+ agents' },
  { id: 'workflow_builder', name: 'Architect', description: 'Build a multi-agent workflow', icon: '🏗️', category: 'mastery', points: 80, rarity: 'epic', requirement: 'Create workflow' },
  { id: 'calculator_user', name: 'Number Cruncher', description: 'Use the pricing calculator', icon: '🧮', category: 'mastery', points: 25, rarity: 'common', requirement: 'Use pricing calculator' },
  { id: 'checklist_complete', name: 'Production Ready', description: 'Complete the production checklist', icon: '✅', category: 'mastery', points: 100, rarity: 'epic', requirement: '100% checklist' },
  { id: 'debugger_user', name: 'Bug Hunter', description: 'Use the request debugger', icon: '🐛', category: 'mastery', points: 30, rarity: 'common', requirement: 'Use debugger' },
  { id: 'preflight_pass', name: 'Ready for Takeoff', description: 'Pass all preflight checks', icon: '✈️', category: 'mastery', points: 50, rarity: 'rare', requirement: 'All checks green' },
  
  // Community
  { id: 'newsletter_sub', name: 'Subscribed', description: 'Subscribe to the newsletter', icon: '📧', category: 'community', points: 20, rarity: 'common', requirement: 'Newsletter signup' },
  { id: 'share_agent', name: 'Evangelist', description: 'Share an agent on social media', icon: '📢', category: 'community', points: 25, rarity: 'common', requirement: 'Share agent' },
  { id: 'showcase_viewer', name: 'Inspired', description: 'Browse the community showcase', icon: '🎨', category: 'community', points: 20, rarity: 'common', requirement: 'Visit showcase' },
  { id: 'qa_reader', name: 'Knowledge Seeker', description: 'Read community Q&A', icon: '❓', category: 'community', points: 15, rarity: 'common', requirement: 'Visit Q&A' },
  { id: 'reviewer', name: 'Critic', description: 'Submit an agent review', icon: '⭐', category: 'community', points: 40, rarity: 'rare', requirement: 'Submit review' },
  
  // Special
  { id: 'dark_mode', name: 'Dark Side', description: 'Switch to dark mode', icon: '🌙', category: 'special', points: 10, rarity: 'common', requirement: 'Enable dark mode' },
  { id: 'night_owl', name: 'Night Owl', description: 'Visit between midnight and 4am', icon: '🦉', category: 'special', points: 50, rarity: 'rare', requirement: 'Late night visit' },
  { id: 'early_bird', name: 'Early Bird', description: 'Visit between 5am and 7am', icon: '🐦', category: 'special', points: 50, rarity: 'rare', requirement: 'Early morning visit' },
  { id: 'weekend_warrior', name: 'Weekend Warrior', description: 'Visit on Saturday or Sunday', icon: '🎉', category: 'special', points: 25, rarity: 'common', requirement: 'Weekend visit' },
  { id: 'keyboard_master', name: 'Keyboard Warrior', description: 'Use 5 keyboard shortcuts', icon: '⌨️', category: 'special', points: 40, rarity: 'rare', requirement: 'Use shortcuts' },
  { id: 'command_palette', name: 'Power User', description: 'Open the command palette (Cmd+K)', icon: '⚡', category: 'special', points: 30, rarity: 'common', requirement: 'Use Cmd+K' },
  { id: 'favorite_collector', name: 'Collector', description: 'Favorite 10 agents', icon: '❤️', category: 'special', points: 45, rarity: 'rare', requirement: 'Favorite 10 agents' },
  { id: 'achievement_hunter', name: 'Achievement Hunter', description: 'Unlock 20 achievements', icon: '🏆', category: 'special', points: 150, rarity: 'legendary', requirement: 'Get 20 achievements' },
  { id: 'completionist', name: 'Completionist', description: 'Unlock all achievements', icon: '👑', category: 'special', points: 500, rarity: 'legendary', requirement: 'Get all achievements' },
];

const STORAGE_KEY = 'portfolio_achievements';

interface AchievementState {
  unlocked: { [id: string]: number }; // achievement id -> timestamp
  stats: {
    agentsViewed: string[];
    categoriesViewed: string[];
    snippetsCopied: number;
    languagesUsed: string[];
    shortcutsUsed: number;
  };
}

export function useAchievements() {
  const [state, setState] = useState<AchievementState>({
    unlocked: {},
    stats: {
      agentsViewed: [],
      categoriesViewed: [],
      snippetsCopied: 0,
      languagesUsed: [],
      shortcutsUsed: 0,
    },
  });
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch {
        // Initialize fresh
      }
    }
    // Auto-unlock first_visit
    unlockAchievement('first_visit');
    
    // Check time-based achievements
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    if (hour >= 0 && hour < 4) unlockAchievement('night_owl');
    if (hour >= 5 && hour < 7) unlockAchievement('early_bird');
    if (day === 0 || day === 6) unlockAchievement('weekend_warrior');
  }, []);

  const saveState = useCallback((newState: AchievementState) => {
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setState((prev) => {
      if (prev.unlocked[id]) return prev;
      
      const achievement = ACHIEVEMENTS.find((a) => a.id === id);
      if (achievement) {
        setNewAchievement(achievement);
        setTimeout(() => setNewAchievement(null), 4000);
      }
      
      const newState = {
        ...prev,
        unlocked: { ...prev.unlocked, [id]: Date.now() },
      };
      
      // Check meta achievements
      const unlockedCount = Object.keys(newState.unlocked).length;
      if (unlockedCount >= 20 && !newState.unlocked['achievement_hunter']) {
        newState.unlocked['achievement_hunter'] = Date.now();
      }
      if (unlockedCount >= ACHIEVEMENTS.length - 1 && !newState.unlocked['completionist']) {
        newState.unlocked['completionist'] = Date.now();
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const trackAgentView = useCallback((agentId: string, category: string) => {
    setState((prev) => {
      const agentsViewed = prev.stats.agentsViewed.includes(agentId)
        ? prev.stats.agentsViewed
        : [...prev.stats.agentsViewed, agentId];
      const categoriesViewed = prev.stats.categoriesViewed.includes(category)
        ? prev.stats.categoriesViewed
        : [...prev.stats.categoriesViewed, category];
      
      const newState = {
        ...prev,
        stats: { ...prev.stats, agentsViewed, categoriesViewed },
      };
      
      // Check unlocks
      if (agentsViewed.length >= 5 && !prev.unlocked['agent_viewer']) {
        newState.unlocked = { ...newState.unlocked, agent_viewer: Date.now() };
      }
      if (agentsViewed.length >= 20 && !prev.unlocked['agent_explorer']) {
        newState.unlocked = { ...newState.unlocked, agent_explorer: Date.now() };
      }
      if (agentsViewed.length >= 50 && !prev.unlocked['agent_connoisseur']) {
        newState.unlocked = { ...newState.unlocked, agent_connoisseur: Date.now() };
      }
      if (categoriesViewed.length >= 5 && !prev.unlocked['category_hopper']) {
        newState.unlocked = { ...newState.unlocked, category_hopper: Date.now() };
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const trackSnippetCopy = useCallback(() => {
    setState((prev) => {
      const snippetsCopied = prev.stats.snippetsCopied + 1;
      const newState = {
        ...prev,
        stats: { ...prev.stats, snippetsCopied },
      };
      
      if (snippetsCopied >= 10 && !prev.unlocked['code_copier']) {
        newState.unlocked = { ...newState.unlocked, code_copier: Date.now() };
      }
      if (snippetsCopied >= 50 && !prev.unlocked['code_hoarder']) {
        newState.unlocked = { ...newState.unlocked, code_hoarder: Date.now() };
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const trackLanguageUsed = useCallback((language: string) => {
    setState((prev) => {
      const languagesUsed = prev.stats.languagesUsed.includes(language)
        ? prev.stats.languagesUsed
        : [...prev.stats.languagesUsed, language];
      
      const newState = {
        ...prev,
        stats: { ...prev.stats, languagesUsed },
      };
      
      if (languagesUsed.length >= 4 && !prev.unlocked['multi_language']) {
        newState.unlocked = { ...newState.unlocked, multi_language: Date.now() };
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const trackShortcut = useCallback(() => {
    setState((prev) => {
      const shortcutsUsed = prev.stats.shortcutsUsed + 1;
      const newState = {
        ...prev,
        stats: { ...prev.stats, shortcutsUsed },
      };
      
      if (shortcutsUsed >= 5 && !prev.unlocked['keyboard_master']) {
        newState.unlocked = { ...newState.unlocked, keyboard_master: Date.now() };
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const getAchievements = useCallback((): (Achievement & { unlockedAt?: number })[] => {
    return ACHIEVEMENTS.map((a) => ({
      ...a,
      unlockedAt: state.unlocked[a.id],
    }));
  }, [state.unlocked]);

  const getProgress = useCallback(() => {
    const unlocked = Object.keys(state.unlocked).length;
    const total = ACHIEVEMENTS.length;
    const points = ACHIEVEMENTS.filter((a) => state.unlocked[a.id]).reduce((sum, a) => sum + a.points, 0);
    const maxPoints = ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0);
    
    return { unlocked, total, points, maxPoints, percentage: Math.round((unlocked / total) * 100) };
  }, [state.unlocked]);

  return {
    achievements: getAchievements(),
    progress: getProgress(),
    newAchievement,
    unlockAchievement,
    trackAgentView,
    trackSnippetCopy,
    trackLanguageUsed,
    trackShortcut,
    stats: state.stats,
  };
}
