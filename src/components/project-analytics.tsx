'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Code,
  Clock,
  PieChart as PieChartIcon,
} from 'lucide-react';

/* ============================================================
   Sample Data
   ============================================================ */
const deploymentActivity = [
  { day: 'Mon', deployments: 3, successful: 3, failed: 0 },
  { day: 'Tue', deployments: 5, successful: 4, failed: 1 },
  { day: 'Wed', deployments: 2, successful: 2, failed: 0 },
  { day: 'Thu', deployments: 7, successful: 6, failed: 1 },
  { day: 'Fri', deployments: 4, successful: 4, failed: 0 },
  { day: 'Sat', deployments: 1, successful: 1, failed: 0 },
  { day: 'Sun', deployments: 3, successful: 2, failed: 1 },
];

const frameworkDistribution = [
  { name: 'Next.js', value: 45, color: '#58a6ff' },
  { name: 'React', value: 25, color: '#61dafb' },
  { name: 'Vue', value: 15, color: '#42b883' },
  { name: 'Express', value: 10, color: '#8b949e' },
  { name: 'FastAPI', value: 5, color: '#009688' },
];

const durationTrend = [
  { day: 'Mon', avg: 145 },
  { day: 'Tue', avg: 132 },
  { day: 'Wed', avg: 168 },
  { day: 'Thu', avg: 120 },
  { day: 'Fri', avg: 155 },
  { day: 'Sat', avg: 98 },
  { day: 'Sun', avg: 142 },
];

/* ============================================================
   Custom Tooltip Components
   ============================================================ */
function DeploymentTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{
        backgroundColor: '#1c2128',
        border: '1px solid #30363d',
      }}
    >
      <p className="font-semibold mb-1" style={{ color: '#c9d1d9' }}>{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span style={{ color: '#8b949e' }}>{entry.dataKey}:</span>
          <span className="font-medium" style={{ color: entry.color }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function DurationTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0].value;
  const mins = Math.floor(val / 60);
  const secs = val % 60;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{
        backgroundColor: '#1c2128',
        border: '1px solid #30363d',
      }}
    >
      <p className="font-semibold" style={{ color: '#c9d1d9' }}>{label}</p>
      <p style={{ color: '#58a6ff' }}>
        Avg: {mins > 0 ? `${mins}m ` : ''}{secs}s
      </p>
    </div>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{
        backgroundColor: '#1c2128',
        border: '1px solid #30363d',
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.payload.color }} />
        <span className="font-medium" style={{ color: item.payload.color }}>{item.name}</span>
      </div>
      <p style={{ color: '#c9d1d9' }}>{item.value} projects ({Math.round((item.value / frameworkDistribution.reduce((a, b) => a + b.value, 0)) * 100)}%)</p>
    </div>
  );
}

/* ============================================================
   Custom Pie Label
   ============================================================ */
