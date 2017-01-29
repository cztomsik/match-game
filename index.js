Vue.component('app', {
    data: function(){
      return {
        app: new App()
      };
    },
    template: `
      <div>
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
    const moves = {
      8: 3,
      6: 1,
      4: 3,
      3: 2
    };

    return moves[this.game.remaining] || 1;
  }
}

class Game{
  constructor(){
    this.remaining = 12;
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
