<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { onContentUpdated, useRoute } from 'vitepress'

type OutlineHeading = {
  id: string
  title: string
  element: HTMLElement
}

type OutlineSubsection = OutlineHeading & {
  children: OutlineHeading[]
}

type OutlineSection = OutlineHeading & {
  children: OutlineSubsection[]
}

const route = useRoute()
const sections = ref<OutlineSection[]>([])
const activeId = ref('')
const activeSectionId = ref('')
const activeSubsectionId = ref('')
// Explicit choices take precedence over scroll-driven expansion until navigation.
const expandedOverrides = ref(new Map<string, boolean>())
let scrollFrame = 0

function isExpanded(id: string): boolean {
  return expandedOverrides.value.get(id)
    ?? (activeSectionId.value === id || activeSubsectionId.value === id)
}

function toggleExpanded(id: string): void {
  expandedOverrides.value.set(id, !isExpanded(id))
}

function headingTitle(element: HTMLElement): string {
  const copy = element.cloneNode(true) as HTMLElement
  copy.querySelector('.header-anchor')?.remove()
  return copy.textContent?.trim() || element.id
}

function readHeadings(): void {
  const result: OutlineSection[] = []
  let currentSection: OutlineSection | undefined
  let currentSubsection: OutlineSubsection | undefined

  for (const element of document.querySelectorAll<HTMLElement>('.VPDoc .vp-doc :is(h2, h3, h4)')) {
    if (!element.id || element.classList.contains('ignore-header')) continue

    const heading: OutlineHeading = {
      id: element.id,
      title: headingTitle(element),
      element
    }

    if (element.tagName === 'H2') {
      currentSection = { ...heading, children: [] }
      currentSubsection = undefined
      result.push(currentSection)
    } else if (element.tagName === 'H3' && currentSection) {
      currentSubsection = { ...heading, children: [] }
      currentSection.children.push(currentSubsection)
    } else if (element.tagName === 'H4' && currentSubsection) {
      currentSubsection.children.push(heading)
    }
  }

  sections.value = result
  updateActiveHeading()
}

function updateActiveHeading(): void {
  const threshold = window.scrollY + 128
  let activeHeading: OutlineHeading | undefined
  let activeSection: OutlineSection | undefined
  let activeSubsection: OutlineSubsection | undefined

  for (const section of sections.value) {
    const sectionTop = section.element.getBoundingClientRect().top + window.scrollY
    if (sectionTop <= threshold) {
      activeHeading = section
      activeSection = section
      activeSubsection = undefined
    }

    for (const subsection of section.children) {
      const subsectionTop = subsection.element.getBoundingClientRect().top + window.scrollY
      if (subsectionTop <= threshold) {
        activeHeading = subsection
        activeSection = section
        activeSubsection = subsection
      }

      for (const heading of subsection.children) {
        const top = heading.element.getBoundingClientRect().top + window.scrollY
        if (top <= threshold) {
          activeHeading = heading
          activeSection = section
          activeSubsection = subsection
        }
      }
    }
  }

  activeId.value = activeHeading?.id || ''
  activeSectionId.value = activeSection?.id || ''
  activeSubsectionId.value = activeSubsection?.id || ''
}

function scheduleActiveUpdate(): void {
  if (scrollFrame) return
  scrollFrame = window.requestAnimationFrame(() => {
    updateActiveHeading()
    scrollFrame = 0
  })
}

function refreshOutline(): void {
  nextTick(() => window.requestAnimationFrame(readHeadings))
}

onMounted(() => {
  readHeadings()
  window.addEventListener('scroll', scheduleActiveUpdate, { passive: true })
  window.addEventListener('resize', scheduleActiveUpdate, { passive: true })
})

watch(() => route.path, () => {
  expandedOverrides.value.clear()
  refreshOutline()
})
onContentUpdated(refreshOutline)

onUnmounted(() => {
  window.cancelAnimationFrame(scrollFrame)
  window.removeEventListener('scroll', scheduleActiveUpdate)
  window.removeEventListener('resize', scheduleActiveUpdate)
})
</script>

