<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import CurrentOutline from './components/CurrentOutline.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #aside-outline-before>
      <CurrentOutline />
    </template>
  </DefaultTheme.Layout>
</template>
