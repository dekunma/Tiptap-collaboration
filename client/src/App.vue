<template>
  <div id="app">
    <a-page-header
      style="border: 1px solid rgb(235, 237, 240)"
      title="Collaboration"
      sub-title="By Tiptap"
      class="header"
    />
    <router-view/>
  </div>
</template>

<style scoped lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.header {
  box-shadow: 0 4px 6px fade(#000, 5);
}
</style>
