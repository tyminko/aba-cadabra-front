<template>
  <main class="partners" role="main">
    <section class="partners__hero">
      <div class="partners__hero-content">
        <h1 class="partners__title">Our Partners</h1>
        <p class="partners__subtitle">Working together to deliver excellence</p>
      </div>
    </section>

    <section class="partners__content">
      <div class="partners__grid">
        <!-- Featured Partners -->
        <article class="partners__section">
          <h2 class="partners__section-title">Featured Partners</h2>
          <div class="partners__featured-grid">
            <div
              v-for="partner in featuredPartners"
              :key="partner.id"
              class="partners__featured-card"
              :class="{ 'partners__featured-card--active': partner.isActive }">
              <div class="partners__featured-image-wrapper">
                <img
                  :src="partner.logo"
                  :alt="partner.name"
                  class="partners__featured-image"
                  loading="lazy"
                  :width="partner.logoWidth"
                  :height="partner.logoHeight">
                <div
                  v-if="partner.isActive"
                  class="partners__featured-badge"
                  role="status"
                  aria-label="Active partner">
                  Active
                </div>
              </div>
              <div class="partners__featured-content">
                <h3 class="partners__featured-name">{{ partner.name }}</h3>
                <p class="partners__featured-description">{{ partner.description }}</p>
                <div class="partners__featured-meta">
                  <span class="partners__featured-category">{{ partner.category }}</span>
                  <span class="partners__featured-since">Partner since {{ partner.since }}</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <!-- Partner Categories -->
        <article class="partners__section">
          <h2 class="partners__section-title">Partner Categories</h2>
          <div class="partners__categories-grid">
            <div
              v-for="category in partnerCategories"
              :key="category.id"
              class="partners__category-card">
              <div class="partners__category-icon" aria-hidden="true">
                <i :class="category.icon"></i>
              </div>
              <h3 class="partners__category-title">{{ category.title }}</h3>
              <p class="partners__category-description">{{ category.description }}</p>
              <ul class="partners__category-list">
                <li
                  v-for="partner in category.partners"
                  :key="partner.id"
                  class="partners__category-item">
                  {{ partner.name }}
                </li>
              </ul>
            </div>
          </div>
        </article>

        <!-- Become a Partner -->
        <article class="partners__section partners__section--cta">
          <div class="partners__cta-content">
            <h2 class="partners__cta-title">Become a Partner</h2>
            <p class="partners__cta-description">
              Join our network of trusted partners and grow your business together.
              We're always looking for innovative companies to collaborate with.
            </p>
            <div class="partners__cta-actions">
              <router-link
                to="/contact"
                class="partners__cta-button">
                Contact Us
              </router-link>
              <a
                href="/partner-guidelines.pdf"
                class="partners__cta-link"
                target="_blank"
                rel="noopener noreferrer">
                View Partner Guidelines
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PartnerList'
})

interface Partner {
  id: string
  name: string
  description: string
  logo: string
  logoWidth: number
  logoHeight: number
  category: string
  since: string
  isActive: boolean
}

interface PartnerCategory {
  id: string
  title: string
  description: string
  icon: string
  partners: { id: string; name: string }[]
}

const featuredPartners: Partner[] = [
  {
    id: '1',
    name: 'Tech Solutions Inc.',
    description: 'Leading provider of innovative technology solutions.',
    logo: '/images/partners/tech-solutions.png',
    logoWidth: 200,
    logoHeight: 100,
    category: 'Technology',
    since: '2020',
    isActive: true
  },
  {
    id: '2',
    name: 'Global Services Ltd.',
    description: 'International business services and consulting.',
    logo: '/images/partners/global-services.png',
    logoWidth: 200,
    logoHeight: 100,
    category: 'Consulting',
    since: '2019',
    isActive: true
  },
  {
    id: '3',
    name: 'Creative Design Co.',
    description: 'Award-winning design and branding agency.',
    logo: '/images/partners/creative-design.png',
    logoWidth: 200,
    logoHeight: 100,
    category: 'Design',
    since: '2021',
    isActive: true
  }
]

