<script lang="ts">
import { onMount } from 'svelte';


onMount(() => {

});

</script>

<main class="p-4">
  <h1 class="text-2xl font-bold">Items List</h1>
  <input id="new-item" placeholder="Add new item" class="border p-2 my-4" />

  <ul>
    <li class="border p-2 my-2">Item 1</li>
    <li class="border p-2 my-2">Item 2</li>
    <li class="border p-2 my-2">Item 3</li>
  </ul>
</main>
