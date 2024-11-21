import { Observable } from '@nativescript/core';

export class Player extends Observable {
    private _score: number;
    private _pendingPoints: number = 0;
    private _lastUpdateTime: number;
    private _autoAddTimer: any;

    constructor(
        public name: string,
        score: number = 0,
        public id: string = new Date().getTime().toString()
    ) {
        super();
        this._score = score;
        this._lastUpdateTime = Date.now();
    }

    get score(): number {
        return this._score;
    }

    get pendingPoints(): number {
        return this._pendingPoints;
    }

    get pointsToWin(): string {
        const parent = this.get('$parent');
        if (parent && parent.winningScore > 0) {
            const remaining = parent.winningScore - (this._score + this._pendingPoints);
            return ` (${remaining})`;
        }
        return '';
    }

    set score(value: number) {
        if (this._score !== value) {
            this._score = value;
            this.notifyPropertyChange('score', value);
            this.notifyPropertyChange('pointsToWin', this.pointsToWin);
        }
    }

    set pendingPoints(value: number) {
        if (this._pendingPoints !== value) {
            this._pendingPoints = value;
            this.notifyPropertyChange('pendingPoints', value);
            this.notifyPropertyChange('pointsToWin', this.pointsToWin);
        }
    }

    private resetAutoAddTimer() {
        if (this._autoAddTimer) {
            clearTimeout(this._autoAddTimer);
        }

        this._autoAddTimer = setTimeout(() => {
            this.addPendingPoints();
        }, 5000);

        this._lastUpdateTime = Date.now();
    }

    private addPendingPoints() {
        const newScore = Math.max(0, this._score + this._pendingPoints);
        this.score = newScore;
        this.pendingPoints = 0;
    }

    updateScore(amount: number) {
        const potentialTotal = this._score + amount;
        if (potentialTotal >= 0) {
            this.pendingPoints = amount;
            this.resetAutoAddTimer();
        } else {
            this.pendingPoints = -this._score;
            this.resetAutoAddTimer();
        }
    }

    incrementScore() {
        this.updateScore(this.pendingPoints + 1);
    }

    decrementScore() {
        this.updateScore(this.pendingPoints - 1);
    }

    incrementScoreBy10() {
        this.updateScore(this.pendingPoints + 10);
    }

    decrementScoreBy10() {
        this.updateScore(this.pendingPoints - 10);
    }

    removePlayer() {
        if (this._autoAddTimer) {
            clearTimeout(this._autoAddTimer);
        }
        this.notify({ eventName: 'removePlayer', object: this });
    }
}