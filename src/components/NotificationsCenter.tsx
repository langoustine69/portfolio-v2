'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { agents } from '@/data/agents';

interface Notification {
  id: string;
  type: 'new_agent' | 'status_change' | 'update' | 'announcement';
  title: string;
  message: string;
  agentId?: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

// Generate notifications from agent data
function generateNotifications(): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();
  
  // New agents from the last 7 days (based on changelog or assume recent if no changelog)
  const recentAgents = agents.filter(a => {
    if (a.changelog && a.changelog.length > 0) {
      const firstVersion = a.changelog.find(c => c.version === '1.0.0');
      if (firstVersion) {
        const releaseDate = new Date(firstVersion.date);
        const daysDiff = (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 14;
      }
    }
    return false;
  });

  recentAgents.forEach(agent => {
    const releaseDate = agent.changelog?.find(c => c.version === '1.0.0')?.date || now.toISOString().split('T')[0];
    notifications.push({
      id: `new-${agent.id}`,
      type: 'new_agent',
      title: '🚀 New Agent Launched',
      message: `${agent.name} is now live! ${agent.description.slice(0, 80)}...`,
      agentId: agent.id,
      timestamp: releaseDate,
      read: false,
      link: `/agents/${agent.id}`,
    });
  });

  // Recent updates (agents with updates in last 7 days)
  agents.forEach(agent => {
    if (agent.changelog && agent.changelog.length > 0) {
      const recentUpdate = agent.changelog.find(c => {
        const updateDate = new Date(c.date);
        const daysDiff = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7 && c.version !== '1.0.0';
      });
      
      if (recentUpdate) {
        notifications.push({
          id: `update-${agent.id}-${recentUpdate.version}`,
          type: 'update',
          title: `📦 ${agent.name} v${recentUpdate.version}`,
          message: recentUpdate.changes[0] || 'New update available',
          agentId: agent.id,
          timestamp: recentUpdate.date,
          read: false,
          link: `/agents/${agent.id}`,
        });
      }
    }
  });

  // Status changes (offline agents)
  const offlineAgents = agents.filter(a => a.status === 'offline');
  offlineAgents.forEach(agent => {
    notifications.push({
      id: `offline-${agent.id}`,
      type: 'status_change',
      title: '⚠️ Agent Offline',
      message: `${agent.name} is currently offline`,
      agentId: agent.id,
      timestamp: now.toISOString().split('T')[0],
      read: false,
      link: `/agents/${agent.id}`,
    });
  });

  // Announcements
  notifications.push({
    id: 'announcement-sdk-gen',
    type: 'announcement',
    title: '🔧 SDK Generator Available',
    message: 'Generate production-ready SDK code for any agent in TypeScript, Python, Go, or Rust',
    timestamp: '2026-02-05',
    read: false,
    link: '/sdk',
  });

  notifications.push({
    id: 'announcement-bundles',
    type: 'announcement',
    title: '📦 Agent Bundles',
    message: 'Curated collections of agents that work together for specific use cases',
    timestamp: '2026-02-05',
    read: false,
    link: '/bundles',
  });

  // Sort by timestamp descending
  notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return notifications.slice(0, 20); // Max 20 notifications
}

export default function NotificationsCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load read state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('notifications-read');
    if (stored) {
      setReadIds(new Set(JSON.parse(stored)));
    }
    setNotifications(generateNotifications());
  }, []);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const markAsRead = useCallback((id: string) => {
    const newReadIds = new Set(readIds);
    newReadIds.add(id);
    setReadIds(newReadIds);
    localStorage.setItem('notifications-read', JSON.stringify([...newReadIds]));
  }, [readIds]);

  const markAllAsRead = useCallback(() => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadIds(allIds);
    localStorage.setItem('notifications-read', JSON.stringify([...allIds]));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_agent': return '🚀';
      case 'status_change': return '⚠️';
      case 'update': return '📦';
      case 'announcement': return '📢';
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'new_agent': return 'bg-green-100 dark:bg-green-900/30 border-green-500';
      case 'status_change': return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500';
      case 'update': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500';
      case 'announcement': return 'bg-purple-100 dark:bg-purple-900/30 border-purple-500';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-lobster-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-black dark:border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 border-4 border-black dark:border-white shadow-brutal z-50 max-h-[70vh] overflow-hidden flex flex-col"
          style={{ boxShadow: '4px 4px 0px 0px #000' }}
          role="dialog"
          aria-label="Notifications"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-black dark:border-white bg-brutal-yellow dark:bg-gray-800">
            <h3 className="font-black uppercase text-sm">
              🔔 Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-lobster-500">({unreadCount} new)</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-lobster-500 uppercase"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <span className="text-4xl block mb-2">🦞</span>
                <p className="font-medium">All caught up!</p>
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <ul className="divide-y-2 divide-black/10 dark:divide-white/10">
                {notifications.map(notification => {
                  const isUnread = !readIds.has(notification.id);
                  
                  return (
                    <li key={notification.id}>
                      <Link
                        href={notification.link || '#'}
                        onClick={() => {
                          markAsRead(notification.id);
                          setIsOpen(false);
                        }}
                        className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          isUnread ? 'bg-lobster-50 dark:bg-lobster-900/10' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Type Badge */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg border-2 ${getTypeColor(notification.type)} flex items-center justify-center text-lg`}>
                            {getTypeIcon(notification.type)}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-bold text-gray-900 dark:text-white truncate ${isUnread ? '' : 'font-medium'}`}>
                                {notification.title}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                {formatDate(notification.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            {notification.agentId && (
                              <span className="inline-block mt-1 text-xs font-medium text-lobster-500 bg-lobster-100 dark:bg-lobster-900/30 px-2 py-0.5 rounded">
                                {agents.find(a => a.id === notification.agentId)?.icon} {agents.find(a => a.id === notification.agentId)?.name}
                              </span>
                            )}
                          </div>
                          
                          {/* Unread Indicator */}
                          {isUnread && (
                            <div className="flex-shrink-0 w-2 h-2 bg-lobster-500 rounded-full mt-2" />
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t-2 border-black dark:border-white bg-gray-50 dark:bg-gray-800">
            <Link
              href="/changelog"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center text-sm font-bold text-lobster-500 hover:text-lobster-600 uppercase"
            >
              View All Updates →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for mobile menu
export function NotificationsBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('notifications-read');
    const readIds = stored ? new Set(JSON.parse(stored)) : new Set();
    const notifications = generateNotifications();
    setUnreadCount(notifications.filter(n => !readIds.has(n.id)).length);
  }, []);

  if (unreadCount === 0) return null;

  return (
    <span className="ml-2 w-5 h-5 bg-lobster-500 text-white text-xs font-bold rounded-full inline-flex items-center justify-center">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
}
