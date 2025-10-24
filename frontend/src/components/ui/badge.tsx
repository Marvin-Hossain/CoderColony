import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeStyles = cva(
    [
        // Keep original class for parity with existing CSS
        'card-badge',
        // Tailwind utilities matching .card-badge
        'tw-font-semibold tw-text-[#2a3a84] tw-bg-[rgba(77,107,254,0.1)]',
        'tw-py-[6px] tw-px-[12px] tw-rounded-[20px] tw-min-w-[40px] tw-text-center tw-inline-block',
    ].join(' '),
    {
        variants: {
            tone: {
                info: '',
                neutral: '',
                success: '',
                warning: '',
                danger: '',
            },
            size: {
                md: '',
                sm: 'tw-text-sm tw-py-[4px] tw-px-[10px]',
            },
        },
        defaultVariants: {
            tone: 'info',
            size: 'md',
        },
    }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeStyles> {}

export const Badge: React.FC<BadgeProps> = ({ className, tone, size, ...props }) => {
    return <span className={cn(badgeStyles({ tone, size }), className)} {...props} />;
};


