'use client'
/*
 * 
 * @author: Dennis Chen
 */
import React from "react"

export type InnerHTMLProps = {
    html: string
    tag?: string
    className?: string
    styles?: React.CSSProperties
}

export default function InnerHTML({ tag = 'div', html, styles, className }: InnerHTMLProps) {

    return React.createElement(tag, {
        className,
        styles,
        dangerouslySetInnerHTML: { __html: html },
    })
}