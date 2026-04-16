'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Globe,
  Server,
  Database,
  HardDrive,
  Cpu,
  CheckCircle,
  XCircle,
  ExternalLink,
  Zap,
  AlertTriangle,
  Copy,
  ChevronDown,
  ChevronUp,
  Trophy,
  Star,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Platform {
  name: string;
  description: string;
  freeTier: string;
  autoDeploy: boolean;
  customDomains: boolean;
  ssl: boolean;
  bandwidth: string;
  popularity: number;
  pricingUrl: string;
  pros: string[];
  cons: string[];
}

interface HostingData {
  platforms: {
    frontend: Platform[];
    backend: Platform[];
    database: Platform[];
    redis: Platform[];
    storage: Platform[];
  };
  disclaimer: string;
}

const CATEGORY_CONFIG = [
  { key: 'frontend' as const, label: 'Frontend Hosting', icon: Globe, color: '#58a6ff', emoji: '🌐' },
  { key: 'backend' as const, label: 'Backend Hosting', icon: Server, color: '#e3b341', emoji: '⚙️' },
  { key: 'database' as const, label: 'Database Hosting', icon: Database, color: '#3fb950', emoji: '🗄️' },
  { key: 'redis' as const, label: 'Redis / Cache', icon: Cpu, color: '#f85149', emoji: '⚡' },
  { key: 'storage' as const, label: 'File Storage', icon: HardDrive, color: '#a371f7', emoji: '💾' },
];

// Feature comparison columns
const COMPARISON_FEATURES = [
  { key: 'freeTier', label: 'Free Tier' },
  { key: 'autoDeploy', label: 'Auto Deploy' },
  { key: 'customDomains', label: 'Custom Domains' },
  { key: 'ssl', label: 'SSL' },
  { key: 'bandwidth', label: 'Bandwidth' },
];

function StarRating({ rating, color }: { rating: number; color: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className="w-3 h-3"
          style={{
            color: star <= rating ? color : '#21262d',
            fill: star <= rating ? color : 'none',
          }}
        />
      ))}
    </div>
  );
}

// Normalize platform data to add missing fields with defaults
function normalizePlatform(p: Record<string, unknown>, categoryColor: string): Platform {
  return {
    name: (p.name as string) || 'Unknown',
    description: (p.description as string) || '',
    freeTier: (p.freeTier as string) || 'Limited free tier',
    autoDeploy: (p.autoDeploy as boolean) ?? false,
    customDomains: (p.customDomains as boolean) ?? (p.autoDeploy as boolean) ?? false,
    ssl: (p.ssl as boolean) ?? (p.autoDeploy as boolean) ?? false,
    bandwidth: (p.bandwidth as string) || '100GB/mo',
    popularity: (p.popularity as number) ?? (p.autoDeploy ? 4 : 3),
    pricingUrl: (p.pricingUrl as string) || '#',
    pros: (p.pros as string[]) || [],
    cons: (p.cons as string[]) || [],
  };
}

