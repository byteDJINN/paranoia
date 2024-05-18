<script>
  import { onMount } from 'svelte';

  let newQuestion = '';
  let votes = [];
  let questions = {};
  let userId = null;

  onMount(async () => {
    await getQuestions();
    await getUserId();
    // check localstorage for votes
    if (localStorage.getItem('votes')) {
      votes = JSON.parse(localStorage.getItem('votes'));
    }

    longPoll();
  });

  // constant enforcement
  $: {
    newQuestion = newQuestion.replace(/[^a-zA-Z0-9 ]/g, '');
    if (newQuestion.length > 0 && newQuestion[0] === ' ') {
      newQuestion = newQuestion.trimStart();
    }
  }
  
  async function getUserId() {
    // check local storage
    const localUserId = localStorage.getItem('userId');
    if (localUserId) {
      userId = localUserId;
      return;
    }
    const response = await fetch('/api/users');
    const data = await response.json();
    userId = data.userId;
    localStorage.setItem('userId', userId);
  }

  async function longPoll() {
    await getQuestions(1);
    longPoll();
  }

  async function getQuestions(poll=0) {
    const response = await fetch(`/api/questions?poll=${poll}`);
    const data = await response.json();
    questions = data;
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
    newQuestion = '';
  }

  async function submitVotes() {
    const response = await fetch('/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: votes, userId: userId }),
    });
    const data = await response.json();
    if (response.status === 400) {
      console.error(data.error);
      return;
    }
  }


  function handleTapQuestion(event) {
    //rippleEffect(event);
    // votes is a list
    // get the question text by getting the first span
    const question = event.currentTarget.querySelector('span').textContent;
    const index = votes.findIndex((vote) => vote === question);
    if (index === -1) {
      votes = [...votes, question];
    } else {
      votes = votes.filter((vote) => vote !== question);
    }
    localStorage.setItem('votes', JSON.stringify(votes));
    submitVotes();
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addQuestion();
    }
  }


</script>

<div class="container mx-auto p-4 h-screen flex flex-col bg-gray-100">
  <div id="viewAll">
    <ul class="list-none p-0 flex-grow overflow-y-auto mb-16 relative">
      {#each Object.keys(questions).sort((a, b) => questions[b].votes - questions[a].votes) as question}
        <li on:click={handleTapQuestion} class="relative overflow-hidden p-2 mb-2 rounded transition {votes.includes(question) ? 'bg-purple-200 ' : 'bg-white'}">
          <span class="ml-2">{question}</span>
          <span class="absolute right-0 top-0 bottom-0 flex items-center px-2 bg-purple-800 text-white">
            {questions[question].votes}
          </span>
        </li>
      {/each}
    </ul>
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg">
      <div class="flex items-center">
        <input
          type="text"
          bind:value={newQuestion}
          on:keypress={handleKeyPress}
          placeholder="Add a new question"
          class="p-2 flex-grow border rounded"
        />
        <button
          on:click={(e) => { addQuestion(); e.target.classList.add('animate-spin'); setTimeout(() => e.target.classList.remove('animate-spin'), 250); }}
          class="relative overflow-hidden p-2 ml-2 bg-purple-800 text-white rounded-full"
          style="width: 40px; height: 40px;"
        >
          <span class="material-icons">add</span>
        </button>
      </div>
    </div>
  </div>
</div>
