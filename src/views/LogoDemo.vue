<template>
  <div class="logo-demo p-base">
    <h1 class="text-3xl mb-base text-aba-blue">The Berlin Field School in The Contemporary Arts</h1>

    <div class="logo-showcase">
      <h2 class="text-xl mb-sm">Logo Variations:</h2>

      <!-- Large version -->
      <div class="logo-item mb-base">
        <h3 class="text-lg mb-xs">Large (Main Header)</h3>
        <div class="logo-container p-base border border-aba-blue-semi">
          <bfs-logo class="main text-3xl" />
        </div>
      </div>

      <!-- Medium version -->
      <div class="logo-item mb-base">
        <h3 class="text-lg mb-xs">Medium (Standard)</h3>
        <div class="logo-container p-base border border-aba-blue-semi">
          <bfs-logo class="text-2xl" />
        </div>
      </div>

      <!-- Small version -->
      <div class="logo-item mb-base">
        <h3 class="text-lg mb-xs">Small (Navigation)</h3>
        <div class="logo-container p-base border border-aba-blue-semi">
          <bfs-logo class="text-sm" />
        </div>
      </div>

      <!-- Interactive demo -->
      <div class="logo-item mb-base">
        <h3 class="text-lg mb-xs">Interactive Demo (Hover & Click)</h3>
        <div class="logo-container p-base border border-aba-blue-semi">
          <bfs-logo class="text-2xl cursor-pointer" />
        </div>
        <p class="text-sm text-gray-600 mt-xs">Hover and click to see animations</p>
      </div>
    </div>

    <div class="usage-info mt-base p-base bg-gray-100">
      <h3 class="text-lg mb-sm">Usage:</h3>
      <pre class="text-sm bg-white p-sm border"><code>&lt;bfs-logo class="main text-2xl" /&gt;</code></pre>
      <p class="text-sm mt-xs">The logo uses the same color scheme as your website: <span class="text-aba-blue">#0000ff</span> (blue) and <span class="text-aba-red">#860025</span> (red on click).</p>
    </div>
  </div>
</template>

<script>
import BFSLogo from './components/BFSLogo.vue'

export default {
  name: 'LogoDemo',
  components: {
    'bfs-logo': BFSLogo
  }
}
</script>

<style lang="scss" scoped>
.logo-demo {
  max-width: 800px;
  margin: 0 auto;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  background: white;
}

.logo-item {
  h3 {
    color: #373737;
    font-weight: 500;
  }
}

.usage-info {
  border-radius: 4px;

  pre {
    border-radius: 4px;
    overflow-x: auto;
  }
}
</style>
