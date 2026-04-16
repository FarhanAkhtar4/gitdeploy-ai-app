'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  User as UserIcon,
  Github,
  Shield,
  ShieldCheck,
  Unplug,
  CheckCircle,
  AlertCircle,
  Mail,
  Calendar,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export function SettingsView() {
  const { user, setUser, githubUser, setGithubUser, isGithubConnected, setIsGithubConnected, setCurrentView } = useAppStore();
  const [githubInfo, setGithubInfo] = useState<{ connected: boolean; tokenHint?: string; scopes?: string; validatedAt?: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/user`, { headers: { 'x-user-id': user.id } })
        .then((res) => res.json())
        .then((data) => {
          if (data.github) {
            setGithubInfo(data.github as typeof githubInfo);
          }
        })
        .catch(console.error);
    }
  }, [user?.id]);

  const handleDisconnect = async () => {
    if (!user) return;
    try {
      await fetch('/api/auth/github', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      setGithubUser(null);
      setIsGithubConnected(false);
      setGithubInfo({ connected: false });
      toast({ title: 'GitHub disconnected', description: 'Your token has been removed.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to disconnect', variant: 'destructive' });
    }
  };

  const handleDeleteAccount = () => {
    toast({ title: 'Account deletion', description: 'This feature is not available in the demo.', variant: 'destructive' });
  };

  const handleDeleteAllData = () => {
    toast({ title: 'Data deletion', description: 'This feature is not available in the demo.', variant: 'destructive' });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
    }),
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-2xl font-bold"
        style={{ color: '#c9d1d9' }}
      >
        Settings
      </motion.h1>

      {/* User Profile */}
      <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
        <Card style={{ backgroundColor: '#161b22', borderColor: '#30363d' }}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#8b949e' }}>
              <UserIcon className="w-4 h-4" /> User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="relative">
                  {/* Gradient avatar border */}
                  <div
                    className="rounded-full p-[2px]"
                    style={{ background: 'linear-gradient(135deg, #58a6ff, #3fb950, #e3b341)' }}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={githubUser?.avatar_url} alt={user.name || user.email} />
                      <AvatarFallback style={{ backgroundColor: '#0d1117', color: '#c9d1d9' }}>
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {/* Online dot */}
                  {isGithubConnected && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2" style={{ backgroundColor: '#3fb950', borderColor: '#161b22' }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium" style={{ color: '#c9d1d9' }}>
                      {user.name || 'User'}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: '#58a6ff',
                        color: '#58a6ff',
                        background: 'linear-gradient(135deg, rgba(88,166,255,0.1), rgba(63,185,80,0.1))',
                      }}
                    >
                      {user.plan}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Mail className="w-3 h-3" style={{ color: '#8b949e' }} />
                    <span className="text-xs" style={{ color: '#8b949e' }}>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3 h-3" style={{ color: '#8b949e' }} />
                    <span className="text-xs" style={{ color: '#8b949e' }}>
                      Joined {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm" style={{ color: '#8b949e' }}>Not logged in</p>
                <Button
                  size="sm"
                  className="mt-2"
                  style={{ backgroundColor: '#238636', color: 'white' }}
                  onClick={() => setCurrentView('onboarding')}
                >
                  Get Started
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* GitHub Connection */}
      <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
        <Card style={{ backgroundColor: '#161b22', borderColor: '#30363d' }}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#8b949e' }}>
              <Github className="w-4 h-4" /> GitHub Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isGithubConnected && githubInfo ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#3fb95015' }}>
                    <CheckCircle className="w-5 h-5" style={{ color: '#3fb950' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#3fb950' }}>Connected</p>
                    <p className="text-xs mt-0.5" style={{ color: '#8b949e' }}>
                      {githubUser?.login && `@${githubUser.login}`}
                      {githubInfo.tokenHint && ` · Token: ${githubInfo.tokenHint}`}
                    </p>
                  </div>
                </div>

                {/* Scopes */}
                {githubInfo.scopes && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium" style={{ color: '#c9d1d9' }}>Token Scopes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {githubInfo.scopes.split(',').map((scope) => (
                        <Badge
                          key={scope}
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: '#238636', color: '#3fb950' }}
                        >
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validated At */}
                {githubInfo.validatedAt && (
                  <p className="text-xs" style={{ color: '#8b949e' }}>
                    <Shield className="w-3 h-3 inline mr-1" />
                    Last validated: {new Date(githubInfo.validatedAt).toLocaleString()}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    style={{ borderColor: '#f85149', color: '#f85149' }}
                    onClick={handleDisconnect}
                  >
                    <Unplug className="w-3.5 h-3.5" /> Disconnect
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    style={{ borderColor: '#30363d', color: '#8b949e' }}
                    onClick={() => setCurrentView('onboarding')}
                  >
                    Reconnect Token
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#f8514915' }}>
                  <AlertCircle className="w-5 h-5" style={{ color: '#f85149' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#f85149' }}>Not Connected</p>
                  <p className="text-xs mt-0.5" style={{ color: '#8b949e' }}>
                    Connect your GitHub token to enable deployments
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-1"
                  style={{ backgroundColor: '#238636', color: 'white' }}
                  onClick={() => setCurrentView('onboarding')}
                >
                  <Github className="w-3.5 h-3.5" /> Connect
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Info */}
      <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
        <Card style={{ backgroundColor: '#161b22', borderColor: '#30363d' }}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#8b949e' }}>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <ShieldCheck className="w-4 h-4" style={{ color: '#3fb950' }} />
              </motion.div>
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              'Tokens are encrypted with AES-256-GCM before storage',
              'Only a masked hint (last 4 chars) is ever shown in the UI',
              'Tokens are never logged, returned in API responses, or stored in cookies',
              'All GitHub API calls are made server-side only',
              'Rate limits are respected and checked before operations',
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#3fb950' }} />
                <span className="text-xs" style={{ color: '#8b949e' }}>{item}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
        <Card style={{ backgroundColor: '#161b22', borderColor: '#f8514950' }}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#f85149' }}>
              <AlertTriangle className="w-4 h-4" /> Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#0d1117', border: '1px solid #f8514920' }}>
              <div>
                <p className="text-xs font-medium" style={{ color: '#c9d1d9' }}>Delete Account</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#8b949e' }}>Permanently delete your account and all associated data</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 shrink-0"
                    style={{ borderColor: '#f85149', color: '#f85149' }}
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent style={{ backgroundColor: '#161b22', borderColor: '#f85149' }}>
                  <AlertDialogHeader>
                    <AlertDialogTitle style={{ color: '#c9d1d9' }}>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription style={{ color: '#8b949e' }}>
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel style={{ color: '#8b949e' }}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      style={{ backgroundColor: '#f85149', color: 'white' }}
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#0d1117', border: '1px solid #f8514920' }}>
              <div>
                <p className="text-xs font-medium" style={{ color: '#c9d1d9' }}>Delete All Data</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#8b949e' }}>Remove all projects, deployments, and files from GitDeploy AI</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 shrink-0"
                    style={{ borderColor: '#f85149', color: '#f85149' }}
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent style={{ backgroundColor: '#161b22', borderColor: '#f85149' }}>
                  <AlertDialogHeader>
                    <AlertDialogTitle style={{ color: '#c9d1d9' }}>Delete All Data</AlertDialogTitle>
                    <AlertDialogDescription style={{ color: '#8b949e' }}>
                      This will remove all projects, deployments, and files from GitDeploy AI. Your GitHub repositories will not be affected.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel style={{ color: '#8b949e' }}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      style={{ backgroundColor: '#f85149', color: 'white' }}
                      onClick={handleDeleteAllData}
                    >
                      Delete All Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
