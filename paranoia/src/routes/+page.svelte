<script>
  import { onMount } from 'svelte';
  import { questions } from '$lib/stores';
  import { swipe } from 'svelte-gestures';

  let newQuestion = '';
  let favQuestions = [];

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

  function rippleEffect(event) {
    const btn = event.currentTarget;

    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - (btn.offsetLeft + radius)}px`;
    circle.style.top = `${event.clientY - (btn.offsetTop + radius)}px`;
    circle.classList.add("ripple");

    const ripples = btn.getElementsByClassName("ripple");
    if (ripples.length >= 10) {
      ripples[0].remove();
    }

    btn.appendChild(circle);
  }

  function handleSwipe(event) {
    const cover = document.getElementById('cover');
    const viewAll = document.getElementById('viewAll');
    const viewFav = document.getElementById('viewFav');
    if (event.detail.direction === 'left' && viewAll.classList.contains('hidden')) {
      cover.classList.remove('hidden');
      cover.classList.add('animate-right');
      setTimeout(() => {
        viewFav.classList.add('hidden');
        viewAll.classList.remove('hidden');
      }, 250);

    } else if (event.detail.direction === 'right' && viewFav.classList.contains('hidden')) {
      cover.classList.remove('hidden');
      cover.classList.add('animate-left');
      setTimeout(() => {
        viewFav.classList.remove('hidden');
        viewAll.classList.add('hidden');
      }, 250);
    }
  }

  function onSwipeEnd() {
    const cover = document.getElementById('cover');
    cover.classList.add('hidden');
    cover.classList.remove('animate-right', 'animate-left');
  }

  function onRippleEnd(event) {
    event.target.classList.remove('ripple');
  }

</script>

<div use:swipe={{ timeframe: 300, minSwipeDistance: 60 }} on:swipe={handleSwipe} class="container mx-auto p-4 h-screen flex flex-col">
  <div on:animationend={onSwipeEnd} id="cover" class="absolute top-0 bottom-0 w-0 bg-white z-10 hidden"></div>
  <div id="viewAll">
    <ul class="list-none p-0 flex-grow overflow-y-auto mb-16 relative">
      {#each $questions as question}
        <div on:dblclick={e => favQuestions.includes(question) ? favQuestions = favQuestions.filter(q => q !== question) : favQuestions = [...favQuestions, question]}>
          <li on:animationend={onRippleEnd} on:click={rippleEffect} class="relative overflow-hidden p-2 mb-2 {favQuestions.includes(question) ? "bg-gray-300" : "bg-gray-100"} rounded">{question.question}</li>
        </div>

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
  <div id="viewFav" class="hidden">
    <ul class="list-none p-0 flex-grow overflow-y-auto mb-16 relative">
      {#each favQuestions as question}
        <div on:dblclick={e => favQuestions.includes(question) ? favQuestions = favQuestions.filter(q => q !== question) : favQuestions = [...favQuestions, question]}>
          <li on:animationend={onRippleEnd} on:click={rippleEffect} class="relative overflow-hidden p-2 mb-2 bg-gray-100 rounded">{question.question}</li>
        </div>
      {/each}
  </div>
</div>
