<script>
	import TreeItem from "./TreeItem.svelte";
	export let data = [];
	export let dep = 0;
</script>

{#each data as item}
	<TreeItem {item} {dep} />
{/each}

<style>
</style>
