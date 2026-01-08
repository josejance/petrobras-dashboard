import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface DashboardSectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const DashboardSection = forwardRef<HTMLElement, DashboardSectionProps>(
  ({ id, title, description, children, className }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn('scroll-mt-20', className)}
      >
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </section>
    );
  }
);

DashboardSection.displayName = 'DashboardSection';
