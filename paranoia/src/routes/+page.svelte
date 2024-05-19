<script>
  import { onMount } from 'svelte';

  let newQuestion = '';
  let votes = [];
  let questions = {};
  let userId = null;
  let examples = [];
  let onlineCount = 0;
  let onlineStatus = false;
  let displayQuestions = {};

  onMount(async () => {
    await getUserId();
    await getQuestions();
    // check localstorage for votes
    if (localStorage.getItem('votes')) {
      votes = JSON.parse(localStorage.getItem('votes'));
    }
    const response = await fetch('/examples.txt');
    const data = await response.text();
    examples = data.split('\n');
    examples = examples.map((example) => example.trim());
    typeExample();
    longPoll();
    getOnlineCount();
    setInterval(getOnlineCount, 10000);
  });

  // constant enforcement
  $: {
    newQuestion = newQuestion.replace(/[^a-zA-Z0-9 ]/g, '');
    if (newQuestion.length > 0 && newQuestion[0] === ' ') {
      newQuestion = newQuestion.trimStart();
    }
  }

  $: {
    displayQuestions = {};
    for (const question in questions) {
      displayQuestions[question] = {
        votes: questions[question].votes + (votes.includes(question) ? 1 : 0),
        timestamp: questions[question].timestamp,
      };
    }
  }

  async function typeExample() {
    const example = examples[Math.floor(Math.random() * examples.length)];
    const questionInput = document.getElementById('questionInput');
    // type letters one at a time
    for (let i = 23; i <= example.length; i++) {
      questionInput.placeholder = example.slice(0, i);

      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    // pause at fully typed
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // delete one by one
    for (let i = example.length; i >= 23; i--) {
      questionInput.placeholder = example.slice(0, i);
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    setTimeout(typeExample, 100);
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
    const result = await getQuestions(1);
    if (!result) {
      return;
    }
    setTimeout(longPoll, 100);
  }

  async function getQuestions(poll=0) {
    const response = poll ? await fetch(`/api/questions?userId=${userId}`) : await fetch('/api/questions');
    const data = await response.json();
    let resQuestions = data.questions;

    if (data.votes[userId]) {
      for (const vote of data.votes[userId].questions) {
        resQuestions[vote].votes -= 1;
      }
    }
    questions = resQuestions;
    if (response.status === 400) {
      console.error(data.error);
    }
    return response.status === 200;
  }

  async function addQuestion() {
    const btn = document.getElementById('addQuestionButton');
    btn.classList.add('animate-spin'); setTimeout(() => btn.classList.remove('animate-spin'), 250);
    const input = newQuestion.trim();
    newQuestion = '';
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: input }),
    });
    const data = await response.json();
    if (response.status === 400) {
      console.error(data.error);
      return;
    }
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

  async function getOnlineCount() {
    const response = await fetch(`/api/online?userId=${userId}`);
    const data = await response.json();
    onlineCount = data.count;
    onlineStatus = data.online;
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
<div class="fixed h-[20px] top-0 left-0 right-0 bg-gray-200 flex justify-center z-10">
  <span class="flex items-center">
    <span class="inline-block w-2 h-2 mt-[2px] {onlineStatus ? "bg-green-500" : "bg-red-500"} rounded-full mr-2"></span>
    {onlineCount} online
  </span>
</div>
<div class="container mx-auto mt-[2vh] p-4 min-h-screen h-full flex flex-col bg-gray-200">
  <div id="viewAll">
    <ul class="list-none p-0 flex-grow overflow-y-auto mb-16 relative">
      {#each Object.keys(displayQuestions).sort((a, b) => {
        if (displayQuestions[b].votes === displayQuestions[a].votes) {
          return displayQuestions[b].timestamp - displayQuestions[a].timestamp;
        }
        return displayQuestions[b].votes - displayQuestions[a].votes;
      }) as question}
        <li on:click={handleTapQuestion} class="relative shadow flex justify-between overflow-hidden mb-2 rounded transition {votes.includes(question) ? 'bg-purple-200 ' : 'bg-white'}">
          <span class="m-2">{question}</span>
          <span class="flex items-center px-2 bg-purple-800 text-white">
            {displayQuestions[question].votes}
          </span>
        </li>
      {/each}
    </ul>
    <div class="fixed bottom-0 left-0 right-0 px-4 py-1 bg-gray-200 shadow-lg">
      <div class="flex items-center">
        <textarea
          id="questionInput"
          type="text"
          rows="2"
          bind:value={newQuestion}
          on:keypress={handleKeyPress}
          placeholder="who is most likely to"
          class="p-2 flex-grow border rounded"
        />
        <button
          id = "addQuestionButton"
          on:click={(e) => { addQuestion(); }}
          class="relative overflow-hidden p-2 ml-2 bg-purple-800 text-white rounded-full"
          style="width: 40px; height: 40px;"
        >
          <span class="material-icons">add</span>
        </button>
      </div>
    </div>
  </div>
</div>
