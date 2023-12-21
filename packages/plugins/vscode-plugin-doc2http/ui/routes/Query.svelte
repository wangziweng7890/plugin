<script>
  import Card from "../component/Card.svelte";
  import Tree from "../component/Tree/Tree.svelte";
  import { dep } from "../utils/index";
  import jsonToHtml from "json-pretty-html";
  import { copyInnerText } from "../action/copy";

  export let data = {};
  $: parameters = data.parameters || {};
  $: requestBody = data.requestBody || {};

  let treeData = [];
  $: {
    const jsonSchema = requestBody.jsonSchema;
    if (Object.keys(jsonSchema?.properties || {}).length) {
      const properties = jsonSchema.properties;
      const required = jsonSchema.required;
      treeData = dep(properties, required);
    } else {
      treeData = [];
    }
  }


  let responseExample = "";
  let example = "";
  $: {
    let data = requestBody.example
    example = data ? data : "";
    responseExample = example ? jsonToHtml(JSON.parse(example)) : "";
  }
</script>

<section>
  <h2 class="group-title">请求参数</h2>
  {#if parameters.query?.length}
    <Card head="Query 参数" data={parameters.query} />
  {/if}
  {#if parameters.header?.length}
    <Card head="Header 参数" data={parameters.header} />
  {/if}
  <div class="flex">
    <div class="flex-2">
      {#if requestBody.parameters?.length > 0}
        <Card head="Body 参数 ({requestBody.type})" data={requestBody.parameters} />
      {/if}
      {#if treeData.length > 0}
        <Card head="Body 参数 ({requestBody.type})">
          <Tree data={treeData} />
        </Card>
      {/if}
    </div>
    {#if example}
      <div class="flex-1">
        <Card head="示例">
          <div slot="right" use:copyInnerText={example}>复制</div>
          <div>{@html responseExample}</div>
        </Card>
      </div>
    {/if}
  </div>
</section>
