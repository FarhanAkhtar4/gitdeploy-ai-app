'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store/app-store';
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  FileCode,
} from 'lucide-react';

function CircularProgress({ value, size = 80, strokeWidth = 6 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (v: number) => {
    if (v >= 80) return '#3fb950';
    if (v >= 50) return '#e3b341';
    return '#f85149';
  };

  const color = getColor(value);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#21262d"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{value}</span>
      </div>
    </div>
  );
}

function HealthFactor({
  label,
  value,
  status,
  icon: Icon,
}: {
  label: string;
  value: string;
  status: 'good' | 'warning' | 'bad';
  icon: React.ElementType;
}) {
  const colors = {
    good: { color: '#3fb950', bg: 'rgba(63,185,80,0.15)' },
    warning: { color: '#e3b341', bg: 'rgba(227,179,65,0.15)' },
    bad: { color: '#f85149', bg: 'rgba(248,81,73,0.15)' },
  };
  const config = colors[status];

  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <div className="p-1 rounded" style={{ backgroundColor: config.bg }}>
        <Icon className="w-3 h-3" style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase font-medium" style={{ color: '#8b949e' }}>{label}</p>
        <p className="text-xs font-medium" style={{ color: '#c9d1d9' }}>{value}</p>
      </div>
      {status === 'good' && <CheckCircle className="w-3.5 h-3.5" style={{ color: '#3fb950' }} />}
      {status === 'warning' && <Clock className="w-3.5 h-3.5" style={{ color: '#e3b341' }} />}
      {status === 'bad' && <XCircle className="w-3.5 h-3.5" style={{ color: '#f85149' }} />}
    </div>
  );
}

export function ProjectHealth() {
  const { projects, isGithubConnected } = useAppStore();

  // Calculate health score
  const totalProjects = projects.length;
  const liveProjects = projects.filter((p) => p.status === 'live').length;
  const failedProjects = projects.filter((p) => p.status === 'failed').length;

  let healthScore = 50; // base score
  if (isGithubConnected) healthScore += 15;
  if (totalProjects > 0) healthScore += 10;
  if (liveProjects > 0) healthScore += 15;
  if (failedProjects === 0 && totalProjects > 0) healthScore += 10;
  if (totalProjects === 0 && !isGithubConnected) healthScore = 25;
  healthScore = Math.min(100, healthScore);

  const getLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Setup';
    return 'Getting Started';
  };

  return (
    <Card style={{ backgroundColor: '#161b22', borderColor: '#30363d' }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#c9d1d9' }}>
          <Activity className="w-4 h-4" style={{ color: '#58a6ff' }} />
          Project Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <CircularProgress value={healthScore} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: '#c9d1d9' }}>
              {getLabel(healthScore)}
            </p>
            <p className="text-[10px] mt-1" style={{ color: '#8b949e' }}>
              {isGithubConnected
                ? 'Your setup looks good'
                : 'Connect GitHub to improve your score'}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-1 pt-3 border-t" style={{ borderColor: '#21262d' }}>
          <HealthFactor
            label="GitHub Connected"
            value={isGithubConnected ? 'Active' : 'Not connected'}
            status={isGithubConnected ? 'good' : 'bad'}
            icon={CheckCircle}
          />
          <HealthFactor
            label="Projects"
            value={`${totalProjects} total • ${liveProjects} live`}
            status={totalProjects > 0 ? (liveProjects > 0 ? 'good' : 'warning') : 'bad'}
            icon={FileCode}
          />
          <HealthFactor
            label="Deployments"
            value={failedProjects > 0 ? `${failedProjects} failed` : liveProjects > 0 ? 'All successful' : 'No deployments'}
            status={failedProjects > 0 ? 'bad' : liveProjects > 0 ? 'good' : 'warning'}
            icon={Activity}
          />
        </div>
      </CardContent>
    </Card>
  );
}
