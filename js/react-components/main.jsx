(function () {
	"use strict";

	var GameStatus = {
		WIN: 'WINNER, WINNER!!',
		LOSE: 'You lose! GAME OVER.'
	};

	var initCards = function() {
		var cards = [];
		_.map(_.range(1, 14), function(num) {
			for (var i = 0; i < 4; i++) {
				cards.push(mapToCardValue(num));
			}
		});
		return _.shuffle(cards);
	};

	var mapToCardValue = function(num) {
		var result = null;
		switch(num) {
			case 1:
				result = 'A';
				break;
			case 11:
				result = 'J';
				break;
			case 12:
				result = 'Q';
				break;
			case 13:
				result = 'K';
				break;
			default:
				result = num + '';
		}
		return result;
	};

	var initPiles = function() {
		var pileIndexes = ['J','Q','A','10','-1','2','9','K','3','8','-1','4','7','6','5'],
			cards = initCards(),
			piles = [];

		for (var i = 0; i < pileIndexes.length; i++) {
			var pileIndex = pileIndexes[i];
			piles.push({
				index: pileIndex,
				isFlipped: pileIndex === 'K' ? true : false,
				cards: pileIndex === '-1' ? null : _.first(cards, 4)
			});
			if (pileIndex !== '-1') {
				cards.splice(0, 4);
			}
		}
		return piles;
	};

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
						<div key={'card-idx-' + i} className={cardStyle} onClick={selectCard.bind(null, index)}>
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
					<div key={'card-ph-' + index} className={cardStyle} onClick={selectCard.bind(null, index)}>
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
			var piles = initPiles(); 
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
			if (card.index === 'K' && card.cards.length === 0) {
				this.updateGameStatus(GameStatus.LOSE); 
			} else {
				var results = this.state.piles.filter(function(o) {
					if (o.index !== '-1') {
						return o.cards.length === 0 && o.index !== 'K'; 
					}
				});
				if (results.length === 11 &&
					card.cards[0] === 'K') {
					this.updateGameStatus(GameStatus.WIN);
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
			var piles = initPiles(); 
			this.setState({
				piles: initPiles(),
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

			if (this.state.gameStatus === GameStatus.WIN || 
				this.state.gameStatus === GameStatus.LOSE) {
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

})();