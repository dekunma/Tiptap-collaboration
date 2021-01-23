<template>
	<h1>{{documentId}}</h1>
</template>

<script>
export default {
	data() {
		return {
			documentId: null
		}
	},
	mounted() {
		const documentId = this.$route.params.id
		this.documentId = documentId
	}
}
</script>