<script>
  import { onMount } from 'svelte';
  import { questions } from '$lib/stores';

  let newQuestion = '';

  onMount(async () => {
    const response = await fetch('/api/questions');
    const data = await response.json();
    questions.set(data.results);
  });

  async function addQuestion() {
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newQuestion }),
    });
    const data = await response.json();
    questions.update((questions) => [...questions, newQuestion]);
    newQuestion = '';
  }
</script>

<style>
  .question-list {
    list-style-type: none;
    padding: 0;
  }

  .question-item {
    padding: 8px;
    margin: 4px 0;
    background: #f4f4f4;
  }

  .add-question {
    display: flex;
    flex-direction: column;
    margin: 16px 0;
  }

  .add-question input {
    padding: 8px;
    margin-bottom: 8px;
  }

  .add-question button {
    padding: 8px;
  }
</style>

<div>
  <h1>Paranoia Questions</h1>
  <ul class="question-list">
    {#each $questions as question}
      <li class="question-item">{question.text}</li>
    {/each}
  </ul>
  <div class="add-question">
    <input type="text" bind:value={newQuestion} placeholder="Add a new question" />
    <button on:click={addQuestion}>Add Question</button>
  </div>
</div>
