<template>
	<!-- 树组件 -->
	<div class="selection-tree">
		<div class="node-row">
			<div class="node-label">{{ tree[labelPropertyName] }}</div>	
			<div class="node-selections">
				<div v-for="selection in selectionList">
					<div v-if="tree[selection.id] !== undefined">
						<input type="checkbox" v-model="tree[selection.id]" @change="single(tree[selection.id])">
					</div>
				</div>
			</div>
		</div>

		<selection-tree v-for="auth in tree[childrenKeyName]"
		  :key="auth[nodeId]"
		  :treeId="treeId"
		  :tree="auth" 
		  :labelPropertyName="labelPropertyName"
		  :nodeId="nodeId"
		  :childrenKeyName="childrenKeyName"
		  :selectionList="selectionList"
		  :selectionEnabled="selectionEnabled">
		</selection-tree>
	</div>
</template>

<script>

export default {
	name: 'SelectionTree',

	props: {
		treeId: {
			type: String,
			default: '',
		},

		tree: {
			type: Object,
			default: () => ({}),
		},

		labelPropertyName: {
			type: String,
			default: '',
		},

		nodeId: {
			type: String,
			default: '',
		},

		childrenKeyName: {
			type: String,
			default: '',
		},

		selectionList: {
			type: Array, 
			default: () => ([]),
		},

		selectionEnabled: {
			type: Boolean,
			default: '',
		},

	},

	methods: {
		single: function(selected) {
      this.$globalEventBus.$emit(`${this.treeId} selection tree selected`, {
				node_id: this.tree[this.nodeId],
				selected
			});
		}
	},
}

</script>