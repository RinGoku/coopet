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
  CardHeader,
  Chip,
  CardActions,
  Badge
} from "@material-ui/core";
import { withRouter, RouteComponentProps } from "react-router-dom";
import Follow from "../utils/Follow";
import classNames from "classnames";
import UploadedImage from "../utils/UploadedImage";
import Loading from "./Loading";
import User from "../utils/User";
import animalSpecies from "../assets/data/animalSpecies.json";
import ImageDetailModal from "./ImageDetailModal";
import firebase from "../firebase";
import FollowViewModal from "../containers/FollowViewModal";

const styles = (theme: Theme): StyleRules =>
  createStyles({
    avatar: {
      margin: 10,
      width: 60,
      height: 60
    },
    paper: {
      textAlign: "center",
      padding: theme.spacing.unit,
      overflowX: "hidden"
    },
    flex: {
      display: "flex",
      flexWrap: "wrap"
    },
    fullWidth: {
      width: "100vw"
    },
    uploadedImageWrap: {
      flexBasis: "calc(100% / 3.1)",
      position: "relative",
      height: "150px",
      border: "1px solid rgba(0, 0, 0, 0.12)",
      margin: "1px"
    },
    uploadedImage: {
      width: "100%",
      height: "100%",
      objectFit: "contain"
    },
    chip: {
      margin: theme.spacing.unit
    },
    card: {
      margin: theme.spacing.unit,
      padding: theme.spacing.unit
    },
    cardComponent: {
      padding: "1px",
      textAlign: "left"
    },
    actions: {
      display: "flex",
      justifyContent: "flex-end",
      paddingRight: "10px"
    },
    followButton: {
      margin: theme.spacing.unit
    }
  });

interface Props extends WithStyles<typeof styles>, RouteComponentProps {
  registerUser?: State;
  userInfo?: any;
  auth?: any;
  onStoreUserInfo: (p: any) => void;
  onUnSelectUser: () => void;
  onFollow: (p: any) => void;
  onUnfollow: (p: any) => void;
}

type UploadedImageInfo = {
  url: string;
  comment: string;
};

interface State {
  userName: string;
  photoURL: string;
  uploadedImage: any;
  followingUids: string[];
  followerUids: string[];
  loading: boolean;
  isOpenUploadImageModal: boolean;
  isOpenImageDetailModal: boolean;
  comment: string;
  uploadedImages: UploadedImageInfo[];
  selectedImageURL: string;
  selectedImageDetail: any;
  commentUserMast: any;
  selectedComment: string;
  isMenuOpen: boolean;
  following: boolean;
  isOpenFollowingModal: boolean;
  isOpenFollowerModal: boolean;
}

let authUser: any;
let userInfo: any;
let additionalUserInfo: any;
class OtherMain extends Component<Props, State> {
  menuItems = [];
  constructor(props: Props) {
    super(props);
    authUser = firebase.auth().currentUser;
    if (authUser === null) {
      this.props.history.push("/auth");
    }
    userInfo = this.props.userInfo;
    this.state = {
      userName: "",
      photoURL: "",
      uploadedImage: null,
      followingUids: [],
      followerUids: [],
      loading: true,
      isOpenUploadImageModal: false,
      isOpenImageDetailModal: false,
      comment: "",
      uploadedImages: [],
      selectedImageURL: "",
      selectedComment: "",
      selectedImageDetail: {},
      commentUserMast: {},
      isMenuOpen: false,
      following: false,
      isOpenFollowingModal: false,
      isOpenFollowerModal: false
    };
  }

  componentDidMount = () => {
    if (!userInfo || !firebase.auth()) {
      this.props.history.push("/auth");
      return;
    }
    Follow.getFollowingRef(userInfo.uid).on("value", snap => {
      if (!snap || !snap.val()) {
        return;
      }
      this.setState({
        followingUids: Object.keys(snap.val())
      });
    });
    Follow.getFollowerRef(userInfo.uid).on("value", snap => {
      if (!snap || !snap.val()) {
        return;
      }
      this.setState({
        followerUids: Object.keys(snap.val())
      });
    });
    User.getUserByIdRef(userInfo.uid).once("value", snap => {
      if (!snap || !snap.val()) {
        return;
      }
      additionalUserInfo = snap.val();
    });
    UploadedImage.getMyUploadedImageRef(userInfo.uid).on("value", snap => {
      if (!snap || !snap.val()) {
        return;
      }
      const result = snap.val();
      this.setState({
        uploadedImages: Object.keys(result).map(key => {
          const image = result[key];
          image["uid"] = userInfo.uid;
          image["key"] = key;
          return image;
        })
        //Object.values(snap.val())
      });
    });
    Follow.getFollowerRef(userInfo.uid).on("child_removed", snap => {
      if (!snap || !snap.val()) {
        return;
      }
      this.setState({
        followerUids: Object.keys(snap.val()),
        following: Object.keys(snap.val()).includes(authUser.uid)
      });
    });
    setTimeout(() => {
      this.setState({
        loading: false
      });
    }, 1000);
  };