const RADIAN = Math.PI / 180;
function renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number; name: string }) {
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="#8b949e" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
      {name} {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

/* ============================================================
   Main Component
   ============================================================ */
export function ProjectAnalytics() {
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  const cardStyle = {
    backgroundColor: '#161b22',
    borderColor: '#30363d',
  };

  const onPieEnter = (_: unknown, index: number) => {
    setActivePieIndex(index);
  };

  const onPieLeave = () => {
    setActivePieIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <BarChart3 className="w-4 h-4" style={{ color: '#58a6ff' }} />
        <h2 className="text-sm font-semibold" style={{ color: '#c9d1d9' }}>Project Analytics</h2>
        <span className="text-[10px] ml-auto" style={{ color: '#484f58' }}>Last 7 days</span>
      </motion.div>

      {/* Top Row: Deployment Activity + Framework Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deployment Activity - Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card style={cardStyle}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#c9d1d9' }}>
                <TrendingUp className="w-4 h-4" style={{ color: '#3fb950' }} />
                Deployment Activity
                <span className="text-[10px] font-normal ml-auto" style={{ color: '#484f58' }}>7 day trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={deploymentActivity} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="deployGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3fb950" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3fb950" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#58a6ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#58a6ff" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={{ stroke: '#30363d' }} tickLine={false} />
                    <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<DeploymentTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="deployments"
                      stroke="#3fb950"
                      strokeWidth={2.5}
                      fill="url(#deployGradient)"
                      animationDuration={1200}
                      animationBegin={200}
                      dot={{ r: 3, fill: '#0d1117', stroke: '#3fb950', strokeWidth: 2 }}
                      activeDot={{ r: 5, fill: '#3fb950', stroke: '#0d1117', strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="successful"
                      stroke="#58a6ff"
                      strokeWidth={2}
                      fill="url(#successGradient)"
                      animationDuration={1400}
                      animationBegin={400}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded" style={{ backgroundColor: '#3fb950' }} />
                  <span className="text-[10px]" style={{ color: '#8b949e' }}>Total Deployments</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded" style={{ backgroundColor: '#58a6ff', borderStyle: 'dashed' }} />
                  <span className="text-[10px]" style={{ color: '#8b949e' }}>Successful</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Framework Distribution - Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card style={cardStyle}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#c9d1d9' }}>
                <PieChartIcon className="w-4 h-4" style={{ color: '#a371f7' }} />
                Framework Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={frameworkDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={75}
                      innerRadius={45}
                      paddingAngle={3}
                      dataKey="value"
                      animationBegin={300}
                      animationDuration={1000}
                      onMouseEnter={onPieEnter}
                      onMouseLeave={onPieLeave}
                    >
                      {frameworkDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={activePieIndex === index ? entry.color : '#161b22'}
                          strokeWidth={activePieIndex === index ? 3 : 1}
                          style={{
                            filter: activePieIndex === index ? `drop-shadow(0 0 8px ${entry.color}60)` : 'none',
                            transform: activePieIndex === index ? 'scale(1.05)' : 'scale(1)',
                            transformOrigin: 'center',
                            transition: 'all 0.2s ease',
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1">
                {frameworkDistribution.map((fw) => (
                  <div key={fw.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: fw.color }} />
                    <span className="text-[10px]" style={{ color: '#8b949e' }}>{fw.name}</span>
                    <span className="text-[10px] font-semibold" style={{ color: fw.color }}>{fw.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row: Build Success Rate + Duration Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Build Success Rate - Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card style={cardStyle}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#c9d1d9' }}>
                <Code className="w-4 h-4" style={{ color: '#3fb950' }} />
                Build Success Rate
                <span className="text-[10px] font-normal ml-auto" style={{ color: '#484f58' }}>Per day</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deploymentActivity} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={2}>
                    <defs>
                      <linearGradient id="successBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3fb950" stopOpacity={1} />
                        <stop offset="100%" stopColor="#3fb950" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="failedBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f85149" stopOpacity={1} />
                        <stop offset="100%" stopColor="#f85149" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={{ stroke: '#30363d' }} tickLine={false} />
                    <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<DeploymentTooltip />} />
                    <Bar dataKey="successful" fill="url(#successBarGradient)" radius={[4, 4, 0, 0]} animationDuration={800} animationBegin={300} maxBarSize={32} />
                    <Bar dataKey="failed" fill="url(#failedBarGradient)" radius={[4, 4, 0, 0]} animationDuration={800} animationBegin={500} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Legend + Success Rate */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#3fb950' }} />
                    <span className="text-[10px]" style={{ color: '#8b949e' }}>Successful</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#f85149' }} />
                    <span className="text-[10px]" style={{ color: '#8b949e' }}>Failed</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px]" style={{ color: '#8b949e' }}>Success Rate:</span>
                  <span className="text-xs font-bold" style={{ color: '#3fb950' }}>
                    {Math.round((deploymentActivity.reduce((a, d) => a + d.successful, 0) / deploymentActivity.reduce((a, d) => a + d.deployments, 0)) * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Deployment Duration Trend - Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Card style={cardStyle}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#c9d1d9' }}>
                <Clock className="w-4 h-4" style={{ color: '#e3b341' }} />
                Deployment Duration
                <span className="text-[10px] font-normal ml-auto" style={{ color: '#484f58' }}>Avg time (seconds)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={durationTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e3b341" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#e3b341" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={{ stroke: '#30363d' }} tickLine={false} />
                    <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<DurationTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      stroke="#e3b341"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#0d1117', stroke: '#e3b341', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#e3b341', stroke: '#0d1117', strokeWidth: 2 }}
                      animationDuration={1200}
                      animationBegin={300}
                      style={{
                        filter: 'drop-shadow(0 0 4px rgba(227, 179, 65, 0.4))',
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Avg Duration Summary */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded" style={{ backgroundColor: '#e3b341' }} />
                  <span className="text-[10px]" style={{ color: '#8b949e' }}>Average Duration</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px]" style={{ color: '#8b949e' }}>Weekly Avg:</span>
                  <span className="text-xs font-bold" style={{ color: '#e3b341' }}>
                    {Math.round(durationTrend.reduce((a, d) => a + d.avg, 0) / durationTrend.length)}s
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