<template>
  <nav v-if="sections.length" class="CurrentOutline" aria-label="On this page">
    <div class="current-outline-title">On this page</div>
    <ol class="current-outline-list">
      <li v-for="section in sections" :key="section.id" class="outline-section">
        <div class="outline-row">
          <a
            class="current-outline-link level-two"
            :class="{ active: activeId === section.id }"
            :href="`#${encodeURIComponent(section.id)}`"
          >{{ section.title }}</a>
          <button
            v-if="section.children.length"
            type="button"
            class="outline-toggle"
            :aria-expanded="isExpanded(section.id)"
            :aria-controls="`outline-children-${section.id}`"
            :aria-label="`${isExpanded(section.id) ? '折叠' : '展开'}${section.title}的子标题`"
            @click="toggleExpanded(section.id)"
          ><span aria-hidden="true">›</span></button>
        </div>

        <Transition name="outline-children">
          <ol v-if="section.children.length" v-show="isExpanded(section.id)" :id="`outline-children-${section.id}`" class="outline-children">
            <li v-for="child in section.children" :key="child.id">
              <div class="outline-row">
                <a
                  class="current-outline-link level-three"
                  :class="{ active: activeId === child.id }"
                  :href="`#${encodeURIComponent(child.id)}`"
                >{{ child.title }}</a>
                <button
                  v-if="child.children.length"
                  type="button"
                  class="outline-toggle"
                  :aria-expanded="isExpanded(child.id)"
                  :aria-controls="`outline-children-${child.id}`"
                  :aria-label="`${isExpanded(child.id) ? '折叠' : '展开'}${child.title}的子标题`"
                  @click="toggleExpanded(child.id)"
                ><span aria-hidden="true">›</span></button>
              </div>

              <Transition name="outline-children">
                <ol v-if="child.children.length" v-show="isExpanded(child.id)" :id="`outline-children-${child.id}`" class="outline-children level-four-list">
                  <li v-for="grandchild in child.children" :key="grandchild.id">
                    <a
                      class="current-outline-link level-four"
                      :class="{ active: activeId === grandchild.id }"
                      :href="`#${encodeURIComponent(grandchild.id)}`"
                    >{{ grandchild.title }}</a>
                  </li>
                </ol>
              </Transition>
            </li>
          </ol>
        </Transition>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.CurrentOutline {
  position: relative;
  border-left: 1px solid var(--vp-c-divider);
  padding-left: 16px;
}

.current-outline-title {
  line-height: 32px;
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 600;
}

.current-outline-list,
.outline-children {
  margin: 0;
  padding: 0;
  list-style: none;
}

.outline-section {
  position: relative;
}

.outline-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.outline-row > .current-outline-link {
  flex: 1;
  min-width: 0;
}

.outline-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28px;
  height: 28px;
  border-radius: 4px;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.outline-toggle:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
}

.outline-toggle:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.outline-toggle span {
  font-size: 20px;
  line-height: 1;
}

.outline-toggle[aria-expanded='true'] span {
  transform: rotate(90deg);
}

.current-outline-link {
  position: relative;
  display: block;
  overflow: hidden;
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 400;
  line-height: 32px;
  text-overflow: ellipsis;
  text-decoration: none;
  white-space: nowrap;
  transition: color 200ms ease;
}

.current-outline-link:hover,
.current-outline-link.active {
  color: var(--vp-c-text-1);
}

.current-outline-link.active::before {
  content: '';
  position: absolute;
  top: 7px;
  left: -17px;
  width: 2px;
  height: 18px;
  border-radius: 2px;
  background: var(--vp-c-brand-1);
}

.outline-children {
  padding-left: 14px;
}

.level-three {
  font-size: 13px;
}

.level-four-list {
  padding-left: 12px;
}

.level-four {
  font-size: 12px;
  line-height: 28px;
}

.outline-children-enter-active,
.outline-children-leave-active {
  overflow: hidden;
  transition: opacity 200ms ease, transform 200ms ease;
}

.outline-children-enter-from,
.outline-children-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .outline-children-enter-active,
  .outline-children-leave-active {
    transition: none;
  }
}
</style>
