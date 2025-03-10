<template>
  <article
    class="post-cell"
    :class="{ 'post-cell--featured': post.featured }"
    :aria-labelledby="`post-title-${post.id}`">
    <div class="post-cell__image-wrapper" v-if="post.image">
      <img
        :src="post.image"
        :alt="post.imageAlt || ''"
        class="post-cell__image"
        loading="lazy"
        :width="post.imageWidth || 800"
        :height="post.imageHeight || 400">
      <div
        v-if="post.category"
        class="post-cell__category"
        role="status"
        aria-label="Category">
        {{ post.category }}
      </div>
    </div>

    <div class="post-cell__content">
      <h2
        :id="`post-title-${post.id}`"
        class="post-cell__title">
        <router-link
          :to="{ name: 'post', params: { id: post.id }}"
          class="post-cell__title-link">
          {{ post.title }}
        </router-link>
      </h2>

      <div
        v-if="post.excerpt"
        class="post-cell__excerpt"
        aria-hidden="true">
        {{ post.excerpt }}
      </div>

      <div class="post-cell__meta">
        <time
          :datetime="formatDate(post.createdAt)"
          class="post-cell__date">
          {{ formatDate(post.createdAt) }}
        </time>

        <div
          v-if="post.author"
          class="post-cell__author"
          aria-label="Author">
          {{ post.author }}
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
interface Post {
  id: string
  title: string
  excerpt?: string
  image?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
  category?: string
  author?: string
  createdAt: Date | string
  featured?: boolean
  [key: string]: any
}

defineProps<{
  post: Post
}>()

const formatDate = (date: Date | string): string => {
  const d = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d)
}
</script>

<style lang="scss" scoped>
.post-cell {
  display: flex;
  flex-direction: column;
  background: var(--white);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &--featured {
    grid-column: 1 / -1;
    flex-direction: row;

    @media(min-width: 768px) {
      .post-cell__image-wrapper {
        flex: 0 0 50%;
      }
      .post-cell__content {
        padding: 2rem;
      }
    }
  }

  &__image-wrapper {
    position: relative;
    width: 100%;
    padding-top: 50%; // 2:1 aspect ratio
    overflow: hidden;
  }

  &__image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease-in-out;
  }

  &__category {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.5rem 1rem;
    background: var(--aba-blue);
    color: var(--white);
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  &__content {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__title {
    margin: 0 0 1rem;
    font-size: 1.25rem;
    line-height: 1.4;
    font-weight: 600;
  }

  &__title-link {
    color: var(--text-color);
    text-decoration: none;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: var(--aba-blue);
    }
  }

  &__excerpt {
    margin-bottom: 1rem;
    color: var(--text-color-light);
    font-size: 0.875rem;
    line-height: 1.6;
  }

  &__meta {
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--text-color-light);
  }

  &__date {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 4px;
      background: currentColor;
      border-radius: 50%;
    }
  }

  &__author {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 4px;
      background: currentColor;
      border-radius: 50%;
    }
  }
}
</style>
