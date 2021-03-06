import { connect } from "react-redux";
import { Action, Dispatch } from "redux";

import { RootState } from "../modules";
import { authActions, uploadActions } from "../actions";

import React, { Component, Fragment } from "react";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, {
  WithStyles,
  StyleRules
} from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import {
  Paper,
  Modal,
  Card,
  CardMedia,
  CardContent,
  Button,
  TextField
} from "@material-ui/core";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { withSnackbar, WithSnackbarProps } from "notistack";
import firebase from "../firebase";
import Navbar from "./Navbar";
import Follow from "../utils/Follow";
import classNames from "classnames";
import UploadedImage from "../utils/UploadedImage";
import Loading from "../components/Loading";
import User from "../utils/User";
import ImageDetailModal from "../containers/ImageDetailModal";
import UserListModal from "../containers/UserListModal";
import { UploadFile } from "../utils/UploadFile";
import ImageList from "../components/ImageList";
import UserProfile from "./UserProfile";

const styles = (theme: Theme): StyleRules =>
  createStyles({
    paper: {
      textAlign: "center",
      padding: theme.spacing.unit,
      marginTop: "60px",
      overflowX: "hidden"
    },
    media: {
      objectFit: "cover",
      height: 150,
      width: "auto",
      margin: "auto"
    },
    flex: {
      display: "flex",
      flexWrap: "wrap"
    },
    fullWidth: {
      width: "100vw"
    },
    textField: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      width: "80vw"
    },
    uploadedImage: {
      width: "100%",
      height: "100%",
      objectFit: "contain"
    }
  });

function getModalStyle() {
  return {
    backgroundColor: "white",
    width: "100vw"
  };
}

interface Props
  extends WithStyles<typeof styles>,
    RouteComponentProps,
    WithSnackbarProps {
  registerUser?: State;
  userInfo?: any;
  auth?: any;
  onUploadImage: (param: {
    uploadedImage: any;
    comment: string;
    petSpecies: string;
  }) => void;
  onLogout: () => void;
  onStoreUserInfo: (p: any) => void;
}

type UploadedImageInfo = {
  url: string;
  comment: string;
};

interface State {
  photoURL: string;
  uploadedImage: any;
  followingUids: string[];
  followerUids: string[];
  isOpenUploadImageModal: boolean;
  isOpenImageDetailModal: boolean;
  comment: string;
  uploadedImages: UploadedImageInfo[];
  selectedImageDetail: any;
  isMenuOpen: boolean;
  isOpenFollowingModal: boolean;
  isOpenFollowerModal: boolean;
}

let userInfo: any;

/**
 * ユーザーメイン画面
 */
class UserMain extends Component<Props, State> {
  // ナビゲーションバーに表示する項目
  menuItems = [
    {
      menuLabel: "ログアウト",
      func: () => {
        this.props.onLogout();
        this.props.history.push("/auth");
        this.onMenuClose();
      }
    },
    {
      menuLabel: "会員情報変更",
      func: () => {
        this.props.history.push("/changeUser");
        this.onMenuClose();
      }
    }
  ];
  constructor(props: Props) {
    super(props);
    userInfo = firebase.auth().currentUser;
    if (!userInfo) {
      this.props.history.push("/auth");
      return;
    }
    this.state = {
      photoURL: "",
      uploadedImage: null,
      followingUids: [],
      followerUids: [],
      isOpenUploadImageModal: false,
      isOpenImageDetailModal: false,
      comment: "",
      uploadedImages: [],
      selectedImageDetail: {},
      isMenuOpen: false,
      isOpenFollowingModal: false,
      isOpenFollowerModal: false
    };
  }

