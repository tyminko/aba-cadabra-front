<template>
    <div class="bookstop-logo">
        <a href="https://spaces.airberlinalexanderplatz.de/bookstop" target="_blank">
            <img src="/bookstop-logo.png" alt="BOOKSTOP" class="bookstop-image" />
        </a>
    </div>
</template>

<script>
export default {
  name: 'BookstopBanner'
}
</script>

<style lang="scss" scoped>
.bookstop-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: auto;
    transition: filter 0.2s ease-in-out;
    background-color: #ffffff;
    padding: 0.5rem;

    .bookstop-image {
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
            .bookstop-image {
                filter: brightness(1.2);
                transform: scale(1.05);
            }
        }
    }
}
</style>
