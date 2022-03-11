const io = require('socket.io')();
const { createGameState, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');

io.on('connection', client => {
    const state =createGameState();
    client.emit('init', { data: 'Connected'});
    client.on('keydown', handleKeydown);

    function handleKeydown(keyCode) {
        try {
            keyCode = parseInt(keyCode);
          } catch(e) {
            console.error(e);
            return;
          }

          const vel = getUpdatedVelocity(keyCode);
          if (vel) {
              state.player.vel = vel;
          }

    }

    startGameInterval(client, state);
});


function startGameInterval(client, state)
{
    const intervalId = setInterval(() => {
        const winner = gameLoop(state);
        

        if (!winner) {
            client.emit('gameState',JSON.stringify(state));
          } else {
            client.emit('gameOver');
            clearInterval(intervalId);
          }
    }, 1000/ FRAME_RATE);
}

io.listen(process.env.PORT || 3000);