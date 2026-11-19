import { cn } from '@/lib/utils';

interface NutriFoodLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function NutriFoodLogo({
  className,
  size = 'md',
  showTagline = false,
}: NutriFoodLogoProps) {
  const iconSizes = {
    sm: 'size-9 rounded-xl',
    md: 'size-11 rounded-xl',
    lg: 'size-12 rounded-2xl',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-[1.75rem]',
  };

  return (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 text-white shadow-[0_6px_20px_-4px_rgba(21,128,61,0.45)] ring-1 ring-emerald-400/30',
          iconSizes[size]
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          className="size-[62%]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21.8 5.2C14.7 5.2 9.4 8.7 7.6 15.1C7.1 16.9 7 18.6 7.4 20.1C9.5 18 12.4 16 16.5 14.3C12.7 16.8 10.1 19.3 8.4 21.8C10.3 22.5 12.6 22.7 14.9 22.1C20.2 20.6 22.8 15.1 22.8 6.4C22.8 5.7 22.4 5.2 21.8 5.2Z"
            fill="currentColor"
          />
          <circle cx="9.2" cy="8.2" r="2.1" fill="currentColor" fillOpacity="0.88" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display font-extrabold tracking-tight',
            textSizes[size]
          )}
        >
          <span className="text-emerald-950">Nutri</span>
          <span className="text-emerald-600">Food</span>
        </span>
        {showTagline && (
          <span className="mt-1 text-[11px] font-medium tracking-wide text-emerald-700/80 uppercase">
            Nutrição Clínica
          </span>
        )}
      </div>
    </div>
  );
}

