<script>
import { Codemirror, javascript, oneDark } from 'vuepress-plugin-demo-block-edit/cmp'

export default {
    name: 'CodeEdit',
    components: {
        Codemirror,
    },
    data() {
        return {
            source: '',
            codeSource: '',
            extensions: [javascript(), oneDark],
        }
    },
    mounted() {
        const source = sessionStorage.getItem('gcodeSource')
        this.source = source
        this.codeSource = decodeURIComponent(this.source)
        this.handleRun()
    },
    methods: {
        onCtrlSClick(event) {
            event.preventDefault()
            this.handleRun()
        },
        handleRun() {
            fetch(`/updateTemp?codesource=${encodeURIComponent(this.codeSource)}`)
        },
        handleReset() {
            const res = window.confirm('确认要重置吗？')
            if (res) {
                const code = sessionStorage.getItem('gcodeSource')
                this.source = code
                this.codeSource = decodeURIComponent(this.source)
            }
        },
        handleRefresh() {
            this.$refs.gframe.contentWindow.location.reload()
        },
    },
}
</script>

<template>
  <ClientOnly>
    <div class="kf-preview-block">
      <div class="operate-container">
        <span class="btn-0" @click="handleRun"> 运行(ctrl + s) </span>
        <span class="btn-0" @click="handleReset"> 重置代码 </span>
        <span class="btn-0" @click="handleRefresh"> 刷新效果 </span>
      </div>
      <div class="preview-panel">
        <div class="preview-source" @keydown.ctrl.s="onCtrlSClick">
          <Codemirror
            v-model="codeSource" placeholder="Code goes here..." :autofocus="true" language="javascript"
            :extensions="extensions" :indent-with-tab="true" :tab-size="2"
          />
        </div>
        <div class="preview-code">
          <iframe ref="gframe" src="/gpreview" />
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<style>
/* 重写样式 ==============start============== */
.navbar {
    display: none;
}
.theme-default-content {
    max-width: 100% !important;
}
iframe {
    width: 100%;
    height: 100%;
}

/* 重新样式 ===============end============= */
.kf-preview-block .btn-0 {
    color: #1f93ff;
    cursor: pointer;
    margin-left: 16px;
}
.kf-preview-block {
    background: #fff;
    display: flex;
    flex-direction: column;
    border: solid 1px #ebebeb;
    border-radius: 3px;
    transition: 0.3s;
    height: 85vh;
    overflow: hidden;
}
.kf-preview-block .operate-container {
    text-align: right;
    padding-right: 40px;
    border-bottom: solid 1px #ebebeb;
}
.kf-preview-block .preview-header {
    display: flex;
    align-items: center;
    height: 60px;
}
.kf-preview-block .preview-panel {
    display: flex;
    flex: 1;
    overflow: hidden;
}
.kf-preview-block .preview-source {
    display: block;
    width: 50%;
    background-color: #f3f4f5;
    overflow: auto;
}
.kf-preview-block .preview-code {
    display: block;
    width: 50%;
    padding: 24px;
}
.kf-preview-block .CodeMirror.cm-s-monokai {
    height: 100%;
}
</style>
