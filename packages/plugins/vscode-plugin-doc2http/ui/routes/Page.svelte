<script>
	import Header from './Header.svelte';
	import Query from './Query.svelte';
	import Response from './Response.svelte';
	import './styles.css';
	import { apiData } from '../store/api';

	window.addEventListener('message', function(event) {
		const message = event.data
    console.log('message' ,message);
		$apiData = message;
	})

</script>

<div class="app">
	<Header data={$apiData} />
	<Query data={$apiData}/>
	<Response data={$apiData}/>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		padding-left: 48px;
		padding-top: 24px;
	}
</style>
