var _ = require('underscore');

exports.gameStatus = {
	WIN: 'WINNER, WINNER!!',
	LOSE: 'You lose! GAME OVER.'
};

exports.initCards = function() {
	var cards = [];
	var self = this;
	_.map(_.range(1, 14), function(num) {
		for (var i = 0; i < 4; i++) {
			cards.push(self.mapToCardValue(num));
		}
	});
	return _.shuffle(cards);
};

exports.mapToCardValue = function(num) {
	var result = null;
	switch (num) {
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

exports.initPiles = function() {
	var pileIndexes = ['J', 'Q', 'A', '10', '-1', '2', '9', 'K', '3', '8', '-1', '4', '7', '6', '5'],
		cards = this.initCards(),
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

