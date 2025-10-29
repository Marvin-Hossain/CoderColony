import React from 'react';
// legacy CSS removed after Tailwind/CVA migration
import { cn } from '../lib/cn';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    rightButton?: React.ReactNode;
}

const PageHeader = ({
    title,
    subtitle,
    rightButton
}: PageHeaderProps) => (
    <header
        className={cn(
            'tw-text-center tw-mb-[30px] tw-relative tw-flex tw-flex-col tw-items-center tw-pb-[15px]',
            'md:tw-px-[10px]'
        )}
    >
        <div className="page-header-titles tw-text-center tw-w-full">
            <h1 className="tw-text-[2.2rem] tw-text-[#2a3a84] tw-mb-[5px]">{title}</h1>
            {subtitle && (
                <p className="page-header-subtitle tw-text-[1.1rem] tw-text-[#4a5491]">{subtitle}</p>
            )}
        </div>
        {rightButton && (
            <div
                className={cn(
                    'page-header-right tw-absolute tw-right-[15px] tw-top-0',
                    'md:tw-relative md:tw-right-auto md:tw-top-auto md:tw-mt-[15px] md:tw-w-full md:tw-flex md:tw-justify-center'
                )}
            >
                {rightButton}
            </div>
        )}
    </header>
);

export default PageHeader; 