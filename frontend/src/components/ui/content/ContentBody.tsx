import React from 'react'

interface ContentBodyProps {
    children?: React.ReactNode
    className?: string
}

export const ContentBody = ({ children, className = "" }: ContentBodyProps) => {
    return (
        <div className={`shadow-md border-2-gray-500 px-4 rounded-md overflow-hidden bg-white ${className}`}>
            {children}
        </div>
    )
}

export default ContentBody
