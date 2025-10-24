import { cva, type VariantProps } from 'class-variance-authority';

export const categoryTabStyles = cva(
    [
        'tw-inline-flex',
        'tw-items-center',
        'tw-justify-center',
        'tw-text-center',
        'tw-rounded-[5px]',
        'tw-font-medium',
        'tw-text-[14px]',
        'tw-transition',
        // spacing
        'tw-px-4',
        'tw-py-2',
        // mobile first: tabs side-by-side and fill equally
        'tw-flex-1',
        'md:tw-flex-none'
    ].join(' '),
    {
        variants: {
            active: {
                true: [
                    'tw-bg-primary',
                    'tw-text-white',
                    'hover:tw-bg-primary-600'
                ].join(' '),
                false: [
                    'tw-bg-[#e8eeff]',
                    'tw-text-[#2a3a84]',
                    'hover:tw-bg-primary-600'
                ].join(' ')
            }
        },
        defaultVariants: {
            active: false
        }
    }
);

export type CategoryTabStyleProps = VariantProps<typeof categoryTabStyles>;


