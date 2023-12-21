<script>
  import Tab from "../component/Tab.svelte";
  import Card from "../component/Card.svelte";
  import Tree from "../component/Tree/Tree.svelte";
  import { dep } from "../utils/index";
  import jsonToHtml from "json-pretty-html";
  import { copyInnerText } from "../action/copy";

  export let data = {};

  let activeTab = "";
  let responses = [];
  $: {
    responses = data.responses || [];
    activeTab = responses?.[0]?.id;
  }

  let treeData = [];
  $: {
    const response = responses.find((response) => response.id === activeTab);
    if (response) {
      const jsonSchema = response.jsonSchema;
      const properties = jsonSchema.properties;
      const required = jsonSchema.required;
      if (jsonSchema.properties) {
        treeData = dep(properties, required);
      } else {
        treeData = [
          {
            type: `array[${jsonSchema.items.type}]`,
            description: jsonSchema.description,
            title: jsonSchema.title,
          },
        ];
      }
    } else {
      treeData = [];
    }
  }
  $: responseExamples = data.responseExamples || [];

  let responseExample = '';
  let example = '';
  $: {
    let data = responseExamples.find((item) => item.id)?.data;
    example = data ? data : ''
    console.log('example', data);
    try {
      responseExample = example ? jsonToHtml(JSON.parse(data)) : "";
    } catch {

    }
  }

  $: list = responses.map((item) => {
    return {
      label: `${item.name}(${item.code})`,
      value: item.id,
    };
  });
</script>

<section>
  <h2 class="group-title">返回响应</h2>
  <Tab on:change={(event) => (activeTab = event.detail)} value={activeTab} data={list} />
  <div class="flex">
    <div class="flex-2">
      <Card head="数据结构">
        <Tree data={treeData} />
      </Card>
    </div>

    {#if responseExample}
      <div class="flex-1">
        <Card head="示例">
          <div slot="right" use:copyInnerText={example}>复制</div>
          <div>{@html responseExample}</div>
        </Card>
      </div>
    {/if}
  </div>
</section>

<style>
</style>
