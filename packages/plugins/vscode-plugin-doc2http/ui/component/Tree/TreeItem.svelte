<script>
    import Down from "../../svg/down.svelte";
    import Right from "../../svg/right.svelte";
    import Tree from "./Tree.svelte";
    import { copyInnerText } from "../../action/copy";
    export let item;
    export let dep;

    export let expanded = true;
    function toggle() {
        expanded = !expanded;
    }
</script>

<div style="padding-left: {dep * 24}px;">
    {#if item.children?.length}
        <span on:click={toggle}>
            {#if expanded}
                <Down className="svg-inline--fa fa-sm sl-icon" />
            {:else}
                <Right className="svg-inline--fa fa-sm sl-icon" />
            {/if}
        </span>
    {:else}
        <span class="block" />
    {/if}
    <span class="name" use:copyInnerText>{item.name}</span>
    <span class="type">{item.type}</span>
    {#if item.title}
      <span class="description">{item.title}</span>
    {/if}
    {#if item.required}
        <span class="required">必需</span>
    {/if}
    {#if item.enum?.length > 0}
      <div class="description"><span class="block" />枚举值: [{item.enum.toString()}]</div>
    {/if}
    {#if item.description}
      <div class="description"><span class="block" />{item.description}</div>
    {/if}
    <div></div>
</div>

{#if expanded && item.children?.length}
    <Tree data={item.children} dep={dep + 1} />
{/if}

<style>
    .block {
        width: 12px;
        display: inline-block;
    }
    .svg-inline--fa {
        font-size: 12px;
        cursor: pointer;
        width: 12px;
        height: 12px;
        vertical-align: baseline;
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
        color: rgba(16, 24, 40, 0.56);
        font-size: 12px;
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

    .expanded {
        /* background-image: url(tutorial/icons/folder-open.svg); */
    }

    .fa-sm {
        font-size: 0.875em;
        line-height: 0.0714285718em;
        vertical-align: 0.0535714295em;
    }
</style>
