var React   =   require('react'),
    Helpers =   require('../lib/helpers.js'),
    _       =   require('underscore');

// TODO: modularize the react components as well..
var Card = React.createClass({
  render: function() {
    var index,
        selectCard = this.props.selectCard,
        isFlipped = this.props.isFlipped,
        pileStyle = "pile col-xs-4",
        cardStyle = "card",
        output = <div className="pile col-xs-4"></div>;

    index = (isFlipped && this.props.cards.length > 0)
      ? this.props.cards[this.props.cards.length - 1]
      : this.props.cardIndex;

    var cards = [];

    if (this.props.cardIndex !== '-1' && this.props.cards.length > 0) {
      // init the card pile
      var self = this;
      _.map(this.props.cards, function(card, i) {
        if (i === self.props.cards.length - 1) {
          if (isFlipped) {
            cardStyle += " flipped";
          }
          card = index;
        }
        cards.push(
          <div key={'card-idx-' + i}
              className={cardStyle}
              onClick={selectCard.bind(null, index)}>
            {card}
          </div>,
          <br key={'card-br-' + i} />
        );
      });
    } else if (this.props.cardIndex !== '-1') {
      // if there are no cards remaining, display the expired index placeholder and appropriate styles
      if (this.props.cardIndex === 'K') {
        cardStyle += " danger";
      } else {
        cardStyle += " expired";
      }
      cards.push(
        <div key={'card-ph-' + index}
            className={cardStyle}
            onClick={selectCard.bind(null, index)}>
          {index}
        </div>
      );
    }

    if (index !== '-1') {
      output =
        <div className={pileStyle}>
            {cards}
        </div>
    }

    return (
      output
    )
  }
});

var MainFrame = React.createClass({
  getInitialState: function() {
    var piles = Helpers.initPiles();
    return {
      piles: piles,
      currentCardSelected: piles[7],  // card at index 7 is K -- we start with this card flipped
      gameStatus: null
    };
  },
  selectCard: function(cardIndex) {
    var allPiles = this.state.piles,
      card = this.getCardByIndex(cardIndex),
      previousCard = this.getCardByIndex(this.state.currentCardSelected.index);

    if (cardIndex !== previousCard.cards[previousCard.cards.length - 1] ||
      this.state.gameStatus) {
      return;
    }

    previousCard.cards.pop();
    previousCard.isFlipped = false;
    card.isFlipped ^= true;

    this.setState({
      piles: allPiles,
      currentCardSelected: card
    }, function () {
      this.checkOutcome(card);
    });
  },
  checkOutcome: function(card) {
    // TODO: re-evaluate this..
    if (card.index === 'K' && card.cards.length === 0) {
      this.updateGameStatus(Helpers.GameStatus.LOSE);
    } else {
      var results = this.state.piles.filter(function(o) {
        if (o.index !== '-1') {
          return o.cards.length === 0 && o.index !== 'K';
        }
      });
      if (results.length === 11 &&
        card.cards[0] === 'K') {
        this.updateGameStatus(Helpers.GameStatus.WIN);
      }
    }
  },
  getCardByIndex: function(index) {
    return this.state.piles.filter(function(o) {
      return o.index == index;
    })[0];
  },
  updateGameStatus: function(status) {
    this.setState({
      gameStatus: status
    });
  },
  resetGame: function() {
    var piles = Helpers.initPiles();
    this.setState({
      piles: piles,
      currentCardSelected: piles[7],
      gameStatus: null
    });
  },
  render: function() {
    var board = [],
      statusBox = null,
      self = this;

    _.map(this.state.piles, function(pile, i) {
      board.push(
        <Card key={'pile-idx-' + i}
            cardIndex={pile.index}
            selectCard={self.selectCard}
            isFlipped={pile.isFlipped}
            cards={pile.cards} />
      );
    });

    if (this.state.gameStatus === Helpers.GameStatus.WIN ||
      this.state.gameStatus === Helpers.GameStatus.LOSE) {
      statusBox =
        <div className="col-xs-12 well status">
          <h4>{this.state.gameStatus}</h4>
          <button className="btn btn-default" onClick={this.resetGame}>Play Again</button>
        </div>
    }

    return (
      <div>
        {board}
        {statusBox}
      </div>
    )
  }
});

React.render(<MainFrame />, document.getElementById('container'));
