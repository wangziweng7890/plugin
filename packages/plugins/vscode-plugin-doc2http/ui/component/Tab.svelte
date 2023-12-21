<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    export let data = [];
    export let value = "";
</script>

<div class="box">
    {#each data as item (item.value)}
        <div
            class="cursor"
            class:select={value === item.value}
            on:click={() => dispatch("change", item.value)}
        >
            {item.label}
        </div>
    {/each}
</div>

<style>
    .box {
        display: flex;
    }
    .cursor {
        color: rgba(16, 24, 40, 0.75);
        cursor: pointer;
        border-radius: 4px;
        line-height: 20px;
        padding: 4px;
        min-width: 68px;
        text-align: center;
        border-bottom: 1px solid #f2f4f7;
        background-color: gba(16, 24, 40, 0.2);
        margin-right: 4px;
        margin-bottom: -1px;
    }
    .select {
        color: rgba(16, 24, 40, 1);
        border: 1px solid #f2f4f7;
        border-bottom: 1px solid transparent;
        background-color: #fff;
    }
</style>
