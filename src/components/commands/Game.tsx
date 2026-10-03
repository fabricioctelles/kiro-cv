'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { colors } from '@/lib/colors';

// theSVG icons - inline SVGs for dev obstacles
import dockerIcon from '@thesvg/icons/docker';
import gitIcon from '@thesvg/icons/git';
import npmIcon from '@thesvg/icons/npm';
import slackIcon from '@thesvg/icons/slack';
import jiraIcon from '@thesvg/icons/jira';
import kubernetesIcon from '@thesvg/icons/kubernetes';
import sentryIcon from '@thesvg/icons/sentry';
import eslintIcon from '@thesvg/icons/eslint';
import webpackIcon from '@thesvg/icons/webpack';
import zoomIcon from '@thesvg/icons/zoom';
import googleCalendarIcon from '@thesvg/icons/google-calendar';

// ═══════════════════════════════════════════════════════════════════════════
// KIRO RUNNER - Easter Egg Game
// ═══════════════════════════════════════════════════════════════════════════

const GAME_WIDTH = 600;
const GAME_HEIGHT = 200;
const GROUND_Y = 150;
const GHOST_SIZE = 60;
const GHOST_X = 60;
const GRAVITY = 0.8;
const JUMP_FORCE = -14;
const OBSTACLE_SPEED = 6;

type ObstacleType = 
  | 'docker'          // "Works on my machine"
  | 'git_conflict'    // Merge conflict
  | 'npm_audit'       // 99 vulnerabilities found
  | 'slack_ping'      // @channel notification
  | 'jira_ticket'     // URGENT P0 ticket
  | 'k8s_pod'         // CrashLoopBackOff
  | 'sentry_alert'    // 500 errors in production
  | 'eslint_error'    // 847 problems
  | 'webpack_build'   // Building forever...
  | 'zoom_meeting'    // "Quick sync"
  | 'calendar_block'  // Back-to-back meetings
  | 'null_pointer'    // The classic
  | 'legacy_code'     // Ancient spaghetti
  | 'deadline';       // EOD!!!

interface Obstacle {
  id: number;
  x: number;
  width: number;
  height: number;
  type: ObstacleType;
}

interface GameState {
  ghostY: number;
  ghostVelocity: number;
  isJumping: boolean;
  obstacles: Obstacle[];
  score: number;
  highScore: number;
  gameOver: boolean;
  started: boolean;
  pose: number;
}

// Ghost pose mapping
const POSE_RUN_1 = 1;
const POSE_RUN_2 = 2;
const POSE_JUMP = 5;
const POSE_DEAD = 8;

function KiroGhost({ pose, size }: { pose: number; size: number }) {
  return (
    <img
      src={`/ghost/pose-${pose}.svg`}
      alt="Kiro Ghost"
      width={size}
      height={size}
      style={{ 
        filter: 'invert(1)',
        transform: 'scaleX(-1)',
      }}
    />
  );
}

