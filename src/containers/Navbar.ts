import { connect } from "react-redux";
import { Action, Dispatch } from "redux";

import { RootState } from "../modules";
import Navbar from "../components/Navbar";
import { authActions } from "../actions";

const mapStateToProps = () => (state: RootState) => {
  return {
    auth: state.Auth
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    onLogout: () => {
      dispatch(authActions.signOut.started());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Navbar);