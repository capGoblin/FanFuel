'use client';

import { motion } from 'framer-motion';
import { Check, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  isCompleted: boolean;
  isCurrent: boolean;
  reward: string;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export default function MilestoneTimeline({ 
  milestones, 
  orientation = 'vertical',
  className 
}: MilestoneTimelineProps) {
  return (
    <div className={cn(
      'relative',
      orientation === 'horizontal' ? 'flex items-center space-x-8 overflow-x-auto pb-4' : 'space-y-8',
      className
    )}>
      {orientation === 'vertical' && (
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/20 via-pink-500/20 to-cyan-500/20" />
      )}
      
      {milestones.map((milestone, index) => (
        <motion.div
          key={milestone.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            'relative',
            orientation === 'horizontal' ? 'flex-shrink-0 w-80' : 'flex items-start space-x-4'
          )}
        >
          {/* Timeline Node */}
          <div className={cn(
            'relative z-10 flex items-center justify-center rounded-full border-4 transition-all duration-300',
            orientation === 'horizontal' ? 'mx-auto mb-4' : 'flex-shrink-0',
            milestone.isCompleted 
              ? 'w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 shadow-lg shadow-green-500/25'
              : milestone.isCurrent
              ? 'w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 shadow-lg shadow-purple-500/25 animate-pulse'
              : 'w-10 h-10 bg-gray-800 border-gray-600'
          )}>
            {milestone.isCompleted ? (
              <Check className="w-5 h-5 text-white" />
            ) : milestone.isCurrent ? (
              <Clock className="w-5 h-5 text-white" />
            ) : (
              <Lock className="w-4 h-4 text-gray-400" />
            )}
          </div>

          {/* Content */}
          <div className={cn(
            'flex-1',
            orientation === 'horizontal' ? 'text-center' : ''
          )}>
            <div className={cn(
              'rounded-xl border backdrop-blur-sm transition-all duration-300 p-6',
              milestone.isCompleted
                ? 'bg-green-500/5 border-green-500/20 shadow-lg shadow-green-500/5'
                : milestone.isCurrent
                ? 'bg-purple-500/10 border-purple-500/30 shadow-lg shadow-purple-500/10'
                : 'bg-gray-900/50 border-gray-700/50'
            )}>
              <h3 className={cn(
                'font-semibold mb-2',
                milestone.isCompleted ? 'text-green-400' : milestone.isCurrent ? 'text-purple-400' : 'text-gray-400'
              )}>
                {milestone.title}
              </h3>
              
              <p className="text-sm text-gray-300 mb-4">
                {milestone.description}
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-medium">
                    {milestone.currentAmount} / {milestone.targetAmount} FLOW
                  </span>
                </div>
                
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((milestone.currentAmount / milestone.targetAmount) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className={cn(
                      'h-full rounded-full',
                      milestone.isCompleted
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : milestone.isCurrent
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-gradient-to-r from-gray-600 to-gray-500'
                    )}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Reward</span>
                  <span className="text-xs font-medium text-cyan-400">{milestone.reward}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}