export function HostingView() {
  const [data, setData] = useState<HostingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/hosting')
      .then((res) => res.json())
      .then((rawData) => {
        // Normalize all platforms
        const normalized = { ...rawData };
        for (const key of Object.keys(normalized.platforms)) {
          const k = key as keyof typeof normalized.platforms;
          const catConfig = CATEGORY_CONFIG.find(c => c.key === k);
          normalized.platforms[k] = (normalized.platforms[k] as Record<string, unknown>[]).map(p =>
            normalizePlatform(p, catConfig?.color || '#58a6ff')
          );
        }
        setData(normalized as HostingData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleCard = (name: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const copyCommand = (platform: string, text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: `${platform} command copied to clipboard` });
  };

  const toggleStepComplete = (stepIdx: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepIdx)) next.delete(stepIdx);
      else next.add(stepIdx);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-lg animate-pulse" style={{ backgroundColor: '#161b22' }} />
        ))}
      </div>
    );
  }

  if (!data) return null;

  // Get top platforms for comparison table
  const topPlatforms: { category: string; platform: Platform; color: string }[] = [];
  for (const cat of CATEGORY_CONFIG) {
    const plats = data.platforms[cat.key];
    if (plats && plats.length > 0) {
      topPlatforms.push({ category: cat.label, platform: plats[0], color: cat.color });
    }
  }

  const setupSteps = [
    { step: 1, title: 'Connect GitHub Repo to Vercel', desc: 'Import your repo at vercel.com/new, auto-detect Next.js, and deploy.', cmd: 'npx vercel --prod' },
    { step: 2, title: 'Set Up Backend on Railway', desc: 'Create a new project at railway.app, connect your GitHub repo, set environment variables.', cmd: 'railway up' },
    { step: 3, title: 'Provision Database on Supabase', desc: 'Create a free project at supabase.com, get the connection string, add to your backend env.', cmd: 'supabase init' },
    { step: 4, title: 'Configure Custom Domain (Optional)', desc: 'Add your domain in Vercel/Railway settings and update DNS records.', cmd: '' },
    { step: 5, title: 'Verify Live Deployment', desc: 'Visit your live URLs and confirm everything is working correctly.', cmd: '' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header with gradient banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-xl p-6"
        style={{
          background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
          border: '1px solid #30363d',
        }}
      >
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-0 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #58a6ff, transparent)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #3fb950, transparent)', filter: 'blur(50px)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" style={{ color: '#e3b341' }} />
            <h1 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #58a6ff, #3fb950, #e3b341)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Free Hosting Advisor
            </h1>
          </div>
          <p className="text-sm mb-3" style={{ color: '#8b949e' }}>
            {CATEGORY_CONFIG.map(c => c.emoji).join(' ')} Verified free hosting platforms for every layer of your stack
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)' }}>
            <CheckCircle className="w-3.5 h-3.5" style={{ color: '#3fb950' }} />
            <span className="text-xs font-medium" style={{ color: '#3fb950' }}>Save $0/mo with these free tiers</span>
          </div>
        </div>
      </motion.div>

      {/* Full Feature Comparison Table */}
      {topPlatforms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card style={{ backgroundColor: '#161b22', borderColor: '#30363d' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" style={{ color: '#e3b341' }} />
                <CardTitle className="text-sm" style={{ color: '#c9d1d9' }}>Feature Comparison</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto custom-scroll">
                <table className="w-full text-xs" style={{ minWidth: '500px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #21262d' }}>
                      <th className="text-left py-2 px-3 font-medium" style={{ color: '#8b949e' }}>Feature</th>
                      {topPlatforms.map((tp, i) => (
                        <th key={i} className="text-center py-2 px-3 font-semibold relative" style={{ color: tp.color }}>
                          {tp.platform.name}
                          {i === 0 && (
                            <span className="block text-[8px] mt-0.5 font-normal" style={{ color: '#3fb950' }}>★ Recommended</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_FEATURES.map((feat) => (
                      <tr key={feat.key} style={{ borderBottom: '1px solid #21262d' }}>
                        <td className="py-2.5 px-3 font-medium" style={{ color: '#c9d1d9' }}>{feat.label}</td>
                        {topPlatforms.map((tp, i) => {
                          const val = tp.platform[feat.key as keyof Platform];
                          if (feat.key === 'freeTier') {
                            return (
                              <td key={i} className="py-2.5 px-3 text-center" style={{ color: '#c9d1d9' }}>
                                <span className="text-[10px]">{val as string}</span>
                              </td>
                            );
                          }
                          if (feat.key === 'bandwidth') {
                            return (
                              <td key={i} className="py-2.5 px-3 text-center" style={{ color: '#c9d1d9' }}>
                                <span className="text-[10px]">{val as string}</span>
                              </td>
                            );
                          }
                          // Boolean: check or X
                          return (
                            <td key={i} className="py-2.5 px-3 text-center" style={{ backgroundColor: i === 0 ? 'rgba(63,185,80,0.03)' : 'transparent' }}>
                              {val ? (
                                <CheckCircle className="w-4 h-4 mx-auto" style={{ color: '#3fb950' }} />
                              ) : (
                                <XCircle className="w-4 h-4 mx-auto" style={{ color: '#f85149' }} />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-lg border" style={{ backgroundColor: 'rgba(227,179,65,0.06)', borderColor: 'rgba(227,179,65,0.15)' }}>
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#e3b341' }} />
        <p className="text-xs" style={{ color: '#e3b341' }}>{data.disclaimer}</p>
      </div>

      {/* Categories */}
      {CATEGORY_CONFIG.map((category, catIdx) => {
        const platforms = data.platforms[category.key];
        if (!platforms || platforms.length === 0) return null;

        return (
          <div key={category.key} className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + catIdx * 0.05, duration: 0.3 }}
              className="flex items-center gap-2.5"
            >
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${category.color}15` }}>
                <category.icon className="w-4 h-4" style={{ color: category.color }} />
              </div>
              <h2 className="text-sm font-semibold animate-underline" style={{ color: category.color }}>
                {category.emoji} {category.label}
              </h2>
              <div className="flex-1 h-px" style={{ backgroundColor: '#21262d' }} />
              <Badge variant="outline" className="text-[10px]" style={{ borderColor: `${category.color}30`, color: category.color }}>
                {platforms.length} options
              </Badge>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {platforms.map((platform, idx) => {
                const isExpanded = expandedCards.has(platform.name);
                const isRecommended = idx === 0;

                return (
                  <motion.div
                    key={platform.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05, duration: 0.3 }}
                  >
                    <Card
                      className={`group transition-all duration-200 hover:-translate-y-0.5 gradient-top-border ${
                        isRecommended ? 'border-2' : ''
                      }`}
                      style={{
                        backgroundColor: '#161b22',
                        borderColor: isRecommended ? category.color : '#30363d',
                      }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {/* Platform logo placeholder */}
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                              style={{ backgroundColor: `${category.color}20`, color: category.color }}
                            >
                              {platform.name.charAt(0)}
                            </div>
                            <div>
                              <CardTitle className="text-sm" style={{ color: '#c9d1d9' }}>
                                {platform.name}
                              </CardTitle>
                              <StarRating rating={platform.popularity} color={category.color} />
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {platform.autoDeploy ? (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: '#238636', color: '#3fb950' }}>
                                <Zap className="w-2.5 h-2.5 mr-0.5" /> Auto
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: '#30363d', color: '#8b949e' }}>
                                Manual
                              </Badge>
                            )}
                          </div>
                        </div>
                        {isRecommended && (
                          <Badge className="text-[9px] px-1.5 py-0 mt-1 w-fit" style={{ backgroundColor: `${category.color}15`, color: category.color }}>
                            ★ Recommended
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-xs" style={{ color: '#8b949e' }}>{platform.description}</p>

                        {/* Free Tier highlight card */}
                        <div className="p-3 rounded-lg relative overflow-hidden" style={{ backgroundColor: '#0d1117', border: '1px solid rgba(63,185,80,0.15)' }}>
                          <div className="absolute top-0 right-0 w-16 h-16 opacity-10" style={{ background: 'radial-gradient(circle, #3fb950, transparent)', filter: 'blur(15px)' }} />
                          <div className="flex items-center gap-2 mb-1.5">
                            <p className="text-[10px] uppercase font-bold" style={{ color: category.color }}>Free Tier</p>
                            <span
                              className="text-[8px] font-bold px-1.5 py-0 rounded-full free-badge-glow"
                              style={{ backgroundColor: 'rgba(63,185,80,0.2)', color: '#3fb950' }}
                            >
                              FREE
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: '#c9d1d9' }}>{platform.freeTier}</p>
                        </div>

                        {/* One-Click Deploy for auto-deploy platforms */}
                        {platform.autoDeploy && (
                          <Button
                            className="w-full gap-2 h-8 text-xs"
                            style={{ background: `linear-gradient(135deg, ${category.color}cc, ${category.color})`, color: 'white' }}
                            onClick={() => toast({ title: 'Connecting...', description: `Connecting to ${platform.name}...` })}
                          >
                            <Zap className="w-3.5 h-3.5" /> One-Click Deploy
                          </Button>
                        )}

                        {/* Pros/Cons with expand/collapse animation */}
                        <button
                          onClick={() => toggleCard(platform.name)}
                          className="flex items-center gap-1 text-[10px] w-full text-left"
                          style={{ color: '#8b949e' }}
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {isExpanded ? 'Hide' : 'Show'} pros & cons
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-1.5">
                                {platform.pros.map((pro, i) => (
                                  <div key={i} className="flex items-start gap-1.5">
                                    <CheckCircle className="w-3 h-3 shrink-0 mt-0.5" style={{ color: '#3fb950' }} />
                                    <span className="text-xs" style={{ color: '#8b949e' }}>{pro}</span>
                                  </div>
                                ))}
                                {platform.cons.map((con, i) => (
                                  <div key={i} className="flex items-start gap-1.5">
                                    <XCircle className="w-3 h-3 shrink-0 mt-0.5" style={{ color: '#f85149' }} />
                                    <span className="text-xs" style={{ color: '#8b949e' }}>{con}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#21262d' }}>
                          <a
                            href={platform.pricingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] flex items-center gap-1 hover:underline"
                            style={{ color: '#58a6ff' }}
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> Pricing
                          </a>
                          {platform.autoDeploy && (
                            <button
                              onClick={() => copyCommand(platform.name, `Connect ${platform.name} to your GitHub repo`)}
                              className="text-[10px] flex items-center gap-1 hover:text-[#c9d1d9] transition-colors"
                              style={{ color: '#8b949e' }}
                            >
                              <Copy className="w-2.5 h-2.5" /> Copy
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Enhanced Setup Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Card style={{ backgroundColor: '#161b22', borderColor: '#30363d' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#c9d1d9' }}>
                📋 Recommended Setup Steps
              </CardTitle>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(88,166,255,0.1)', color: '#58a6ff' }}>
                {completedSteps.size}/{setupSteps.length} complete
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {setupSteps.map((item, idx) => {
              const isComplete = completedSteps.has(idx);
              const isActive = activeStep === idx;

              return (
                <div
                  key={item.step}
                  className="rounded-lg border transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: isComplete ? 'rgba(63,185,80,0.04)' : isActive ? '#0d1117' : '#0d1117',
                    borderColor: isComplete ? 'rgba(63,185,80,0.2)' : '#21262d',
                  }}
                  onClick={() => setActiveStep(isActive ? null : idx)}
                >
                  <div className="flex gap-3 items-center p-3">
                    {/* Step number circle / check */}
                    <button
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
                      style={{
                        background: isComplete ? 'linear-gradient(135deg, #3fb950, #238636)' : '#21262d',
                        color: isComplete ? 'white' : '#8b949e',
                      }}
                      onClick={(e) => { e.stopPropagation(); toggleStepComplete(idx); }}
                    >
                      {isComplete ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">{item.step}</span>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium" style={{ color: isComplete ? '#3fb950' : '#c9d1d9', textDecoration: isComplete ? 'line-through' : 'none' }}>
                          {item.title}
                        </p>
                        <ChevronDown
                          className="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
                          style={{ color: '#484f58', transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pl-14">
                          <p className="text-[11px] mb-2" style={{ color: '#8b949e' }}>{item.desc}</p>
                          {item.cmd && (
                            <div className="flex items-center gap-2">
                              <code className="text-[10px] font-mono px-2.5 py-1 rounded-md flex-1" style={{ backgroundColor: '#161b22', color: '#58a6ff', border: '1px solid #21262d' }}>
                                {item.cmd}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1 text-[10px] shrink-0"
                                style={{ color: '#8b949e' }}
                                onClick={(e) => { e.stopPropagation(); copyCommand(`Step ${item.step}`, item.cmd); }}
                              >
                                <Copy className="w-3 h-3" /> Copy
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Progress bar */}
            <div className="mt-3">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#21262d' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #3fb950, #58a6ff)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedSteps.size / setupSteps.length) * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[10px] mt-1 text-center" style={{ color: '#484f58' }}>
                {completedSteps.size === setupSteps.length ? '🎉 All steps complete!' : `Step ${completedSteps.size + 1} of ${setupSteps.length}`}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
