import React from 'react'

interface ContentProps {
    children?: React.ReactNode
    className?: ""
}

export const Content = ({ children, className }: ContentProps) => {
    return (
        <div className={`${className}`}>
            {children}
        </div>
    )
}

export default Content
