

<template>
    <ClientOnly>
        <div class="kf-demo-block" :class="[{ hover: hovering }]" @mouseenter="hovering = true"
            @mouseleave="hovering = false">
            <!-- danger here DO NOT USE INLINE SCRIPT TAG -->
            <p text="sm" class="description-sm" v-html="decodedDescription" />

            <div class="example">
                <component :is="formatPathDemos[path]"></component>
            </div>
            <transition name="code-slide">
                <div v-show="sourceVisible" class="example-source-wrapper">
                    <div class="example-source language-vue" v-html="decodedCode" />
                </div>
            </transition>
            <div ref="control" :class="['kf-demo-block-control', { 'is-fixed': sourceVisible }]"
                @click="toggleSourceVisible(!sourceVisible)">
                <transition name="text-slide">
                    <i v-show="hovering || sourceVisible">{{ iconClass }}</i>
                </transition>
                <transition name="text-slide">
                    <span v-show="hovering || sourceVisible" class="btn-0">{{ controlText }}</span>
                </transition>
                <div class="control-button-container">
                    <span v-show="hovering || sourceVisible" size="small" type="text" class="control-button copy-button btn-0"
                        @click.stop="handleCopy">
                        {{ copyMessage }}
                    </span>
                    <transition name="text-slide">
                        <span v-show="hovering || sourceVisible" class="control-button run-online-button btn-0"
                            @click.stop="handleCodeView">
                            在线运行
                        </span>
                    </transition>
                </div>
            </div>
        </div>
    </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToggle } from '@vueuse/core'
const props = defineProps<{
    demos: object
    source: string
    path: string
    rawSource: string
    description?: string
}>()
function copy(content) {
    const textarea = document.createElement('textarea')
    textarea.readOnly = true
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'
    // 将要 copy 的值赋给 textarea 标签的 value 属性
    textarea.value = content
    // 将 textarea 插入到 body 中
    document.body.appendChild(textarea)
    // 选中值并复制
    textarea.select()
    textarea.setSelectionRange(0, textarea.value.length)
    const result = document.execCommand('copy')
    document.body.removeChild(textarea)
    return result
}
let hovering = ref(false);
let copyMessage = ref('复制代码');

const [sourceVisible, toggleSourceVisible] = useToggle()

const formatPathDemos = computed(() => {
    return props.demos
})
const iconClass = computed(() => {
    return sourceVisible.value ? '▲' : '▼';
})
const controlText = computed(() => {
    return sourceVisible.value ? '隐藏代码' : '显示代码';
})

const decodedDescription = computed(() =>
    decodeURIComponent(props.description!)
)
const decodedCode = computed(() =>
    decodeURIComponent(props.source!)
)

async function handleCopy() {
    copy(decodeURIComponent(props.rawSource));
    copyMessage.value = '复制成功🎉';
    setTimeout(() => {
        copyMessage.value = '复制代码';
    }, 2000);
}

function handleCodeView() {
    sessionStorage.setItem('gcodeSource', props.rawSource);
    window.open('/gedit');
}

</script>

<style lang="scss">
.kf-demo-block {
    position: relative;
    border: solid 1px #ebebeb;
    padding: 20px;
    border-radius: 3px;
    transition: 0.3s;
    // .code-slide-enter,
    // .code-slide-enter-active,
    // .code-slide-leave,
    // .code-slide-leave-active {
    //     transition:
    //         0.3s max-height ease-in-out,
    //         0.3s padding-top ease-in-out,
    //         0.3s padding-bottom ease-in-out;
    // }

    .description-sm {
        margin-bottom: 1em;
    }
    
    .example {
        margin-bottom: 20px;
    }
    .btn-0 {
        color: #1f93ff;
        cursor: pointer;
        margin-left: 16px;
    }
    &.hover {
        box-shadow: 0 0 8px 0 rgb(232 237 250 / 60%), 0 2px 4px 0 rgb(232 237 250 / 50%);
    }
    .language-vue code {
        font-family: Menlo, Monaco, Consolas, Courier, monospace;
    }
    .demo-button {
        float: right;
    }
    .source {
        padding: 24px;
    }
    .meta {
        border-top: solid 1px #eaeefb;
        overflow: hidden;
        height: 0;
        transition: height 0.3s;
    }
    .description {
        padding: 20px;
        box-sizing: border-box;
        border: solid 1px #ebebeb;
        border-radius: 3px;
        font-size: 14px;
        line-height: 22px;
        color: #666;
        word-break: break-word;
        margin: 10px;
        p {
            margin: 0;
            line-height: 26px;
        }
    }
    .highlight {
        div[class*="language-"] {
            border-radius: 0;
        }
    }
    #highlight {
        & > .language-vue > .language-vue {
            padding-top: 0;
            margin-top: 0;
        }
    }
    .kf-demo-block-control {
        position: relative;
        z-index: 9;
        border-top: solid 1px #eaeefb;
        height: 44px;
        box-sizing: border-box;
        // border-bottom-left-radius: 4px;
        // border-bottom-right-radius: 4px;
        border: 1px solid #d3dce6;
        background-color: #eaeefb;
        text-align: center;
        margin-top: -1px;
        color: #d3dce6;
        cursor: pointer;
        &.is-fixed {
            position: sticky;
            top: 0;
            bottom: 0px;
        }
        >i {
            position: absolute;
            transform: translateX(-30px);
            font-size: 14px;
            line-height: 44px;
            // transition: 0.3s;
            display: inline-block;
            color: #1f93ff;
        }
        >span {
            position: absolute;
            transform: translateX(-30px);
            font-size: 14px;
            line-height: 44px;
            transition: 0.3s;
            display: inline-block;
        }
        &:hover {
            // background-color: #f9fafc;
        }
        & .text-slide-enter,
        & .text-slide-leave-active {
            opacity: 0;
            transform: translateX(10px);
        }
        .control-button-container {
            line-height: 40px;
            position: absolute;
            top: 0;
            right: 0;
            padding-left: 5px;
            padding-right: 25px;
        }
        .control-button {
            font-size: 14px;
            margin: 0 10px;
        }
    }
}
</style>
