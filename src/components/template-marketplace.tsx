'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Star,
  Download,
  Globe,
  Server,
  LayoutGrid,
  Smartphone,
  Workflow,
  ArrowUpRight,
  Filter,
  SlidersHorizontal,
  Sparkles,
  Code,
  Box,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── Template Data ─── */
const TEMPLATES = [
  { id: '1', name: 'SaaS Starter', category: 'fullstack', author: 'GitDeploy', stars: 4.8, downloads: 2340, tech: ['Next.js', 'Prisma', 'Stripe'], description: 'Complete SaaS boilerplate with auth, billing, and dashboard' },
  { id: '2', name: 'REST API', category: 'api', author: 'GitDeploy', stars: 4.6, downloads: 1890, tech: ['Express', 'MongoDB', 'JWT'], description: 'Production-ready REST API with authentication and validation' },
  { id: '3', name: 'E-commerce', category: 'fullstack', author: 'Community', stars: 4.5, downloads: 1560, tech: ['Next.js', 'Supabase', 'Stripe'], description: 'Full e-commerce with cart, checkout, and order management' },
  { id: '4', name: 'Blog CMS', category: 'web', author: 'GitDeploy', stars: 4.7, downloads: 1230, tech: ['Next.js', 'MDX', 'Vercel'], description: 'Markdown-powered blog with CMS and SEO optimization' },
  { id: '5', name: 'Real-time Chat', category: 'fullstack', author: 'Community', stars: 4.4, downloads: 980, tech: ['React', 'Socket.io', 'Redis'], description: 'WebSocket chat with rooms, DMs, and file sharing' },
  { id: '6', name: 'Admin Dashboard', category: 'web', author: 'GitDeploy', stars: 4.9, downloads: 3200, tech: ['Next.js', 'Recharts', 'Prisma'], description: 'Analytics dashboard with charts, tables, and export' },
  { id: '7', name: 'CI/CD Pipeline', category: 'devops', author: 'GitDeploy', stars: 4.3, downloads: 760, tech: ['GitHub Actions', 'Docker', 'Terraform'], description: 'Complete CI/CD with staging, production, and rollback' },
  { id: '8', name: 'Mobile App', category: 'mobile', author: 'Community', stars: 4.2, downloads: 650, tech: ['React Native', 'Expo', 'Firebase'], description: 'Cross-platform mobile app with auth and push notifications' },
];

/* ─── Categories ─── */
const CATEGORIES = [
  { id: 'all', label: 'All', icon: Layers, count: TEMPLATES.length },
  { id: 'web', label: 'Web Apps', icon: Globe, count: TEMPLATES.filter(t => t.category === 'web').length },
  { id: 'api', label: 'APIs', icon: Server, count: TEMPLATES.filter(t => t.category === 'api').length },
  { id: 'fullstack', label: 'Full-Stack', icon: LayoutGrid, count: TEMPLATES.filter(t => t.category === 'fullstack').length },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, count: TEMPLATES.filter(t => t.category === 'mobile').length },
  { id: 'devops', label: 'DevOps', icon: Workflow, count: TEMPLATES.filter(t => t.category === 'devops').length },
];

type SortOption = 'popular' | 'recent' | 'rating';

/* ─── Star Rating Display ─── */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className="w-3 h-3"
          style={{
            color: star <= Math.floor(rating) ? '#e3b341' : '#21262d',
            fill: star <= Math.floor(rating) ? '#e3b341' : 'none',
          }}
        />
      ))}
      <span className="text-[10px] font-mono ml-1" style={{ color: '#8b949e' }}>{rating}</span>
    </div>
  );
}

/* ─── Tech Badge ─── */
function TechBadge({ name }: { name: string }) {
  return (
    <span
      className="text-[9px] px-1.5 py-0.5 rounded-full font-mono"
      style={{ backgroundColor: '#58a6ff10', color: '#58a6ff', border: '1px solid #58a6ff20' }}
    >
      {name}
    </span>
  );
}

