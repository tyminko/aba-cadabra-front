<template>
    <div class="uqbar-logo">
        <a href="https://spaces.airberlinalexanderplatz.de/project-space" target="_blank">
            <img src="/uqbar-logo.png" alt="UQ-BAR-A-BA" class="uqbar-image" />
        </a>
    </div>
</template>

<script>
export default {
  name: 'UqBarBanner'
}
</script>

<style lang="scss" scoped>
.uqbar-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: auto;
    transition: filter 0.2s ease-in-out;
    background-color: #ffffff;
    padding: 0.5rem;

    .uqbar-image {
        max-height: 60px;
        width: auto;
        object-fit: contain;
        transition: all 0.2s ease-in-out;

        &:hover {
            transform: scale(1.05);
            filter: brightness(1.1);
        }
    }

    a {
        text-decoration: none;
        display: block;
        transition: all 0.2s ease-in-out;

        &:hover {
            .uqbar-image {
                filter: brightness(1.2);
                transform: scale(1.05);
            }
        }
    }
}
</style>
