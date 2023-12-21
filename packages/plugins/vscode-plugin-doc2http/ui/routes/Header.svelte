<script>
	import { copyInnerText } from "../action/copy";
	export let data = {};
</script>

<section>
	<h1>
		{data.name}
	</h1>
	<div class="flex items-center">
		<span class={data.method + " method"}>{data.method}</span>
		<span class="api" use:copyInnerText>{data.path}</span>
	</div>
  <div>{data.description}</div>
</section>

<style>
	h1 {
		font-weight: 600;
		font-size: 34px;
	}
	.method {
		display: inline-block;
		background-color: orange;
		padding-top: 0.1rem;
		padding-bottom: 0.1rem;
		padding-right: 5px;
		padding-left: 5px;
		color: #fff;
		font-weight: 700;
		display: inline-flex !important;
		align-items: center;
		height: 24px;
		margin-right: 4px;
		font-size: 12px;
		border-radius: 4px;
	}
	.get {
		background-color: #4caf50;
	}
	.post {
		background-color: #fa8c16;
	}
	.put {
		background-color: #1890ff;
	}
	.delete {
		background-color: #f5222d;
	}
	.api {
		font-weight: 700;
		cursor: pointer;
		color: rgba(16, 24, 40, 0.8);

		&:hover {
			text-decoration: underline;
			-webkit-text-decoration-style: dashed;
			text-decoration-style: dashed;
		}
	}
</style>