// Obstacle configurations with theSVG icons and custom visuals
const OBSTACLE_CONFIG: Record<ObstacleType, { 
  svg?: string; 
  label: string; 
  sublabel?: string;
  bgColor: string;
  borderColor: string;
  labelColor: string;
  width: number; 
  height: number;
  iconSize: number;
  style?: 'icon' | 'text' | 'mixed';
}> = {
  docker: { 
    svg: dockerIcon.svg, 
    label: '"works on', 
    sublabel: 'my machine"',
    bgColor: '#1d63ed15', 
    borderColor: '#1d63ed',
    labelColor: '#60a5fa',
    width: 90, 
    height: 45,
    iconSize: 24,
    style: 'mixed',
  },
  git_conflict: { 
    svg: gitIcon.svg, 
    label: 'CONFLICT',
    sublabel: '<<<<<<',
    bgColor: '#f4721215', 
    borderColor: '#f47212',
    labelColor: '#fb923c',
    width: 70, 
    height: 42,
    iconSize: 20,
    style: 'mixed',
  },
  npm_audit: { 
    svg: npmIcon.svg, 
    label: '99 vulns',
    bgColor: '#cb383815', 
    borderColor: '#cb3838',
    labelColor: '#ef4444',
    width: 75, 
    height: 38,
    iconSize: 22,
    style: 'mixed',
  },
  slack_ping: { 
    svg: slackIcon.svg, 
    label: '@channel',
    sublabel: '!!',
    bgColor: '#4a154b15', 
    borderColor: '#e01e5a',
    labelColor: '#f472b6',
    width: 80, 
    height: 40,
    iconSize: 22,
    style: 'mixed',
  },
  jira_ticket: { 
    svg: jiraIcon.svg, 
    label: 'P0',
    sublabel: 'URGENT',
    bgColor: '#0052cc15', 
    borderColor: '#0052cc',
    labelColor: '#60a5fa',
    width: 65, 
    height: 42,
    iconSize: 20,
    style: 'mixed',
  },
  k8s_pod: { 
    svg: kubernetesIcon.svg, 
    label: 'CrashLoop',
    sublabel: 'BackOff',
    bgColor: '#326ce515', 
    borderColor: '#326ce5',
    labelColor: '#60a5fa',
    width: 80, 
    height: 45,
    iconSize: 24,
    style: 'mixed',
  },
  sentry_alert: { 
    svg: sentryIcon.svg, 
    label: '500',
    sublabel: 'in PROD',
    bgColor: '#36234115', 
    borderColor: '#8b5cf6',
    labelColor: '#a78bfa',
    width: 70, 
    height: 42,
    iconSize: 22,
    style: 'mixed',
  },
  eslint_error: { 
    svg: eslintIcon.svg, 
    label: '847',
    sublabel: 'problems',
    bgColor: '#4b32c315', 
    borderColor: '#4b32c3',
    labelColor: '#a78bfa',
    width: 75, 
    height: 40,
    iconSize: 22,
    style: 'mixed',
  },
  webpack_build: { 
    svg: webpackIcon.svg, 
    label: 'Building...',
    sublabel: '∞',
    bgColor: '#8dd6f915', 
    borderColor: '#8dd6f9',
    labelColor: '#7dd3fc',
    width: 85, 
    height: 42,
    iconSize: 24,
    style: 'mixed',
  },
  zoom_meeting: { 
    svg: zoomIcon.svg, 
    label: '"quick',
    sublabel: 'sync"',
    bgColor: '#0b5cff15', 
    borderColor: '#0b5cff',
    labelColor: '#60a5fa',
    width: 70, 
    height: 40,
    iconSize: 22,
    style: 'mixed',
  },
  calendar_block: { 
    svg: googleCalendarIcon.svg, 
    label: '9-5',
    sublabel: 'BLOCKED',
    bgColor: '#4285f415', 
    borderColor: '#ea4335',
    labelColor: '#ef4444',
    width: 75, 
    height: 42,
    iconSize: 22,
    style: 'mixed',
  },
  null_pointer: { 
    label: 'null',
    sublabel: 'undefined',
    bgColor: '#ef444415', 
    borderColor: '#ef4444',
    labelColor: '#ef4444',
    width: 70, 
    height: 38,
    iconSize: 0,
    style: 'text',
  },
  legacy_code: { 
    label: '// TODO:',
    sublabel: 'fix later',
    bgColor: '#6b677715', 
    borderColor: '#6b6777',
    labelColor: '#8b879a',
    width: 80, 
    height: 40,
    iconSize: 0,
    style: 'text',
  },
  deadline: { 
    label: 'EOD',
    sublabel: 'TODAY!!!',
    bgColor: '#fbbf2415', 
    borderColor: '#fbbf24',
    labelColor: '#fbbf24',
    width: 70, 
    height: 42,
    iconSize: 0,
    style: 'text',
  },
};

function ObstacleBlock({ obstacle }: { obstacle: Obstacle }) {
  const config = OBSTACLE_CONFIG[obstacle.type];
  
  return (
    <div
      style={{
        position: 'absolute',
        left: obstacle.x,
        bottom: GAME_HEIGHT - GROUND_Y,
        width: obstacle.width,
        height: obstacle.height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        fontFamily: 'monospace',
        backgroundColor: config.bgColor,
        border: `2px solid ${config.borderColor}`,
        borderRadius: 6,
        padding: '4px 8px',
        boxShadow: `0 0 10px ${config.borderColor}40`,
      }}
    >
      {config.svg && (
        <div 
          style={{ 
            width: config.iconSize, 
            height: config.iconSize,
            minWidth: config.iconSize,
            minHeight: config.iconSize,
            maxWidth: config.iconSize,
            maxHeight: config.iconSize,
            marginBottom: 2,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
            }}
            dangerouslySetInnerHTML={{ 
              __html: config.svg.replace(/<svg/, `<svg style="width:100%;height:100%;max-width:${config.iconSize}px;max-height:${config.iconSize}px;"`) 
            }}
          />
        </div>
      )}
      <div style={{ 
        fontSize: '9px', 
        fontWeight: 'bold',
        color: config.labelColor,
        lineHeight: 1.1,
        textAlign: 'center',
      }}>
        {config.label}
      </div>
      {config.sublabel && (
        <div style={{ 
          fontSize: '7px', 
          color: config.labelColor,
          opacity: 0.8,
          lineHeight: 1,
        }}>
          {config.sublabel}
        </div>
      )}
    </div>
  );
}

