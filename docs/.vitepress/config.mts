import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'YunaCelisse',
  description: 'Personal notes, projects and experiments',
  base: '/homepage/',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: 'About', link: '/#about' },
      { text: 'Projects', link: '/#projects' },
      { text: 'Contact', link: '/#contact' },
      { text: 'Blog', link: '/blog/' },
      { text: 'GitHub', link: 'https://github.com/Yuna-Celisse' }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/Yuna-Celisse' }],
    footer: {
      message: 'Build fast, ship useful things.',
      copyright: 'Copyright © 2026 YunaCelisse'
    }
  }
})
