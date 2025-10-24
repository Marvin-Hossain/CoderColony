import { cva, type VariantProps } from 'class-variance-authority';

export const progressTrackStyles = cva(
    'tw-w-full tw-rounded-full tw-bg-muted/30',
    {
        variants: {
            size: {
                xs: 'tw-h-1.5',
                sm: 'tw-h-2',
                md: 'tw-h-3',
                lg: 'tw-h-4',
            }
        },
        defaultVariants: { size: 'sm' }
    }
);

export const progressFillStyles = cva(
    'tw-h-full tw-rounded-full tw-bg-primary',
    {
        variants: {
            striped: { true: 'tw-bg-[repeating-linear-gradient(45deg,_#4d6bfe,_#4d6bfe_10px,_#3b54d0_10px,_#3b54d0_20px)]', false: '' }
        },
        defaultVariants: { striped: false }
    }
);

export type ProgressTrackProps = VariantProps<typeof progressTrackStyles>;
export type ProgressFillProps = VariantProps<typeof progressFillStyles>;