export function Game() {
  const [state, setState] = useState<GameState>({
    ghostY: GROUND_Y,
    ghostVelocity: 0,
    isJumping: false,
    obstacles: [],
    score: 0,
    highScore: typeof window !== 'undefined' 
      ? parseInt(localStorage.getItem('kiro-runner-high') || '0') 
      : 0,
    gameOver: false,
    started: false,
    pose: POSE_RUN_1,
  });

  const gameLoopRef = useRef<number | null>(null);
  const spawnRef = useRef<NodeJS.Timeout | null>(null);
  const frameRef = useRef(0);
  const obstacleIdRef = useRef(0);

  const jump = useCallback(() => {
    if (!state.isJumping && !state.gameOver) {
      setState(s => ({
        ...s,
        ghostVelocity: JUMP_FORCE,
        isJumping: true,
        pose: POSE_JUMP,
      }));
    }
  }, [state.isJumping, state.gameOver]);

  const startGame = useCallback(() => {
    setState(s => ({
      ...s,
      started: true,
      gameOver: false,
      score: 0,
      obstacles: [],
      ghostY: GROUND_Y,
      ghostVelocity: 0,
      isJumping: false,
      pose: POSE_RUN_1,
    }));
    obstacleIdRef.current = 0;
  }, []);

  const restart = useCallback(() => {
    startGame();
  }, [startGame]);

  // Spawn obstacles
  useEffect(() => {
    if (!state.started || state.gameOver) return;

    const spawn = () => {
      const types: ObstacleType[] = [
        'docker', 'git_conflict', 'npm_audit', 'slack_ping',
        'jira_ticket', 'k8s_pod', 'sentry_alert', 'eslint_error',
        'webpack_build', 'zoom_meeting', 'calendar_block',
        'null_pointer', 'legacy_code', 'deadline'
      ];
      const type = types[Math.floor(Math.random() * types.length)];
      const config = OBSTACLE_CONFIG[type];

      setState(s => ({
        ...s,
        obstacles: [...s.obstacles, {
          id: obstacleIdRef.current++,
          x: GAME_WIDTH,
          width: config.width,
          height: config.height,
          type,
        }],
      }));
    };

    // Random interval between spawns (1.5s to 3s)
    const scheduleNext = () => {
      const baseInterval = Math.max(1500 - state.score * 5, 800);
      const randomDelay = baseInterval + Math.random() * 1500;
      spawnRef.current = setTimeout(() => {
        spawn();
        scheduleNext();
      }, randomDelay);
    };

    // First obstacle after a short delay
    spawnRef.current = setTimeout(() => {
      spawn();
      scheduleNext();
    }, 1000);

    return () => {
      if (spawnRef.current) clearTimeout(spawnRef.current);
    };
  }, [state.started, state.gameOver]);

  // Game loop
  useEffect(() => {
    if (!state.started || state.gameOver) return;

    const gameLoop = () => {
      frameRef.current++;

      setState(s => {
        let newY = s.ghostY;
        let newVelocity = s.ghostVelocity;
        let isJumping = s.isJumping;
        let pose = s.pose;

        if (s.isJumping) {
          newVelocity += GRAVITY;
          newY += newVelocity;

          if (newY >= GROUND_Y) {
            newY = GROUND_Y;
            newVelocity = 0;
            isJumping = false;
          }
        }

        if (!isJumping) {
          pose = frameRef.current % 20 < 10 ? POSE_RUN_1 : POSE_RUN_2;
        }

        const obstacles = s.obstacles
          .map(o => ({ ...o, x: o.x - OBSTACLE_SPEED }))
          .filter(o => o.x > -100);

        const ghostBox = {
          left: GHOST_X + 10,
          right: GHOST_X + GHOST_SIZE - 10,
          top: newY - GHOST_SIZE + 10,
          bottom: newY - 5,
        };

        let gameOver = false;
        for (const obs of obstacles) {
          const obsBox = {
            left: obs.x + 5,
            right: obs.x + obs.width - 5,
            top: GROUND_Y - obs.height,
            bottom: GROUND_Y,
          };

          if (
            ghostBox.right > obsBox.left &&
            ghostBox.left < obsBox.right &&
            ghostBox.bottom > obsBox.top &&
            ghostBox.top < obsBox.bottom
          ) {
            gameOver = true;
            break;
          }
        }

        const score = s.score + 1;
        const highScore = Math.max(score, s.highScore);

        if (gameOver) {
          localStorage.setItem('kiro-runner-high', String(highScore));
        }

        return {
          ...s,
          ghostY: newY,
          ghostVelocity: newVelocity,
          isJumping,
          obstacles,
          score,
          highScore,
          gameOver,
          pose: gameOver ? POSE_DEAD : pose,
        };
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [state.started, state.gameOver]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!state.started) {
          startGame();
        } else if (state.gameOver) {
          restart();
        } else {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.started, state.gameOver, jump, startGame, restart]);

  return (
    <div className="text-xs sm:text-sm py-2">
      {/* Header */}
      <div className="flex justify-between mb-2 px-1" style={{ maxWidth: GAME_WIDTH }}>
        <span style={{ color: colors.brand }}>KIRO RUNNER</span>
        <span style={{ color: colors.muted }}>
          Score: <span style={{ color: colors.text }}>{Math.floor(state.score / 10)}</span>
          {' · '}
          Best: <span style={{ color: colors.success }}>{Math.floor(state.highScore / 10)}</span>
        </span>
      </div>

      {/* Game Area */}
      <div
        style={{
          position: 'relative',
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          backgroundColor: colors.bg,
          border: `1px solid ${colors.surface}`,
          borderRadius: 4,
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={() => {
          if (!state.started) startGame();
          else if (state.gameOver) restart();
          else jump();
        }}
      >
        {/* Ground line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: GROUND_Y,
            height: 1,
            backgroundColor: colors.surface,
          }}
        />

        {/* Ground pattern */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: GROUND_Y + 5,
            color: colors.surface,
            fontSize: '10px',
            letterSpacing: '2px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {'═'.repeat(100)}
        </div>

        {/* Ghost */}
        <div
          style={{
            position: 'absolute',
            left: GHOST_X,
            bottom: GAME_HEIGHT - state.ghostY,
            transition: state.isJumping ? 'none' : 'transform 0.1s',
          }}
        >
          <KiroGhost pose={state.pose} size={GHOST_SIZE} />
        </div>

        {/* Obstacles */}
        {state.obstacles.map(obs => (
          <ObstacleBlock key={obs.id} obstacle={obs} />
        ))}

        {/* Start Screen */}
        {!state.started && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(25, 22, 29, 0.95)',
            }}
          >
            <KiroGhost pose={1} size={80} />
            <div style={{ color: colors.text, marginTop: 16, fontSize: 14 }}>
              KIRO RUNNER
            </div>
            <div style={{ color: colors.muted, marginTop: 4, fontSize: 11 }}>
              Dodge the daily dev nightmares
            </div>
            <div style={{ color: colors.secondary, marginTop: 12, fontSize: 12 }}>
              Press SPACE or click to start
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {state.gameOver && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(25, 22, 29, 0.95)',
            }}
          >
            <KiroGhost pose={POSE_DEAD} size={80} />
            <div style={{ color: colors.error, marginTop: 16, fontSize: 14 }}>
              GAME OVER
            </div>
            <div style={{ color: colors.text, marginTop: 8 }}>
              Score: {Math.floor(state.score / 10)}
            </div>
            {state.score >= state.highScore && state.score > 0 && (
              <div style={{ color: colors.success, marginTop: 4, fontSize: 12 }}>
                ★ NEW HIGH SCORE! ★
              </div>
            )}
            <div style={{ color: colors.muted, marginTop: 12, fontSize: 12 }}>
              Press SPACE or click to restart
            </div>
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div className="mt-2 px-1" style={{ color: colors.muted, maxWidth: GAME_WIDTH }}>
        <span style={{ color: colors.secondary }}>[SPACE/↑]</span> Jump
        {' · '}
        <span style={{ color: colors.secondary }}>[ESC]</span> Exit
      </div>
    </div>
  );
}
