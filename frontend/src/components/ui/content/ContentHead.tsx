import React from 'react'

interface ContentHeadProps {
    title: string
    subTitle?: string
    children?: React.ReactNode
    flex?: boolean
    justify?: string
    mt?: string
    className?: string
}

export const ContentHead = ({
    children,
    flex = true,
    justify = 'between',
    mt = '0',
    className = '',
    title,
    subTitle,
}: ContentHeadProps) => {
    return (
        <div
            className={`${flex ? 'flex' : ''
                } flex-col sm:flex-row items-start sm:items-end justify-between sm:justify-${justify} gap-4 mb-6 mt-${mt} ${className}`}
        >
            <div>
                <h1 className="text-2xl text-slate-600 font-medium mb-2">{title}</h1>
                {subTitle && <span className="text-lg text-slate-500">{subTitle}</span>}
            </div>
            <div className="flex space-x-4">{children}</div>
        </div>
    )
}
