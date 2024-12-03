'use client'

import React from 'react'
import Head from 'next/head'

interface PageTitleProps {
  title: string
  children?: React.ReactNode
}

export default function PageTitle({ title, children }: PageTitleProps) {
  React.useEffect(() => {
    document.title = `${title} - 医院管理系统`
    
    // 设置网站图标
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
    if (link) {
      link.href = '/hms.svg'
    } else {
      const newLink = document.createElement('link')
      newLink.rel = 'icon'
      newLink.href = '/hms.svg'
      document.head.appendChild(newLink)
    }
  }, [title])

  return children || null
} 