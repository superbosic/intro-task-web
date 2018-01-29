const selectors = {
    field: '.field',
    row: '.row',
    cell: '.cell',
    cross: '.ch',
    zero: '.r',
    undo: '.undo-btn',
    redo: '.redo-btn',
    title: '.won-title',
    message: '.won-message',
    restart: '.restart-btn'
};

const players = {
    cross: 'ch',
    zero: 'r'
};

class Game {
    constructor () {
        this.restart();

        $(selectors.cell).click(this.cellClick.bind(this));
        $(selectors.undo).click(this.undo.bind(this));
        $(selectors.redo).click(this.redo.bind(this));
        $(selectors.restart).click(this.restart.bind(this));
    };

    cellClick (e) {
        const $cell = $(e.target);

        if (this.isEnd) {
            return;
        }

        $cell.addClass(this.player);

        if (this.checkRow($cell) || this.checkColumn($cell) || this.checkDiagonal()) {
            this.endGame(this.player);

            return;
        } else if (this.step === 8) {
            this.endGame();

            return;
        }

        this.steps.length = this.step;

        this.addToHistory($cell);

        this.step++;

        if (this.step > 0) {
            this.toggleUndo(false);
        } else {
            this.toggleUndo(true);
        }

        this.toggleRedo(true);
        this.togglePlayer();
    }

    checkRow (cell) {
        const id = this.getRowId(cell);
        const cells = $(selectors.field).find(`${selectors.row}:eq('${id}') .${this.player}`);

        if (cells.length === 3) {
            cells.each((id, cell) => this.winCells.push(this.getCellId(cell)));
            this.winDirection = 'horizontal';
            return true;
        }

        return false;
    }

    checkColumn (cell) {
        const id = cell.index();
        const $rows = $(`${selectors.field} ${selectors.row}`);

        for (let i = 0; i < $rows.length; i++) {
            let $row = $($rows[i]);
            let $cell = $row.find(`${selectors.cell}:eq(${id})`);

            if (!$cell.hasClass(this.player)) {
                this.winCells = [];
                return false;
            } else {
                this.winCells.push(this.getCellId($cell));
            }
        }

        this.winDirection = 'vertical';

        return true;
    }

    checkDiagonal () {
        const $rows = $(`${selectors.field} ${selectors.row}`);
        const ids = [0, 1, 2];
        const check = (ids) => {
            for (let i = 0; i < $rows.length; i++) {
                let $row = $($rows[i]);
                let $cell = $row.find(`${selectors.cell}:eq(${ids[i]})`);
                if (!$cell.hasClass(this.player)) {
                    this.winCells = [];
                    return false;
                } else {
                    this.winCells.push(this.getCellId($cell));
                }
            }

            return true;
        };

        if (check(ids)) {
            this.winDirection = 'diagonal-right';
            return true;
        }

        if (check(ids.reverse())) {
            this.winDirection = 'diagonal-left';
            return true;
        }

        return false;
    }

    getRowId (cell) {
        return $(cell).parent().index();
    }

    getCellId (cell) {
        return $(cell).data('id');
    }

    endGame (winner) {
        this.winCells.forEach(id => $(`[data-id=${id}]`).addClass(`win ${this.winDirection}`));

        $(selectors.title).removeClass('hidden');
        if (winner === players.cross) {
            this.message('Crosses won!');
        } else if (winner === players.zero) {
            this.message('Toes won!');
        } else {
            this.message("It's a draw!");
        }

        this.toggleUndo(true);
        this.toggleRedo(true);

        this.isEnd = true;
    }

    message (text) {
        const $message = $(selectors.message);

        $message.text(text);
    }

    toggleUndo (flag) {
        if (flag) {
            $(selectors.undo).attr('disabled', flag);
        } else {
            $(selectors.undo).removeAttr('disabled');
        }
    }

    toggleRedo (flag) {
        if (flag) {
            $(selectors.redo).attr('disabled', flag);
        } else {
            $(selectors.redo).removeAttr('disabled');
        }
    }

    undo () {
        if (--this.step === 0) {
            this.toggleUndo(true);
        }

        const {id} = this.steps[this.step];

        $(`[data-id=${id}]`).removeClass().addClass('cell');

        this.toggleRedo();
        this.togglePlayer();
    }

    redo () {
        const {id, player} = this.steps[this.step];

        if (++this.step >= this.steps.length) {
            this.toggleRedo(true);
        }

        $(`[data-id=${id}]`).addClass(player);

        this.toggleUndo();
        this.togglePlayer();
    }

    addToHistory (cell) {
        const {player} = this;
        const id = this.getCellId(cell);

        this.steps.push({id, player});
    }

    togglePlayer () {
        this.player = this.player === players.cross ? players.zero : players.cross;
    }

    restart () {
        this.step = 0;
        this.player = players.cross;
        this.steps = [];
        this.winCells = [];
        this.winDirection = '';
        this.isEnd = false;

        this.message('');
        $(selectors.title).addClass('hidden');
        $(selectors.cell).removeClass().addClass('cell');
    }

    static start () {
        return new Game();
    }
}

window.game = Game.start();