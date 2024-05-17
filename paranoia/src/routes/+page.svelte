<script>
  import { onMount } from 'svelte';
  import { questions } from '$lib/stores';

  let newQuestion = '';

  onMount(async () => {
    await getQuestions();
  });

  // constant enforcement
  $: {
    newQuestion = newQuestion.replace(/[^a-zA-Z0-9 ]/g, '');
    if (newQuestion.length > 0 && newQuestion[0] === ' ') {
      newQuestion = newQuestion.trimStart();
    }
  }


  async function getQuestions() {
    const response = await fetch('/api/questions');
    const data = await response.json();
    questions.set(data.results);
  }

  async function addQuestion() {
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newQuestion }),
    });
    const data = await response.json();
    if (response.status === 400) {
      console.error(data.error);
      return;
    }
    await getQuestions();
    newQuestion = '';
  }
</script>

<div class="container mx-auto p-4 h-screen flex flex-col">
  <ul class="list-none p-0 flex-grow overflow-y-auto mb-16">
    {#each $questions as question}
      <li class="p-2 mb-2 bg-gray-100 rounded">{question.question}</li>
    {/each}
  </ul>
  <div class="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg">
    <div class="flex items-center">
      <input
        type="text"
        bind:value={newQuestion}
        placeholder="Add a new question"
        class="p-2 flex-grow border rounded"
      />
      <button
        on:click={addQuestion}
        class="p-2 ml-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center justify-center"
        style="width: 40px; height: 40px;"
      >
        <span class="material-icons">add</span>
      </button>
    </div>
  </div>
</div>
