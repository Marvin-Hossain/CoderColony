import { cva, type VariantProps } from 'class-variance-authority';

export const inputStyles = cva(
    [
        'tw-w-full',
        // white pill input by default
        'tw-rounded-[12px]',
        'tw-border-[1.5px]',
        'tw-text-base',
        'tw-transition',
        'tw-py-3',
        'tw-px-4',
        'tw-bg-white',
        'tw-text-text',
        'placeholder:tw-text-muted',
        'tw-shadow-[0_4px_12px_rgba(17,24,39,0.08)]',
        'focus:tw-outline-none',
        'focus:tw-border-primary',
        'focus:tw-shadow-[0_0_0_3px_rgba(77,107,254,0.18)]'
    ].join(' '),
    {
        variants: {
            size: {
                sm: 'tw-text-sm tw-py-2 tw-px-3',
                md: '',
                lg: 'tw-text-lg tw-py-3.5 tw-px-5'
            },
            invalid: {
                true: 'tw-border-danger focus:tw-shadow-[0_0_0_3px_rgba(197,48,48,0.15)]',
                false: ''
            }
        },
        defaultVariants: { size: 'md', invalid: false }
    }
);

export type InputStyleProps = VariantProps<typeof inputStyles>;


