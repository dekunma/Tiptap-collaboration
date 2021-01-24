<template>
  <div class="container">
    <a-tooltip placement="top">
        <template slot="title">
          <span>Click to create a new collaboration document</span>
        </template>
        <a-button icon="plus" size="large" :loading='loading' class="home-button" @click='handleCreateNewDoc'>
          {{ this.buttonText }}
        </a-button>
      </a-tooltip>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      loading: false
    }
  },
  computed: {
    buttonText() {
      return this.loading ? 'Creating ...' : 'New Document';
    },
  },
  methods: {
    handleCreateNewDoc() {
      this.loading = true
      axios.get('http://localhost:5000/new')
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
