import React, { Component, Fragment } from "react";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, {
  WithStyles,
  StyleRules
} from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import {
  Paper,
  Avatar,
  Card,
  TextField,
  CardHeader,
  Chip,
  MenuItem
} from "@material-ui/core";
import { withRouter, RouteComponentProps } from "react-router-dom";
import classNames from "classnames";
import Loading from "./Loading";
import User from "../utils/User";
import animalSpecies from "../assets/data/animalSpecies.json";

const styles = (theme: Theme): StyleRules =>
  createStyles({
    paper: {
      textAlign: "center",
      padding: theme.spacing.unit,
      overflowX: "hidden"
    },
    select: {
      width: "60vw"
    },
    card: {
      margin: theme.spacing.unit,
      padding: theme.spacing.unit
    },
    flex: {
      display: "flex",
      flexWrap: "wrap"
    },
    uploadedImageWrap: {
      flexBasis: "calc(100% / 3)",
      position: "relative",
      height: "150px",
      border: "1px solid rgba(0, 0, 0, 0.12)"
    },
    uploadedImage: {
      width: "100%",
      height: "100%",
      objectFit: "scale-down"
    }
  });

interface Props extends WithStyles<typeof styles>, RouteComponentProps {
  registerUser: State;
  auth: any;
  onUploadImage: (param: {
    uploadedImage: any;
    comment: string;
    petSpecies: string;
  }) => void;
  onLogout: () => void;
  onStoreUserInfo: (p: any) => void;
}

interface State {
  selectedSpecies: string;
  viewedUser: any[];
}

let userInfo: any;
let additionalUserInfo: any;
class UserView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    userInfo = this.props.auth.user;
    if (!userInfo) {
      this.props.history.push("/auth");
      return;
    }
    additionalUserInfo = this.props.auth.additionalUserInfo;
    this.state = {
      selectedSpecies: additionalUserInfo.petSpecies,
      viewedUser: []
    };
    User.getUsersBySpeciesRef(this.state.selectedSpecies).on("value", snap => {
      if (!snap || !snap.val()) {
        return;
      }
      const result = snap.val();
      this.setState({
        viewedUser: Object.keys(result)
          .filter(key => {
            return key !== userInfo.uid;
          })
          .map(key => {
            const user = result[key];
            user["uid"] = key;
            return user;
          })
      });
    });
  }

  componentDidMount = () => {
    if (!userInfo) {
      this.props.history.push("/auth");
      return;
    }
  };

  componentWillUnmount() {
    if (!userInfo) {
      return;
    }
    User.getUsersBySpeciesRef(this.state.selectedSpecies).off();
    // UploadedImage.getMyUploadedImageRef(userInfo.uid).off();
  }

  handleChange = (name: string) => (event: any) => {
    const obj: any = {};
    obj[name] = event.target.value;
    this.setState(obj);
  };

  handleSpeciesSelectChange = () => (event: any) => {
    const selectedValue = event.target.value;
    User.getUsersBySpeciesRef(this.state.selectedSpecies).off();
    User.getUsersBySpeciesRef(selectedValue).on("value", snap => {
      if (!snap || !snap.val()) {
        return;
      }
      const result = snap.val();
      this.setState({
        viewedUser: Object.keys(result)
          .filter(key => {
            return key !== userInfo.uid;
          })
          .map(key => {
            const user = result[key];
            user["uid"] = key;
            return user;
          })
      });
    });
    this.setState({
      selectedSpecies: selectedValue
    });
  };

  render() {
    if (!additionalUserInfo) {
      return <Loading />;
    }
    const { classes } = this.props;
    return (
      <Fragment>
        <Paper className={classNames(classes.paper, classes.fullWidth)}>
          <TextField
            select
            label="ペットの種類"
            className={classes.select}
            value={this.state.selectedSpecies}
            margin="normal"
            variant="outlined"
            onChange={this.handleSpeciesSelectChange()}
          >
            {animalSpecies.map(option => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
          {this.state.viewedUser && this.state.viewedUser.length !== 0 && (
            <Card className={classNames(classes.flex, classes.card)}>
              {this.state.viewedUser.map((user, i) => (
                <CardHeader
                  avatar={
                    <Avatar
                      alt="Remy Sharp"
                      src={user.photoURL}
                      className={classes.avatar}
                    />
                  }
                  action={
                    <Chip
                      color="primary"
                      label={
                        animalSpecies.filter(
                          ele => ele.id === user.petSpecies
                        )[0].name
                      }
                      className={classes.chip}
                      variant="outlined"
                    />
                  }
                  title={user.userName}
                  subheader={user.petName}
                  key={i}
                />
              ))}
            </Card>
          )}
        </Paper>
      </Fragment>
    );
  }
}

export default withStyles(styles)(withRouter(UserView));