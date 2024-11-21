import { EventData, Page, TextField } from '@nativescript/core';
import { ScoreTrackerModel } from './view-models/score-tracker-view-model';

let viewModel: ScoreTrackerModel;

export function navigatingTo(args: EventData) {
    const page = <Page>args.object;
    if (!viewModel) {
        viewModel = new ScoreTrackerModel();
    }
    viewModel.setPage(page);
    page.bindingContext = viewModel;
}

export function onAddPlayer(args: EventData) {
    const textField = <TextField>args.object.page.getViewById('playerNameInput');
    const playerName = textField.text || '';
    
    if (playerName.trim()) {
        viewModel.addPlayer(playerName);
        textField.text = '';
    }
}

export function onLayoutChanged(args: EventData) {
    const page = <Page>args.object;
    if (viewModel) {
        viewModel.setPage(page);
    }
}