  componentWillUnmount() {
    if (!userInfo) {
      return;
    }
    Follow.getFollowingRef(userInfo.uid).off();
    Follow.getFollowerRef(userInfo.uid).off();
    User.isInitAuthedRef(userInfo.uid).off();
    UploadedImage.getMyUploadedImageRef(userInfo.uid).off();
    userInfo = null;
    additionalUserInfo = null;
  }

  handleOpenFollowingModal = () => {
    if (this.state.followingUids.length === 0) {
      return;
    }
    this.setState({ isOpenFollowingModal: true });
  };

  handleCloseFollowingModal = () => {
    this.setState({ isOpenFollowingModal: false });
  };

  handleOpenFollowerModal = () => {
    if (this.state.followerUids.length === 0) {
      return;
    }
    this.setState({ isOpenFollowerModal: true });
  };

  handleCloseFollowerModal = () => {
    this.setState({ isOpenFollowerModal: false });
  };

  handleChange = (name: string) => (event: any) => {
    const obj: any = {};
    obj[name] = event.target.value;
    this.setState(obj);
  };

  handleOpenImageDetailModal = (selectedImageDetail: any) => {
    this.setState({
      selectedImageDetail: selectedImageDetail,
      isOpenImageDetailModal: true
    });
  };

  handleCloseImageDetailModal = () => {
    this.setState({
      isOpenImageDetailModal: false
    });
  };

  onMenuOpen = () => {
    this.setState({
      isMenuOpen: true
    });
  };

  onMenuClose = () => {
    this.setState({
      isMenuOpen: false
    });
  };

  handleUnfollow = (user: any) => {
    this.props.onUnfollow(user);
    this.setState({
      following: false
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
          <Card className={classes.card}>
            <CardHeader
              avatar={
                <Avatar
                  alt="Remy Sharp"
                  src={userInfo.photoURL}
                  className={classes.avatar}
                />
              }
              action={
                <Fragment>
                  {!this.state.followerUids.includes(authUser.uid) ? (
                    <Chip
                      label="フォロー"
                      variant="outlined"
                      color="primary"
                      className={classes.followButton}
                      onClick={() => this.props.onFollow(additionalUserInfo)}
                    />
                  ) : (
                    <Chip
                      label="フォロー済"
                      variant="default"
                      color="primary"
                      className={classes.followButton}
                      onClick={() => this.handleUnfollow(additionalUserInfo)}
                    />
                  )}
                  <div>
                    <Chip
                      color="primary"
                      label={
                        animalSpecies.filter(
                          ele => ele.id === additionalUserInfo.petSpecies
                        )[0].name
                      }
                      className={classes.chip}
                      variant="default"
                    />
                  </div>
                </Fragment>
              }
              className={classes.cardComponent}
              title={additionalUserInfo.userName}
              subheader={additionalUserInfo.petName}
            />
            <CardActions className={classes.actions}>
              <Badge
                color="primary"
                showZero
                badgeContent={this.state.followingUids.length}
                className={classes.margin}
              >
                <Chip
                  label="フォロー"
                  variant="outlined"
                  color="primary"
                  onClick={this.handleOpenFollowingModal}
                />
              </Badge>
              <Badge
                color="primary"
                showZero
                badgeContent={this.state.followerUids.length}
                className={classes.margin}
              >
                <Chip
                  label="フォロワー"
                  variant="outlined"
                  color="primary"
                  onClick={this.handleOpenFollowerModal}
                />
              </Badge>
            </CardActions>
          </Card>
          {this.state.uploadedImages && this.state.uploadedImages.length > 0 && (
            <Card className={classNames(classes.flex, classes.card)}>
              <Fragment>
                {this.state.uploadedImages.map((uploaded, i) => (
                  <div className={classes.uploadedImageWrap} key={i}>
                    <img
                      onClick={() => this.handleOpenImageDetailModal(uploaded)}
                      alt={uploaded.comment}
                      className={classes.uploadedImage}
                      src={uploaded.url}
                    />
                  </div>
                ))}
              </Fragment>
            </Card>
          )}
        </Paper>
        <FollowViewModal
          open={this.state.isOpenFollowingModal}
          onClose={this.handleCloseFollowingModal}
          uids={this.state.followingUids}
          title="フォロー"
        />
        <FollowViewModal
          open={this.state.isOpenFollowerModal}
          onClose={this.handleCloseFollowerModal}
          uids={this.state.followerUids}
          title="フォロワー"
        />
        <ImageDetailModal
          open={this.state.isOpenImageDetailModal}
          selectedImageDetail={this.state.selectedImageDetail}
          onClose={this.handleCloseImageDetailModal}
        />
      </Fragment>
    );
  }
}

export default withStyles(styles)(withRouter(OtherMain));
