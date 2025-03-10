<template>
  <main class="about" role="main">
    <section class="about__hero">
      <div class="about__hero-content">
        <h1 class="about__title">About Us</h1>
        <p class="about__subtitle">Discover our story and mission</p>
      </div>
    </section>

    <section class="about__content">
      <div class="about__grid">
        <!-- Our Story -->
        <article class="about__section">
          <h2 class="about__section-title">Our Story</h2>
          <div class="about__section-content">
            <p>
              Founded in 2020, we've been dedicated to providing exceptional service
              and creating memorable experiences for our guests. Our journey began
              with a simple idea: to create a space where people can gather, celebrate,
              and enjoy life's special moments.
            </p>
            <p>
              Today, we continue to grow and evolve, always striving to exceed
              expectations and deliver the best possible experience to our valued
              customers.
            </p>
          </div>
        </article>

        <!-- Our Mission -->
        <article class="about__section">
          <h2 class="about__section-title">Our Mission</h2>
          <div class="about__section-content">
            <p>
              Our mission is to create an inclusive, welcoming environment where
              everyone feels valued and appreciated. We believe in sustainable
              practices, community engagement, and continuous improvement.
            </p>
            <ul class="about__mission-list">
              <li>Deliver exceptional service</li>
              <li>Support local communities</li>
              <li>Promote sustainable practices</li>
              <li>Foster innovation and growth</li>
            </ul>
          </div>
        </article>

        <!-- Our Values -->
        <article class="about__section">
          <h2 class="about__section-title">Our Values</h2>
          <div class="about__values-grid">
            <div
              v-for="value in values"
              :key="value.title"
              class="about__value-card">
              <div class="about__value-icon" aria-hidden="true">
                <i :class="value.icon"></i>
              </div>
              <h3 class="about__value-title">{{ value.title }}</h3>
              <p class="about__value-description">{{ value.description }}</p>
            </div>
          </div>
        </article>

        <!-- Team Section -->
        <article class="about__section">
          <h2 class="about__section-title">Our Team</h2>
          <div class="about__team-grid">
            <div
              v-for="member in team"
              :key="member.name"
              class="about__team-member">
              <img
                :src="member.image"
                :alt="member.name"
                class="about__team-image"
                loading="lazy"
                :width="member.imageWidth"
                :height="member.imageHeight">
              <h3 class="about__team-name">{{ member.name }}</h3>
              <p class="about__team-role">{{ member.role }}</p>
              <p class="about__team-bio">{{ member.bio }}</p>
            </div>
          </div>
        </article>

        <!-- Contact Section -->
        <article class="about__section">
          <h2 class="about__section-title">Get in Touch</h2>
          <div class="about__contact-content">
            <p>
              We'd love to hear from you! Whether you have questions, feedback,
              or just want to say hello, we're here to help.
            </p>
            <div class="about__contact-info">
              <div class="about__contact-item">
                <i class="material-icons" aria-hidden="true">location_on</i>
                <span>123 Main Street, City, Country</span>
              </div>
              <div class="about__contact-item">
                <i class="material-icons" aria-hidden="true">phone</i>
                <a href="tel:+1234567890">+1(234) 567-890</a>
              </div>
              <div class="about__contact-item">
                <i class="material-icons" aria-hidden="true">email</i>
                <a href="mailto:contact@example.com">contact@example.com</a>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AboutPage'
})

interface Value {
  title: string
  description: string
  icon: string
}

interface TeamMember {
  name: string
  role: string
  bio: string
  image: string
  imageWidth: number
  imageHeight: number
}

const values: Value[] = [
  {
    title: 'Excellence',
    description: 'We strive for excellence in everything we do, from service to quality.',
    icon: 'material-icons star'
  },
  {
    title: 'Integrity',
    description: 'We maintain the highest standards of integrity and honesty.',
    icon: 'material-icons verified'
  },
  {
    title: 'Innovation',
    description: 'We embrace new ideas and continuously improve our services.',
    icon: 'material-icons lightbulb'
  },
  {
    title: 'Community',
    description: 'We value our community and contribute to its growth.',
    icon: 'material-icons people'
  }
]

const team: TeamMember[] = [
  {
    name: 'John Doe',
    role: 'Founder & CEO',
    bio: 'With over 15 years of experience in the industry.',
    image: '/images/team/john-doe.jpg',
    imageWidth: 300,
    imageHeight: 300
  },
  {
    name: 'Jane Smith',
    role: 'Head of Operations',
    bio: 'Leading our operations with passion and expertise.',
    image: '/images/team/jane-smith.jpg',
    imageWidth: 300,
    imageHeight: 300
  },
  {
    name: 'Mike Johnson',
    role: 'Customer Relations',
    bio: 'Ensuring our customers receive the best service.',
    image: '/images/team/mike-johnson.jpg',
    imageWidth: 300,
    imageHeight: 300
  }
]
</script>

<style lang="scss" scoped>
.about {
  &__hero {
    position: relative;
    height: 400px;
    background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7));
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
  }

  &__section-title {
    margin: 0 0 2rem;
    font-size: 2rem;
    font-weight: 600;
    color: var(--text-color);
    text-align: center;
  }

  &__section-content {
    font-size: 1.125rem;
    line-height: 1.6;
    color: var(--text-color-light);
  }

  &__mission-list {
    margin: 2rem 0;
    padding-left: 1.5rem;

    li {
      margin-bottom: 1rem;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: -1.5rem;
        top: 0.5rem;
        width: 8px;
        height: 8px;
        background: var(--aba-blue);
        border-radius: 50%;
      }
    }
  }

  &__values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  &__value-card {
    padding: 2rem;
    background: var(--white);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: transform 0.2s ease-in-out;

    &:hover {
      transform: translateY(-4px);
    }
  }

  &__value-icon {
    margin-bottom: 1rem;
    color: var(--aba-blue);
    font-size: 2.5rem;
  }

  &__value-title {
    margin: 0 0 1rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
  }

  &__value-description {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
    color: var(--text-color-light);
  }

  &__team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  &__team-member {
    text-align: center;
  }

  &__team-image {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    margin-bottom: 1rem;
    object-fit: cover;
  }

  &__team-name {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
  }

  &__team-role {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: var(--aba-blue);
  }

  &__team-bio {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--text-color-light);
  }

  &__contact-content {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }

  &__contact-info {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__contact-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    color: var(--text-color);

    i {
      color: var(--aba-blue);
    }

    a {
      color: var(--text-color);
      text-decoration: none;
      transition: color 0.2s ease-in-out;

      &:hover {
        color: var(--aba-blue);
      }
    }
  }
}

@media(max-width: 768px) {
  .about {
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
    }

    &__section-title {
      font-size: 1.75rem;
    }
  }
}
</style>
