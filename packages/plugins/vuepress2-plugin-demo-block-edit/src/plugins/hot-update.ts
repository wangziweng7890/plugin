
import type { Plugin, ViteDevServer, Connect } from 'vite'

export function HotUpdate(app): Plugin {
    return {
        name: 'hotUpdate-galaxy2',
        configureServer(server: ViteDevServer) {
            server.middlewares.use('/updateTemp', async function (req: Connect.IncomingMessage, res, next) {
                if (req.method === 'GET' && (req.originalUrl as string).includes('/updateTemp')) {
                    const codesource = (req.originalUrl as string)?.split('/updateTemp?codesource=')?.[1];
                    codesource && await updateTempVue(decodeURIComponent(codesource), app);
                    return next();
                }
                return next();
            })
        }
    }
}

const galaxyTemplate = `<script setup>
                import {ref} from 'vue';
import test from '@@/test.vue'
                var a = ref('66');
            </script>
            <template>
                <div>{{a}}</div>
                <input type="text" v-model="a">

<p>=====================</p>
<test/>
            </template>

<style>
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
</style>
`
const defaultStyle = `
<style>
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
</style>`
function updateTempVue(content, app) {
    return app.writeTemp('tempCode.vue', [content, defaultStyle].join('\n'));
}
