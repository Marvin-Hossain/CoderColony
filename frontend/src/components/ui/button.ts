import { cva, type VariantProps } from 'class-variance-authority';

export const buttonStyles = cva(
    'tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-font-medium tw-transition tw-rounded-md focus-visible:tw-outline-2 focus-visible:tw-outline-primary focus-visible:tw-outline-offset-2 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed disabled:tw-transform-none',
    {
        variants: {
            variant: {
                default: 'tw-bg-primary tw-text-white hover:tw-bg-primary-600',
                outline: 'tw-bg-transparent tw-border tw-border-border tw-text-text hover:tw-bg-secondary hover:tw-border-primary',
                ghost: 'tw-bg-transparent tw-text-text hover:tw-bg-secondary',
            },
            size: {
                sm: 'tw-text-sm tw-py-1.5 tw-px-3',
                md: 'tw-text-base tw-py-2.5 tw-px-5',
                lg: 'tw-text-lg tw-py-3 tw-px-8',
            },
        },
        defaultVariants: { variant: 'default', size: 'md' },
    }
);

export type ButtonStyleProps = VariantProps<typeof buttonStyles>;


