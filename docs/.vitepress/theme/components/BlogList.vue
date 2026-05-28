<script setup lang="ts">
import { withBase } from 'vitepress'

type Frontmatter = {
  title?: string
  date?: string
  category?: string
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
      link: withBase(`/blog/posts/${slug}`)
    }
  })
  .sort((a, b) => +new Date(b.date) - +new Date(a.date))
</script>

<template>
  <ul v-if="posts.length" class="blog-list">
    <li v-for="post in posts" :key="post.link" class="blog-list-item">
      <a :href="post.link" class="post-title">{{ post.title }}</a>
      <div class="post-meta">
        <span>{{ post.date }}</span>
        <span>{{ post.category }}</span>
      </div>
    </li>
  </ul>
  <p v-else>No posts yet.</p>
</template>