/* ─── Template Card ─── */
function TemplateCard({
  template,
  onSelect,
  index,
}: {
  template: typeof TEMPLATES[0];
  onSelect: (template: typeof TEMPLATES[0]) => void;
  index: number;
}) {
  const categoryColors: Record<string, string> = {
    web: '#58a6ff',
    api: '#3fb950',
    fullstack: '#a371f7',
    mobile: '#f778ba',
    devops: '#e3b341',
  };
  const color = categoryColors[template.category] || '#58a6ff';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="rounded-xl border transition-all duration-200 hover:-translate-y-1 group overflow-hidden"
      style={{
        backgroundColor: '#0d1117',
        borderColor: '#21262d',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${color}50`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${color}15`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = '#21262d';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Preview thumbnail placeholder */}
      <div
        className="h-28 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color}15, ${color}05, #0d1117)`,
          borderBottom: '1px solid #21262d',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-3 left-3 right-3">
          <div className="flex gap-1.5 mb-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f8514960' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#e3b34160' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3fb95060' }} />
          </div>
          {/* Fake code lines */}
          <div className="space-y-1.5">
            <div className="h-1.5 rounded" style={{ backgroundColor: `${color}20`, width: '70%' }} />
            <div className="h-1.5 rounded" style={{ backgroundColor: `${color}12`, width: '90%' }} />
            <div className="h-1.5 rounded" style={{ backgroundColor: `${color}12`, width: '55%' }} />
            <div className="h-1.5 rounded" style={{ backgroundColor: `${color}20`, width: '80%' }} />
          </div>
        </div>
        {/* Category badge */}
        <span
          className="absolute top-3 right-3 text-[8px] uppercase font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}30` }}
        >
          {template.category}
        </span>
      </div>

      {/* Card content */}
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold" style={{ color: '#c9d1d9' }}>{template.name}</h3>
            <span className="text-[9px]" style={{ color: '#484f58' }}>by {template.author}</span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: '#8b949e' }}>{template.description}</p>
        </div>

        {/* Tech stack badges */}
        <div className="flex flex-wrap gap-1">
          {template.tech.map((t) => (
            <TechBadge key={t} name={t} />
          ))}
        </div>

        {/* Rating + Downloads */}
        <div className="flex items-center justify-between">
          <StarRating rating={template.stars} />
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" style={{ color: '#484f58' }} />
            <span className="text-[10px] font-mono" style={{ color: '#484f58' }}>
              {template.downloads >= 1000 ? `${(template.downloads / 1000).toFixed(1)}k` : template.downloads}
            </span>
          </div>
        </div>

        {/* Use Template button */}
        <Button
          className="w-full gap-1.5 text-[11px] h-8 transition-all duration-200"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            color: 'white',
            boxShadow: `0 0 15px ${color}25`,
          }}
          onClick={() => onSelect(template)}
        >
          <Sparkles className="w-3 h-3" /> Use Template
          <ArrowUpRight className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );
}

