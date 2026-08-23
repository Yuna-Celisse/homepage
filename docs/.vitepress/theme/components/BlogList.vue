<script setup lang="ts">
import { withBase } from 'vitepress'

type Frontmatter = {
  title?: string
  date?: string
  category?: string
  description?: string
  readingTime?: number
}

type PageData = {
  frontmatter?: Frontmatter
}

type PostModule = {
  __pageData?: PageData
}

type PostItem = {
  title: string
  date: string
  category: string
  summary: string
  readingTime: number
  link: string
}

const modules = import.meta.glob('/blog/posts/*.md', { eager: true }) as Record<
  string,
  PostModule
>

function formatDate(value?: string): string {
  if (!value) {
    return '1970-01-01'
  }

  return value.includes('T') ? value.slice(0, 10) : value
}

const posts: PostItem[] = Object.entries(modules)
  .map(([path, mod]) => {
    const frontmatter = mod.__pageData?.frontmatter || {}
    const slug = path.split('/').pop()?.replace('.md', '') || ''

    return {
      title: frontmatter.title || slug,
      date: formatDate(frontmatter.date),
      category: frontmatter.category || 'Uncategorized',
      summary: frontmatter.description || '记录开发、设计与实践过程中的思考与收获。',
      readingTime: frontmatter.readingTime || 4,
      link: withBase(`/blog/posts/${slug}`)
    }
  })
  .sort((a, b) => +new Date(b.date) - +new Date(a.date))
</script>

<template>
  <section class="blog-archive" aria-labelledby="blog-title">
    <header class="blog-header">
      <p class="blog-kicker">Notes &amp; essays</p>
      <h1 id="blog-title">Blog</h1>
      <p>记录开发、设计与学习过程中的思考。</p>
    </header>

    <div v-if="posts.length" class="blog-list">
      <article v-for="post in posts" :key="post.link" class="blog-list-item">
        <time class="post-date" :datetime="post.date">
          <span class="post-year">{{ post.date.slice(0, 4) }}</span>
          <span class="post-day">{{ post.date.slice(5) }}</span>
        </time>

        <div class="blog-post-body">
          <a :href="post.link" class="blog-post-title">
            <span>{{ post.title }}</span>
            <span class="post-arrow" aria-hidden="true">→</span>
          </a>
          <p class="post-summary">{{ post.summary }}</p>
          <div class="post-meta">
            <span class="post-category">{{ post.category }}</span>
            <span class="reading-time">约 {{ post.readingTime }} 分钟阅读</span>
          </div>
        </div>
      </article>
    </div>
    <p v-else class="blog-empty">暂无文章。</p>
  </section>
</template>
