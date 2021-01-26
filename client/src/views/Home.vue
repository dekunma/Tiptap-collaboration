<template>
  <div class="container">
    <!-- button to create a new document -->
    <a-tooltip placement="top">
      <template slot="title">
        <span>Create a new collaboration document</span>
      </template>
      <a-button icon="plus" size="large" :loading='loading' class="home-button" @click='handleCreateNewDoc'>
        {{ this.buttonText }}
      </a-button>
    </a-tooltip>
    <!------>
  </div>
</template>

<script>
import axios from 'axios';
import environmentConfig from '@/environment.config.js'
export default {
  data() {
    return {
      loading: false
    }
  },
  computed: {
    // text on the button
    buttonText() {
      return this.loading ? 'Creating ...' : 'New Document';
    },
  },
  methods: {
    // create a new document
    handleCreateNewDoc() {
      this.loading = true
      axios.get(`${environmentConfig.SERVER_ADDRESS}/new`)
      .then(r => {
        window.location.href = `/document/?id=${r.data}`
      })
      .catch(e => {
        console.log(e)
        this.loading = false
      })
    },
  }
}
</script>

<style scoped>
  .container {
    width: 100%;
    height: 80vh;
    display: flex;
    justify-content: center;
    align-items: center
  }
  .home-button {
    width: 180px;
  }
</style>
