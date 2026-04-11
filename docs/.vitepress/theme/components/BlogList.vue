<script setup lang="ts">
type Frontmatter = {
  title?: string
  date?: string
  category?: string
}

type PostItem = {
  title: string
  date: string
  category: string
  link: string
}

const modules = import.meta.glob('/blog/posts/*.md', { eager: true }) as Record<
  string,
  { frontmatter?: Frontmatter }
>

const posts: PostItem[] = Object.entries(modules)
  .map(([path, mod]) => {
    const frontmatter = mod.frontmatter || {}
    const slug = path.split('/').pop()?.replace('.md', '') || ''

    return {
      title: frontmatter.title || slug,
      date: frontmatter.date || '1970-01-01',
      category: frontmatter.category || '未分类',
      link: `/blog/posts/${slug}`
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
  <p v-else>暂无文章，先写第一篇吧。</p>
</template>
