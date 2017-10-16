function* generator () {
  yield 'only'
}
var g = generator()
console.log(g.next())
// <- { done: false, value: 'only' }
console.log(g.next())
// <- { done: true }
console.log(g.next())
// <- { done: true }

/**************************************************************/

function* numbers () {
  yield 1
  yield 2
  return 3
  yield 4
}
console.log([...numbers()])
// <- [1, 2]
console.log(Array.from(numbers()))
// <- [1, 2]
for (let n of numbers()) {
  console.log(n)
  // <- 1
  // <- 2
}
var g = numbers()
console.log(g.next())
// <- { done: false, value: 1 }
console.log(g.next())
// <- { done: false, value: 2 }
console.log(g.next())
// <- { done: true, value: 3 }
console.log(g.next())
// <- { done: true }
/**************************************************************/
var answers = [
  `It is certain`, `It is decidedly so`, `Without a doubt`,
  `Yes definitely`, `You may rely on it`, `As I see it, yes`,
  `Most likely`, `Outlook good`, `Yes`, `Signs point to yes`,
  `Reply hazy try again`, `Ask again later`, `Better not tell you now`,
  `Cannot predict now`, `Concentrate and ask again`,
  `Don't count on it`, `My reply is no`, `My sources say no`,
  `Outlook not so good`, `Very doubtful`
]
function answer () {
  return answers[Math.floor(Math.random() * answers.length)]
}
function genie1 (questions) {
  var g = questions()
  while (true) {
    let question = g.next()
    if (question.done) {
      break
    }
    console.log(question.value)
    console.log('[Genie] ' + answer())
  }
}

genie1(function* questions () {
  yield '[Me] Will ES6 die a painful death?'
  yield '[Me] How youuu doing?'
})
/**************************************************************/

function genie (questions) {
  var g = questions()
  pull()
  function pull () {
    let question = g.next()
    if (question.done) {
      return
    }
    ask(question.value, pull)
  }
  function ask (q, next) {
    xhr('https://computer.genie/?q=' + encodeURIComponent(q), got)
    function got (err, res, body) {
      if (err) {
        // todo
      }
      console.log(q)
      console.log('[Genie] ' + body.answer)
      next()
    }
  }
}
genie(function* () {
  yield '[Me] Will ES6 die a painful death?'
  yield '[Me] How youuu doing?'
})
function xhr (url, done) {
 setTimeout(function () {
   done(null, null, { answer: 'No' });
  }, 2000)
}
/**************************************************************/

/** @return {!Iterator<number>} */
function* gen1() {
  yield 42;
}

/** @return {!Iterator<number>} */
const gen2 = function*() {
  yield* gen1();
}

class SomeClass {
  /** @return {!Iterator<number>} */
  * gen() {
    yield 42;
  }
}
