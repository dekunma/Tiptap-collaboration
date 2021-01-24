<template>
	<div>
		<h1>{{ documentId }}</h1>
		<template v-if="editor && !loading">
      <div class="count">
        {{ count }} {{ count === 1 ? 'user' : 'users' }} connected
      </div>
      <editor-content :editor="editor"  />
    </template>
    <em v-else>
      Connecting to socket server …
    </em>
	</div>
</template>

<script>
import io from 'socket.io-client';
import { Editor, EditorContent } from 'tiptap';
import {
  HardBreak,
  Heading,
  Bold,
  Code,
  Italic,
  History,
  Collaboration,
} from 'tiptap-extensions';

export default {
	components: {
    EditorContent,
	},
	
	data() {
		return {
			documentId: null,
			loading: true,
      editor: null
    }
	},

	methods: {
		onInit({ version, doc }) {
      this.loading = false
      if (this.editor) {
        this.editor.destroy()
      }
      this.version = version;
      this.editor = new Editor({
        content: doc,
        extensions: [
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new Bold(),
          new Code(),
          new Italic(),
          new History(),
          new Collaboration({
            // the initial version we start with
            // version is an integer which is incremented with every change
            version,
            // debounce changes so we can save some requests
            debounce: 250,
            // onSendable is called whenever there are changed we have to send to our server
            onSendable: ({ sendable }) => {
							this.socket.emit('update', sendable)
							console.log(sendable)
            },
          }),
        ],
      })
		},
		
		setCount(count) {
      this.count = count
    },
	},

	mounted() {
    const documentId = this.$route.query.id;
    this.documentId = documentId;
    this.socket = io('http://127.0.0.1:5000', { query: `id=${documentId}` })
    // this.socket.emit('id', documentId)
    // this.socket
		// get the current document and its version
    .on('init', data => this.onInit(data))
    .on('update', data => {
      console.log('update', data)
      this.editor.extensions.options.collaboration.update(data)
    })
      // get count of connected users
      // .on('getCount', count => this.setCount(count))
		// // send all updates to the collaboration extension
		// .on('update', data => this.editor.extensions.options.collaboration.update(data))
		// // get count of connected users
		// .on('getCount', count => this.setCount(count))


		// this.socket.on('connect', () => {
		// 	this.socket.emit('test', documentId)
		// })
	},

	beforeDestroy() {
    this.editor.destroy()
    this.socket.destroy()
  },
}
</script>