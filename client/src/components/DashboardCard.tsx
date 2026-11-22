import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  id?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  action,
  children,
  className = '',
  footer,
  id
}) => {
  return (
    <section
      id={id}
      aria-label={title}
      className={`card-premium p-5 sm:p-6 flex flex-col justify-between ${className}`}
    >
      <div>
        {(title || Icon || badge || action) && (
          <div className="flex items-start justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              {Icon && (
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
              )}
              <div>
                {title && (
                  <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100 leading-snug">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans leading-normal">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {badge}
              {action}
            </div>
          </div>
        )}

        <div>{children}</div>
      </div>

      {footer && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          {footer}
        </div>
      )}
    </section>
  );
};
