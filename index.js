Vue.component('app', {
    data: function(){
      return {
        app: new App()
      };
    },
    template: `
      <div>
        <a href="http://github.com/cztomsik/match-game">Github</a>

        <div v-if=" app.game ">
          <div>
            <transition name="fade" v-for=" m in Array(app.game.remaining) ">
              <img class="match" src="https://upload.wikimedia.org/wikipedia/commons/8/81/Match-1.jpg" />
            </transition>
          </div>

          <div v-if=" ! app.thinking ">
            <button v-for=" n in _.range(1, app.game.remaining + 1).slice(0, 3) " @click=" app.play(n) ">{{ n }}</button>
          </div>

          <ul>
            <li v-for=" (m, i) in app.moves ">
              <span>{{ (i % 2 === 1) ?'me' :'you' }}</span>
              <span>{{ m.n }}</span>
              <small>{{ m.remaining - m.n }} remains</small>
            </li>
          </ul>
        </div>

        <div v-if=" app.game.isFinished() ">
          <div class="alert">You {{ app.result }}</div>

          <br>

          <button @click=" app.newGame() ">New game</button>
        </div>
      </div>
    `
});

window.onload = () => {
  new Vue({el: 'app'});
};

class App{
  constructor(){
    this.newGame();
  }

  newGame(){
    this.game = new Game();
    this.moves = [];
    this.thinking = false;
    this.result = '';
  }

  move(n){
    this.moves.push({
      remaining: this.game.remaining,
      n: n
    });

    this.game.pull(n);

    return ! this.game.isFinished();
  }

  async play(n){
    if ( ! this.move(n)){
      this.result = 'LOSE';
      return;
    }

    await this.think();
    const nGuess = this.guess();

    if ( ! this.move(nGuess) ){
      this.result = 'WIN';
    }
  }

  async think(){
    this.thinking = true;
    await sleep(1);
    this.thinking = false;
  }

  guess(){
    // the actual algo to win
    // return ((this.game.remaining - 1) % 4) || 1;

    // it's easier to understand when written down
    // const moves = {
    //   1: 1, // we lose
    //   2: 1,
    //   3: 2,
    //   4: 3,
    //   5: 1, // we PROBABLY lose
    //   6: 1,
    //   7: 2,
    //   8: 3,
    //   9: 1, // we COULD lose
    //   10: 1,
    //   11: 2,
    //   12: 3,
    //   13: 1 // player can only win if he starts with 1 and never do any mistake (1-3-3-3)
    // };

    // return moves[this.game.remaining] || 1;

    const guess = network.activate([this.game.remaining]);

    return (_.findIndex(_.map(guess, Math.round)) + 1) || 1;
  }
}

class Game{
  constructor(){
    this.remaining = 14;
  }

  pull(n){
    this.remaining -= n;
  }

  isFinished(){
    return this.remaining === 0;
  }
}

function sleep(n){
  return new Promise(_.partial(setTimeout, _, n * 1000));
}

const {Architect, Trainer} = synaptic;
const network = new Architect.Perceptron(1, 5, 3);

const trainingSet = [
  {input: [1], output: [1, 0, 0]},
  {input: [2], output: [1, 0, 0]},
  {input: [3], output: [0, 1, 0]},
  {input: [4], output: [0, 0, 1]},
  {input: [5], output: [1, 0, 0]},
  {input: [6], output: [1, 0, 0]},
  {input: [7], output: [0, 1, 0]},
  {input: [8], output: [0, 0, 1]},
//  {input: [9], output: [1, 0, 0]},
//  {input: [10], output: [1, 0, 0]},
//  {input: [11], output: [0, 1, 0]},
//  {input: [12], output: [0, 0, 1]},
//  {input: [13], output: [1, 0, 0]},
];

new Trainer(network).train(trainingSet, {
  rate: 0.1,
  error: 0.3,
  iterations: 500 * 1000,
  log: 10000,
  cost: Trainer.cost.CROSS_ENTROPY
});

[1, 2, 3, 4, 5, 6, 7, 8].forEach((n) => {
  console.log(network.activate([n]));
});

function mapV(v, min, max, newMin, newMax){
  return (((v - min) / (max - min)) * (newMax - newMin)) + newMin;
}