  componentDidMount = () => {
    if (!userInfo) {
      this.props.history.push("/auth");
      return;
    }
    // フォロー一覧の変更監視
    Follow.getFollowingRef(userInfo.uid).on("value", snap => {
      if (!snap || !snap.val()) {
        return;
      }
      this.setState({
        followingUids: Object.keys(snap.val())
      });
    });
    // フォロワー一覧の変更監視
    Follow.getFollowerRef(userInfo.uid).on("value", snap => {
      if (!snap || !snap.val()) {
        return;
      }
      this.setState({
        followerUids: Object.keys(snap.val())
      });
    });
    // firebase認証に紐づくユーザー情報を取得
    User.isInitAuthedRef(userInfo.uid).on("value", snap => {
      if (!snap || !snap.val()) {
        return;
      }
      this.props.onStoreUserInfo(snap.val());
    });
    // 画像一覧の変更監視
    UploadedImage.getMyUploadedImageRef(userInfo.uid).on("value", snap => {
      if (!snap || !snap.val()) {
        return;
      }
      const result = snap.val();
      this.setState({
        uploadedImages: Object.keys(result).map(key => {
          const image = result[key];
          image["key"] = key;
          return image;
        })
      });
    });
    // 画像一覧の削除監視
    UploadedImage.getMyUploadedImageRef(userInfo.uid).on("child_removed", _ => {
      UploadedImage.getMyUploadedImageRef(userInfo.uid).off();
      UploadedImage.getMyUploadedImageRef(userInfo.uid).on("value", snap => {
        if (snap) {
          console.log(snap.val());
        }
        if (!snap || snap.val() === undefined) {
          return;
        }
        const result = snap.val();
        this.setState({
          uploadedImages: result
            ? Object.keys(result).map(key => {
                const image = result[key];
                image["key"] = key;
                return image;
              })
            : []
        });
      });
    });
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
  }

  /**
   * 画面入力時のハンドラー
   */
  handleChange = (name: string) => (event: any) => {
    const obj: any = {};
    obj[name] = event.target.value;
    this.setState(obj);
  };

  /**
   * 画像選択時処理
   */
  handleChangeFile = (e: any) => {
    UploadFile.uploadImage(
      e,
      (src, blob) => {
        this.setState({ photoURL: src, uploadedImage: blob });
        this.handleOpenUploadImageModal();
      },
      () =>
        this.props.enqueueSnackbar(
          "画像ファイル(.jpg,.png)を選択してください",
          {
            variant: "error",
            autoHideDuration: 3000
          }
        )
    );
  };

  /**
   * フォロー一覧の表示
   */
  handleOpenFollowingModal = () => {
    if (this.state.followingUids.length === 0) {
      return;
    }
    this.setState({ isOpenFollowingModal: true });
  };

  /**
   * フォロー一覧の非表示
   */
  handleCloseFollowingModal = () => {
    this.setState({ isOpenFollowingModal: false });
  };

  /**
   * フォロワー一覧の表示
   */
  handleOpenFollowerModal = () => {
    if (this.state.followerUids.length === 0) {
      return;
    }
    this.setState({ isOpenFollowerModal: true });
  };

  /**
   * フォロワー一覧の非表示
   */
  handleCloseFollowerModal = () => {
    this.setState({ isOpenFollowerModal: false });
  };

  /**
   * 画像投稿モーダルの表示
   */
  handleOpenUploadImageModal = () => {
    this.setState({ isOpenUploadImageModal: true });
  };

  /**
   * 画像投稿モーダルの非表示
   */
  handleCloseUploadImageModal = () => {
    this.setState({
      uploadedImage: null,
      isOpenUploadImageModal: false
    });
  };

  /**
   * 画像詳細モーダルの表示
   */
  handleOpenImageDetailModal = (selectedImageDetail: any) => {
    this.setState({
      selectedImageDetail: selectedImageDetail,
      isOpenImageDetailModal: true
    });
  };

  /**
   * 画像詳細モーダルの非表示
   */
  handleCloseImageDetailModal = () => {
    this.setState({
      isOpenImageDetailModal: false
    });
  };

  /**
   * 画像投稿処理
   */
  uploadImage = () => {
    if (this.state.comment && this.state.comment.length > 300) {
      this.props.enqueueSnackbar("コメントは300文字以内で入力してください", {
        variant: "error",
        autoHideDuration: 3000
      });
      return;
    }
    this.props.onUploadImage({
      uploadedImage: this.state.uploadedImage,
      comment: this.state.comment,
      petSpecies: this.props.auth.additionalUserInfo.petSpecies
    });
    this.handleCloseUploadImageModal();
    this.setState({
      comment: ""
    });
  };