const partnerCategories: PartnerCategory[] = [
  {
    id: 'tech',
    title: 'Technology Partners',
    description: 'Software, hardware, and digital solutions.',
    icon: 'material-icons computer',
    partners: [
      { id: '1', name: 'Tech Solutions Inc.' },
      { id: '4', name: 'Digital Systems' },
      { id: '5', name: 'Cloud Services' }
    ]
  },
  {
    id: 'consulting',
    title: 'Consulting Partners',
    description: 'Business strategy and advisory services.',
    icon: 'material-icons business',
    partners: [
      { id: '2', name: 'Global Services Ltd.' },
      { id: '6', name: 'Strategy Group' },
      { id: '7', name: 'Business Advisors' }
    ]
  },
  {
    id: 'design',
    title: 'Design Partners',
    description: 'Creative and branding services.',
    icon: 'material-icons palette',
    partners: [
      { id: '3', name: 'Creative Design Co.' },
      { id: '8', name: 'Brand Studio' },
      { id: '9', name: 'Visual Arts' }
    ]
  }
]
</script>

<style lang="scss" scoped>
.partners {
  &__hero {
    position: relative;
    height: 400px;
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
                url('/images/partners-hero.jpg') center/cover;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--white);
  }

  &__hero-content {
    max-width: 800px;
    padding: 2rem;
  }

  &__title {
    margin: 0 0 1rem;
    font-size: 3rem;
    font-weight: 700;
    line-height: 1.2;
  }

  &__subtitle {
    margin: 0;
    font-size: 1.25rem;
    opacity: 0.9;
  }

  &__content {
    padding: 4rem 2rem;
  }

  &__grid {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__section {
    margin-bottom: 4rem;

    &:last-child {
      margin-bottom: 0;
    }

    &--cta {
      background: var(--aba-blue);
      color: var(--white);
      padding: 4rem 2rem;
      border-radius: 8px;
      text-align: center;
    }
  }

  &__section-title {
    margin: 0 0 2rem;
    font-size: 2rem;
    font-weight: 600;
    color: var(--text-color);
    text-align: center;
  }

  &__featured-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  &__featured-card {
    background: var(--white);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.2s ease-in-out;

    &:hover {
      transform: translateY(-4px);
    }

    &--active {
      border: 2px solid var(--aba-blue);
    }
  }

  &__featured-image-wrapper {
    position: relative;
    padding: 2rem;
    background: var(--gray-50);
    text-align: center;
  }

  &__featured-image {
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }

  &__featured-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem 0.75rem;
    background: var(--aba-blue);
    color: var(--white);
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  &__featured-content {
    padding: 1.5rem;
  }

  &__featured-name {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
  }

  &__featured-description {
    margin: 0 0 1rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--text-color-light);
  }

  &__featured-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: var(--text-color-light);
  }

  &__categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  &__category-card {
    padding: 2rem;
    background: var(--white);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  &__category-icon {
    margin-bottom: 1rem;
    color: var(--aba-blue);
    font-size: 2.5rem;
  }

  &__category-title {
    margin: 0 0 1rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
  }

  &__category-description {
    margin: 0 0 1.5rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--text-color-light);
  }

  &__category-list {
    margin: 0;
    padding: 0;
    list-style: none;
    text-align: left;
  }

  &__category-item {
    padding: 0.5rem 0;
    font-size: 0.875rem;
    color: var(--text-color);
    border-bottom: 1px solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }
  }

  &__cta-content {
    max-width: 600px;
    margin: 0 auto;
  }

  &__cta-title {
    margin: 0 0 1rem;
    font-size: 2rem;
    font-weight: 600;
  }

  &__cta-description {
    margin: 0 0 2rem;
    font-size: 1.125rem;
    line-height: 1.6;
    opacity: 0.9;
  }

  &__cta-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  &__cta-button {
    padding: 0.75rem 2rem;
    background: var(--white);
    color: var(--aba-blue);
    border-radius: 4px;
    font-weight: 500;
    text-decoration: none;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background: var(--gray-100);
    }
  }

  &__cta-link {
    color: var(--white);
    text-decoration: none;
    opacity: 0.9;
    transition: opacity 0.2s ease-in-out;

    &:hover {
      opacity: 1;
    }
  }
}

@media(max-width: 768px) {
  .partners {
    &__hero {
      height: 300px;
    }

    &__title {
      font-size: 2rem;
    }

    &__subtitle {
      font-size: 1rem;
    }

    &__content {
      padding: 2rem 1rem;
    }

    &__section {
      margin-bottom: 3rem;

      &--cta {
        padding: 3rem 1.5rem;
      }
    }

    &__section-title {
      font-size: 1.75rem;
    }
  }
}
</style>
