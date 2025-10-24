import { cva, type VariantProps } from 'class-variance-authority';

export const cardStyles = cva(
    [
        // Keep original class for rollback and pseudo-elements
        'card',
        // Tailwind utilities for pixel parity
        'tw-bg-white tw-rounded-[16px] tw-p-[25px] tw-shadow-[0_10px_30px_rgba(77,107,254,0.1)]',
        'tw-border tw-border-[rgba(77,107,254,0.08)]',
        'tw-transition-[transform,box-shadow] tw-duration-[400ms] tw-ease-[cubic-bezier(0.165,0.84,0.44,1)]',
        'tw-relative tw-overflow-hidden',
        // Default hover behavior
        'hover:-tw-translate-y-[5px] hover:tw-shadow-[0_15px_35px_rgba(77,107,254,0.16)]',
    ].join(' '),
    {
        variants: {
            size: {
                sm: 'card-sm tw-p-[15px]',
                md: '',
                lg: 'card-lg tw-p-[30px]',
            },
            accent: {
                // Keep pseudo-element implementations from CSS for now
                left: 'card-accent-left',
                top: 'card-accent-top',
            },
            interactive: {
                true: 'card-interactive hover:-tw-translate-y-[8px] hover:tw-shadow-[0_18px_40px_rgba(77,107,254,0.2)]',
                false: '',
            },
            subtle: {
                true: 'card-subtle hover:-tw-translate-y-[3px] hover:tw-shadow-[0_12px_30px_rgba(77,107,254,0.12)]',
                false: '',
            },
            loading: {
                true: 'card-loading',
                false: '',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    }
);

export type CardStyleProps = VariantProps<typeof cardStyles>;


