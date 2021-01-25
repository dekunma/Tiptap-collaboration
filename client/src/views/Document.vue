<template>

  
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
  <div v-else>
    <div class='document-wrapper'>
      <template v-if="editor && !loading">
        <div class="document-count">
          {{ count }} {{ count === 1 ? 'user' : 'users' }} connected
        </div>
      </template>

      <div v-else class='document-connecting-text'>
        Connecting ... 
        <a-spin :indicator="indicator" />
      </div>

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
                :class="{ 'is-active': isActive.bullet_list() }"
                @click="commands.bullet_list"
              >
                <icon name="ul" />
              </button>

              <button
                class="menubar-button"
                :class="{ 'is-active': isActive.ordered_list() }"
                @click="commands.ordered_list"
              >
                <icon name="ol" />
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
    </div>
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
  TodoItem,
  TodoList,
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
			documentId: null,
			loading: true,
      editor: null,
      count: 1,
      indicator: <a-icon type="loading" class='document-connecting-text-spin' spin />,
      notFound: false,
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
        autoFocus: true,
        content: doc,
        extensions: [
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new ListItem(),
          new OrderedList(),
          new TodoItem(),
          new TodoList(),
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
		
		setCount(count) {
      this.count = count
    },
	},

	mounted() {

    const documentId = this.$route.query.id;
    this.documentId = documentId;
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

.menubar {

  margin-bottom: 1rem;
  transition: visibility 0.2s 0.4s, opacity 0.2s 0.4s;

  &.is-hidden {
    visibility: hidden;
    opacity: 0;
  }

  &.is-focused {
    visibility: visible;
    opacity: 1;
    transition: visibility 0.2s, opacity 0.2s;
  }

  &-button {
    font-weight: bold;
    display: inline-flex;
    align-items: center;
    background: transparent;
    border: 0;
    color: black;
    padding: 0.2rem 0.5rem;
    margin-right: 0.2rem;
    border-radius: 3px;
    cursor: pointer;

    &:hover {
      background-color: rgba(black, 0.05);
    }

    &.is-active {
      background-color: rgba(black, 0.1);
    }

    &-icon {
      width: 2em;
      height: 0.5em;
    }
  }
}
@animate-duration: 0.35s;
.editor-content-wrapper:hover{
  box-shadow: 0px 10px 10px fade(#000, 8);
}
.editor {
  max-width: 40rem;
  
  &-wrapper {
    display: flex;
    justify-content: center;
    :focus {
      outline: none;
    }
  }

  &-content {
    &-wrapper {
      width: 100%;
      will-change: transform;
      transition: box-shadow @animate-duration ease-in, transform @animate-duration ease-in;
      padding: 4em;
      border-radius: 3px;
    };

    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    text-align: left;


    * {
      caret-color: currentColor;
    }

    pre {
      padding: 0.7rem 1rem;
      border-radius: 5px;
      background: black;
      color: white;
      font-size: 0.8rem;
      overflow-x: auto;

      code {
        display: block;
      }
    }

    p code {
      padding: 0.2rem 0.4rem;
      border-radius: 5px;
      font-size: 0.8rem;
      font-weight: bold;
      background: rgba(black, 0.1);
      color: rgba(black, 0.8);
    }

    ul,
    ol {
      padding-left: 1rem;
    }

    li > p,
    li > ol,
    li > ul {
      margin: 0;
    }

    a {
      color: inherit;
    }

    img {
      max-width: 100%;
      border-radius: 3px;
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      margin: 0;
      overflow: hidden;

      td, th {
        min-width: 1em;
        border: 2px solid grey;
        padding: 3px 5px;
        vertical-align: top;
        box-sizing: border-box;
        position: relative;
        > * {
          margin-bottom: 0;
        }
      }

      th {
        font-weight: bold;
        text-align: left;
      }

      .selectedCell:after {
        z-index: 2;
        position: absolute;
        content: "";
        left: 0; right: 0; top: 0; bottom: 0;
        background: rgba(200, 200, 255, 0.4);
        pointer-events: none;
      }

      .column-resize-handle {
        position: absolute;
        right: -2px; top: 0; bottom: 0;
        width: 4px;
        z-index: 20;
        background-color: #adf;
        pointer-events: none;
      }
    }

    .tableWrapper {
      margin: 1em 0;
      overflow-x: auto;
    }

    .resize-cursor {
      cursor: ew-resize;
      cursor: col-resize;
    }
}
}

</style>