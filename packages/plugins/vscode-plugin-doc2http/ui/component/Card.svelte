<script>
  import { copyInnerText } from "../action/copy";

  export let head = "";
  export let data = [];
</script>

<div class="ui-card">
  <div class="ui-card-head"><span>{head}</span><slot name="right"></slot></div>
  <div class="ui-card-body">
    <slot>
      {#each data as item}
        <div class="param">
          <div>
            <span class="name" use:copyInnerText>{item.name}</span>
            <span class="type">{item.type}</span>
            {#if item.description}
              <span class="description text">{item.description}</span>
            {/if}
            <span class="required">{item.required ? "必需" : ""}</span>
          </div>
          {#if item.example}
            <div class="example">
              示例值：<span class="text bg">{item.example}</span>
            </div>
          {/if}
        </div>
      {/each}
    </slot>
  </div>
</div>

<style>
  .ui-card {
    border: 1px solid #f2f4f7;
    margin-bottom: 12px;
  }

  .ui-card-head {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    color: rgba(16, 24, 40, 0.8);
    border-bottom: 1px solid #f2f4f7;
    font-weight: 500;
  }
  .ui-card-body {
    padding: 12px;
    line-height: 22px;
  }
  .name {
    height: 22px;
    margin-right: 8px;
    padding: 0 8px;
    color: #1890ff;
    font-weight: 600;
    font-size: 12px;
    line-height: 22px;
    background-color: rgba(24, 144, 255, 0.04);
    border-radius: 4px;
  }
  .type {
    color: rgba(16, 24, 40, 0.64);
    font-weight: 500;
    font-size: 14px;
    margin-right: 8px;
  }
  .description {
    margin: 0 8px;
  }
  .required {
    color: orange;
    border-radius: 4px;
    font-size: 12px;
    height: 22px;
    line-height: 22px;
    padding: 0 8px;
  }
  .example {
    color: rgba(16, 24, 40, 0.56);
    font-size: 12px;
    padding-left: 8px;
  }

  .text {
    color: rgba(16, 24, 40, 0.56);
    font-size: 12px;
  }

  .bg {
    font-weight: 400;
    padding: 0px 8px;
    background: #fcfcfd;
    border-radius: 4px;
    border: 0.5px solid #eaecf0;
    min-height: 22px;
    line-height: 160%;
    word-break: break-all;
  }
</style>
