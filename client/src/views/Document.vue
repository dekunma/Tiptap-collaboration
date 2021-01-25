<template>
  <!-- If current id not found -->
  <div v-if='notFound' class='not-found'>
    <a-empty>
      <span slot="description">
        <p>Invalid document id</p>
      </span>
      <a-button type="primary" href="/">
        Go back
      </a-button>
    </a-empty>
  </div>
  <!-------->

  <div v-else class='document-wrapper'>
    <!-- Connection status -->
    <template v-if="editor && !loading">
      <div class="document-count">
        {{ count }} {{ count === 1 ? 'user' : 'users' }} connected
      </div>
    </template>

    <div v-else class='document-connecting-text'>
      Connecting ... 
      <a-spin :indicator="indicator" />
    </div>
    <!-------->

    <!-- editor -->
    <div class='editor-wrapper'>
      <div class='editor'>
        <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
          <div class="menubar">

            <button
              class="menubar-button"
              :class="{ 'is-active': isActive.bold() }"
              @click="commands.bold"
            >
              <icon name="bold" />
            </button>

            <button
              class="menubar-button"
              :class="{ 'is-active': isActive.italic() }"
              @click="commands.italic"
            >
              <icon name="italic" />
            </button>

            <button
              class="menubar-button"
              :class="{ 'is-active': isActive.code() }"
              @click="commands.code"
            >
              <icon name="code" />
            </button>

            <button
              class="menubar-button"
              :class="{ 'is-active': isActive.paragraph() }"
              @click="commands.paragraph"
            >
              <icon name="paragraph" />
            </button>

            <button
              class="menubar-button"
              :class="{ 'is-active': isActive.heading({ level: 1 }) }"
              @click="commands.heading({ level: 1 })"
            >
              <p class='menubar-button-icon'>
                H1
              </p>
            </button>

            <button
              class="menubar-button"
              :class="{ 'is-active': isActive.heading({ level: 2 }) }"
              @click="commands.heading({ level: 2 })"
            >
              <p class='menubar-button-icon'>
                H2
              </p>
            </button>

            <button
              class="menubar-button"
              :class="{ 'is-active': isActive.heading({ level: 3 }) }"
              @click="commands.heading({ level: 3 })"
            >
              <p class='menubar-button-icon'>
                H3
              </p>
            </button>

            <button
              class="menubar-button"
              @click="commands.undo"
            >
              <icon name="undo" />
            </button>

            <button
              class="menubar-button"
              @click="commands.redo"
            >
              <icon name="redo" />
            </button>
          </div>
        </editor-menu-bar>

        <div class='editor-content-wrapper'>
          <editor-content :editor="editor" class='editor-content'/>
        </div>
      </div>
    </div>
    <!-------->
  </div>
</template>

<script>
import io from 'socket.io-client';
import { Editor, EditorContent, EditorMenuBar } from 'tiptap';
import Icon from '@/components/Icon.vue';
import environmentConfig from '@/environment.config.js'
import {
  CodeBlock,
  HardBreak,
  Heading,
  OrderedList,
  BulletList,
  ListItem,
  Bold,
  Code,
  Italic,
  Link,
  History,
  Collaboration
} from 'tiptap-extensions';

export default {
	components: {
    EditorContent,
    EditorMenuBar,
    Icon
	},
	
	data() {
		return {
			loading: true,
      editor: null, // the editor object
      count: 1, // count of connected user(s)
      indicator: <a-icon type="loading" class='document-connecting-text-spin' spin />, // the componet for loading spinner
      notFound: false, // to indicate if the document with current id is not found
    }
  },

	methods: {
    // to init the editor component
		onInit({ version, doc }) {
      this.loading = false
      if (this.editor) {
        this.editor.destroy()
      }
      this.version = version;
      this.editor = new Editor({
        autoFocus: true,
        content: doc,
        extensions: [
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new ListItem(),
          new OrderedList(),
          new Link(),
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
            },
          }),
        ],
      })
		},
    
    // set the user count
		setCount(count) {
      this.count = count
    },
	},

	mounted() {
    const documentId = this.$route.query.id;
    this.socket = io(`${environmentConfig.SERVER_ADDRESS}:${environmentConfig.SERVER_PORT}`, { query: `id=${documentId}` })

		// get the current document and its version
    .on('init', data => {
      if (data === null) this.notFound = true;
      else this.onInit(data)
    })
    // send all updates to the collaboration extension
    .on('update', data => {
      this.editor.extensions.options.collaboration.update(data)
    })
    // get count of connected users
    .on('getCount', count => this.setCount(count))
	},

	beforeDestroy() {
    this.editor.destroy()
    this.socket.destroy()
  },
}
</script>

<style scoped lang='less'>
@import '@/styles/editor.less';
.not-found {
  margin-top: 30vh
}

.document {
  &-wrapper {
    margin: 0 12vw;
    margin-top: 5vh;
  }

  &-connecting-text {
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    color: rgba(black, 0.5);
    margin-bottom: 1rem;
    text-transform: uppercase;
    font-size: 1rem;
    line-height: 1;
    &:before {
      content: '';
      display: inline-flex;
      background-color: rgba(black, 0.5);
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      margin-right: 0.5rem;
    };
    &-spin {
      font-size: 1.3rem;
      color: rgba(black, 0.5);
      margin-left: 10px;
    }
  }
}

.document-count {
  display:flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: rgba(black, 0.5);
  color: #27b127;
  margin-bottom: 1rem;
  text-transform: uppercase;
  font-size: 1rem;
  line-height: 0.5rem;
  &:before {
    content: '';
    display: inline-flex;
    background-color: #27b127;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    margin-right: 0.5rem;
  }
}
</style>