export function TemplateMarketplace({ onSelectTemplate }: { onSelectTemplate: (prompt: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let result = TEMPLATES;

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter(t => t.category === activeCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tech.some(tech => tech.toLowerCase().includes(query)) ||
        t.category.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        result = [...result].sort((a, b) => b.downloads - a.downloads);
        break;
      case 'recent':
        // Keep original order as "recent"
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.stars - a.stars);
        break;
    }

    return result;
  }, [searchQuery, activeCategory, sortBy]);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    return TEMPLATES.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.tech.some(tech => tech.toLowerCase().includes(query))
    ).slice(0, 3);
  }, [searchQuery]);

  const handleUseTemplate = (template: typeof TEMPLATES[0]) => {
    const prompt = `Build a ${template.name} project using ${template.tech.join(', ')}. ${template.description}`;
    onSelectTemplate(prompt);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#c9d1d9' }}>Template Marketplace</h2>
          <p className="text-[11px] mt-0.5" style={{ color: '#8b949e' }}>Start with a pre-built template and customize it to your needs</p>
        </div>
        <span
          className="text-[10px] font-medium px-2.5 py-1 rounded-full"
          style={{ backgroundColor: '#58a6ff10', color: '#58a6ff', border: '1px solid #58a6ff20' }}
        >
          {filteredTemplates.length} templates
        </span>
      </div>

      {/* Search Bar with Autocomplete */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#484f58' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates by name, tech stack, or category..."
          className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:border-[#58a6ff] transition-colors"
          style={{ backgroundColor: '#0d1117', borderColor: '#21262d', color: '#c9d1d9' }}
        />
        {/* Autocomplete dropdown */}
        {suggestions.length > 0 && searchQuery.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full mt-1 left-0 right-0 rounded-lg border shadow-xl z-20 overflow-hidden"
            style={{ backgroundColor: '#161b22', borderColor: '#30363d' }}
          >
            {suggestions.map((s) => (
              <button
                key={s.id}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#21262d]"
                onClick={() => {
                  setSearchQuery(s.name);
                }}
              >
                <Box className="w-4 h-4 shrink-0" style={{ color: '#58a6ff' }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: '#c9d1d9' }}>{s.name}</p>
                  <p className="text-[10px]" style={{ color: '#484f58' }}>{s.tech.join(', ')}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Category Filter Tabs + Sort */}
      <div className="flex items-center gap-3 overflow-x-auto custom-scroll pb-1">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full shrink-0 transition-all duration-200"
                style={{
                  backgroundColor: activeCategory === cat.id ? '#58a6ff15' : '#0d1117',
                  color: activeCategory === cat.id ? '#58a6ff' : '#8b949e',
                  border: `1px solid ${activeCategory === cat.id ? '#58a6ff30' : '#21262d'}`,
                }}
                onClick={() => setActiveCategory(cat.id)}
              >
                <Icon className="w-3 h-3" />
                {cat.label}
                <span className="text-[9px] font-mono" style={{ color: '#484f58' }}>({cat.count})</span>
              </button>
            );
          })}
        </div>

        {/* Sort dropdown */}
        <div className="relative shrink-0">
          <button
            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg border transition-colors hover:border-[#58a6ff]"
            style={{ backgroundColor: '#0d1117', borderColor: '#21262d', color: '#8b949e' }}
            onClick={() => setShowSortMenu(!showSortMenu)}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
          </button>
          {showSortMenu && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-1 w-36 rounded-lg border shadow-xl z-20 overflow-hidden"
              style={{ backgroundColor: '#161b22', borderColor: '#30363d' }}
            >
              {(['popular', 'recent', 'rating'] as SortOption[]).map((opt) => (
                <button
                  key={opt}
                  className="w-full text-left px-3 py-2 text-[11px] transition-colors hover:bg-[#21262d]"
                  style={{ color: sortBy === opt ? '#58a6ff' : '#8b949e' }}
                  onClick={() => {
                    setSortBy(opt);
                    setShowSortMenu(false);
                  }}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Template Grid */}
      <AnimatePresence mode="wait">
        {filteredTemplates.length > 0 ? (
          <motion.div
            key={activeCategory + sortBy + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {filteredTemplates.map((template, i) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleUseTemplate}
                index={i}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Code className="w-10 h-10 mx-auto mb-3" style={{ color: '#21262d' }} />
            <p className="text-sm" style={{ color: '#8b949e' }}>No templates found</p>
            <p className="text-[11px] mt-1" style={{ color: '#484f58' }}>Try adjusting your search or filters</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5"
              style={{ borderColor: '#30363d', color: '#58a6ff' }}
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
            >
              <Filter className="w-3 h-3" /> Clear Filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