  /**
   * ナビゲーションバーを開く
   */
  onMenuOpen = () => {
    this.setState({
      isMenuOpen: true
    });
  };

  /**
   * ナビゲーションバーを閉じる
   */
  onMenuClose = () => {
    this.setState({
      isMenuOpen: false
    });
  };

  render() {
    if (!this.props.auth.additionalUserInfo) {
      return <Loading />;
    }
    const { classes } = this.props;
    return (
      <Fragment>
        {!this.props.userInfo && (
          <Navbar
            menuItems={this.menuItems}
            open={this.state.isMenuOpen}
            onOpen={this.onMenuOpen}
            onBackdropClick={this.onMenuClose}
          />
        )}
        <Paper className={classNames(classes.paper, classes.fullWidth)}>
          <UserProfile
            userInfo={this.props.auth.additionalUserInfo}
            followingUids={this.state.followingUids}
            followerUids={this.state.followerUids}
            handleOpenFollowerModal={this.handleOpenFollowerModal}
            handleCloseFollowerModal={this.handleCloseFollowerModal}
            handleOpenFollowingModal={this.handleOpenFollowingModal}
            handleCloseFollowingModal={this.handleCloseFollowingModal}
            handleChangeFile={(e: any) => this.handleChangeFile(e)}
            isOther={false}
          />

          <ImageList
            uploadedImages={this.state.uploadedImages}
            handleOpenImageDetailModal={this.handleOpenImageDetailModal}
          />
        </Paper>
        {/* 画像詳細モーダル */}
        {this.state.isOpenImageDetailModal ? (
          <ImageDetailModal
            open={this.state.isOpenImageDetailModal}
            selectedImageDetail={this.state.selectedImageDetail}
            onClose={this.handleCloseImageDetailModal}
          />
        ) : null}
        {/* フォロー・フォロワーモーダル */}
        {this.state.isOpenFollowingModal ? (
          <UserListModal
            open={this.state.isOpenFollowingModal}
            onClose={this.handleCloseFollowingModal}
            uids={this.state.followingUids}
            title="フォロー"
          />
        ) : null}
        {this.state.isOpenFollowerModal ? (
          <UserListModal
            open={this.state.isOpenFollowerModal}
            onClose={this.handleCloseFollowerModal}
            uids={this.state.followerUids}
            title="フォロワー"
          />
        ) : null}
        {/* 画像投稿モーダル */}
        {this.state.isOpenUploadImageModal ? (
          <Modal
            open={this.state.isOpenUploadImageModal}
            onClose={this.handleCloseUploadImageModal}
          >
            <div style={getModalStyle()} className={classes.paper}>
              <Card>
                <CardMedia
                  component="img"
                  className={classes.media}
                  src={this.state.photoURL || userInfo.photoURL}
                  title="Contemplative Reptile"
                />
                <CardContent>
                  <TextField
                    id="outlined-multiline-static"
                    label="コメント"
                    multiline
                    rows="4"
                    defaultValue=""
                    onChange={this.handleChange("comment")}
                    className={classes.textField}
                    margin="normal"
                    variant="outlined"
                  />
                  <div>
                    <Button
                      color="primary"
                      variant="contained"
                      onClick={this.uploadImage}
                    >
                      投稿
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Modal>
        ) : null}
      </Fragment>
    );
  }
}

// reduxへのconnect
const mapStateToProps = () => (state: RootState) => {
  return {
    auth: state.Auth
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    onLogout: () => {
      dispatch(authActions.signOut.started());
    },
    onStoreUserInfo: (p: any) => {
      dispatch(authActions.storeUserInfo.started(p));
    },
    onUploadImage: (param: any) => {
      dispatch(uploadActions.uploadImage.started(param));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(withSnackbar(UserMain))));
