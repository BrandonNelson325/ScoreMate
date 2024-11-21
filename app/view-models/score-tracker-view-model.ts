import { Observable, ObservableArray, Dialogs, Application, Page } from '@nativescript/core';
import { Player } from '../models/player';

export class ScoreTrackerModel extends Observable {
    private _players: ObservableArray<Player>;
    private _winningScore: number = 0;
    private _isLandscape: boolean;
    private _page: Page;

    constructor() {
        super();
        this._players = new ObservableArray<Player>();
        this._players.on(ObservableArray.changeEvent, () => {
            this.notifyPropertyChange('currentLeader', this.currentLeader);
        });

        // Initialize landscape state
        this._isLandscape = false;
        
        // Monitor orientation changes
        Application.on('orientationChanged', (args: any) => {
            if (this._page) {
                const height = this._page.getMeasuredHeight();
                const width = this._page.getMeasuredWidth();
                this._isLandscape = width > height;
                this.notifyPropertyChange('isLandscape', this._isLandscape);
            }
        });
    }

    setPage(page: Page) {
        this._page = page;
        const height = page.getMeasuredHeight();
        const width = page.getMeasuredWidth();
        this._isLandscape = width > height;
        this.notifyPropertyChange('isLandscape', this._isLandscape);
    }

    get isLandscape(): boolean {
        return this._isLandscape;
    }

    get players(): ObservableArray<Player> {
        return this._players;
    }

    get winningScore(): number {
        return this._winningScore;
    }

    get currentLeader(): string {
        if (this._players.length === 0) return '';
        
        let maxScore = -1;
        let leaders: string[] = [];
        
        this._players.forEach(player => {
            const totalScore = player.score + player.pendingPoints;
            if (totalScore > maxScore) {
                maxScore = totalScore;
                leaders = [player.name];
            } else if (totalScore === maxScore) {
                leaders.push(player.name);
            }
        });

        if (maxScore <= 0) return '';
        return leaders.length > 1 
            ? `Tied: ${leaders.join(' & ')} (${maxScore})`
            : `${leaders[0]} (${maxScore})`;
    }

    async setWinningScore() {
        try {
            const result = await Dialogs.prompt({
                title: "Set Winning Score",
                message: "Enter the target score to win:",
                inputType: "number",
                defaultText: this._winningScore.toString(),
                okButtonText: "Set",
                cancelButtonText: "Cancel"
            });

            if (result.result && !isNaN(Number(result.text))) {
                this._winningScore = Number(result.text);
                this.notifyPropertyChange('winningScore', this._winningScore);
                this._players.forEach(player => {
                    player.set('$parent', this);
                    player.notifyPropertyChange('pointsToWin', player.pointsToWin);
                });
            }
        } catch (error) {
            console.error('Error setting winning score:', error);
        }
    }

    addPlayer(name: string) {
        try {
            if (name && name.trim()) {
                const newPlayer = new Player(name.trim());
                newPlayer.set('$parent', this);
                newPlayer.on('removePlayer', () => this.removePlayer(newPlayer.id));
                newPlayer.on(Observable.propertyChangeEvent, (propertyChangeData) => {
                    if (propertyChangeData.propertyName === 'score' || 
                        propertyChangeData.propertyName === 'pendingPoints') {
                        this.notifyPropertyChange('currentLeader', this.currentLeader);
                    }
                });
                this._players.push(newPlayer);
            }
        } catch (error) {
            console.error('Error adding player:', error);
        }
    }

    removePlayer(id: string) {
        try {
            const index = this._players.findIndex(player => player.id === id);
            if (index !== -1) {
                this._players.splice(index, 1);
            }
        } catch (error) {
            console.error('Error removing player:', error);
        }
    }

    resetScores() {
        try {
            this._players.forEach(player => {
                player.score = 0;
                player.pendingPoints = 0;
            });
            this._winningScore = 0;
            this.notifyPropertyChange('winningScore', this._winningScore);
            this.notifyPropertyChange('currentLeader', this.currentLeader);
            this._players.forEach(player => {
                player.notifyPropertyChange('pointsToWin', player.pointsToWin);
            });
        } catch (error) {
            console.error('Error resetting scores:', error);
        }
    }
}