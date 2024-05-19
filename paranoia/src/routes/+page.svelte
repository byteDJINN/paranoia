<script>
  import { onMount } from 'svelte';

  let newQuestion = '';
  let votes = [];
  let questions = {};
  let userId = null;
  let examples = [];
  let onlineCount = 0;

  onMount(async () => {
    await getQuestions();
    await getUserId();
    // check localstorage for votes
    if (localStorage.getItem('votes')) {
      votes = JSON.parse(localStorage.getItem('votes'));
    }
    const response = await fetch('/examples.txt');
    const data = await response.text();
    examples = data.split('\n');
    examples = examples.map((example) => example.trim());
    typeExample();
    await getQuestions(1); // first long poll request is consumed for alive
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
    if (data.votes[userId]) {
      votes = data.votes[userId].questions;
    }
    questions = data.questions;
    if (response.status === 400) {
      console.error(data.error);
    }
    return response.status === 200;
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

  async function getOnlineCount() {
    const response = await fetch('/api/online');
    const data = await response.json();
    onlineCount = data.count;
  }


  function handleTapQuestion(event) {
    //rippleEffect(event);
    // votes is a list
    // get the question text by getting the first span
    const question = event.currentTarget.querySelector('span').textContent;
    const index = votes.findIndex((vote) => vote === question);
    if (index === -1) {
      votes = [...votes, question];
      questions = {
        ...questions,
        [question]: {
          ...questions[question],
          votes: questions[question].votes + 1,
        },
      };
    } else {
      votes = votes.filter((vote) => vote !== question);
      questions = {
        ...questions,
        [question]: {
          ...questions[question],
          votes: questions[question].votes - 1,
        },
      };
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
    <span class="inline-block w-2 h-2 mt-[2px] bg-green-500 rounded-full mr-2"></span>
    {onlineCount} online
  </span>
</div>
<div class="container mx-auto mt-[2vh] p-4 min-h-screen h-full flex flex-col bg-gray-200">
  <div id="viewAll">
    <ul class="list-none p-0 flex-grow overflow-y-auto mb-16 relative">
      {#each Object.keys(questions).sort((a, b) => {
        if (questions[b].votes === questions[a].votes) {
          return questions[b].timestamp - questions[a].timestamp;
        }
        return questions[b].votes - questions[a].votes;
      }) as question}
        <li on:click={handleTapQuestion} class="relative shadow flex justify-between overflow-hidden mb-2 rounded transition {votes.includes(question) ? 'bg-purple-200 ' : 'bg-white'}">
          <span class="m-2">{question}</span>
          <span class="flex items-center px-2 bg-purple-800 text-white">
            {questions[question].votes}
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
