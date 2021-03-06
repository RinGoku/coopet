import { Action } from "typescript-fsa";
import { put } from "redux-saga/effects";
import { appActions, authActions, uploadActions } from "../../actions";

const appSaga = {
  initialize: function*(action: Action<undefined>): IterableIterator<any> {
    yield put(authActions.initialize());
    yield put(uploadActions.initialize());
    yield put(appActions.clearErrors());
    yield put(appActions.clearInfos());
  }
};

export default appSaga;
