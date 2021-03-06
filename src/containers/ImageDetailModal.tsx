import { connect } from "react-redux";
import { Action, Dispatch } from "redux";

import { RootState } from "../modules";
import { uploadActions } from "../actions";

import React, { Component, Fragment } from "react";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, {
  WithStyles,
  StyleRules
} from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import {
  Card,
  CardMedia,
  CardContent,
  Modal,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@material-ui/core";
import { withRouter, RouteComponentProps } from "react-router-dom";
import CommentsView from "../containers/CommentsView";
import User from "../utils/User";
import UserCard from "../containers/UserCard";
import classNames from "classnames";
import FavoriteIcon from "@material-ui/icons/Favorite";
import DeleteIcon from "@material-ui/icons/Delete";
import ClearIcon from "@material-ui/icons/Clear";
import CommentInput from "../containers/CommentInput";

const styles = (theme: Theme): StyleRules =>
  createStyles({
    modal: {
      overflow: "auto",
      outline: "none"
    },
    modalContent: {
      outline: "none"
    },
    media: {
      objectFit: "contain",
      width: "80vw",
      margin: "auto",
      maxHeight: "30vh"
    },
    likeIcon: {
      width: "2rem",
      height: "2rem"
    },
    balloon: {
      position: "relative",
      display: "inline-block",
      maxWidth: "300px",
      padding: "8px 15px",
      background: "#f0f0f0",
      textAlign: "left",
      borderRadius: "15px",
      marginTop: "5px",
      wordBreak: "break-all",
      "&::after": {
        content: "''",
        border: "14px solid transparent",
        borderTopColor: "#f0f0f0",
        position: "absolute",
        top: "0"
      }
    },
    leftBalloon: {
      flexDirection: "row",
      marginRight: "auto",
      marginLeft: "30px",
      "&::after": {
        left: "-10px"
      }
    },
    commentInputArea: {
      marginTop: "10px"
    },
    modalFooter: {
      marginTop: "10px",
      width: "90vw",
      margin: "auto",
      display: "flex",
      justifyContent: "space-between"
    }
  });

interface Props extends WithStyles<typeof styles>, RouteComponentProps {
  auth?: any;
  open: boolean;
  selectedImageDetail: any;
  onClose: () => void;
  onLikeImage?: (detail: any) => void;
  onDislikeImage?: (detail: any) => void;
  onDeleteImage?: (detail: any) => void;
}

interface State {
  imageUser: any;
  isLiked: boolean;
  isOpenDeleteCheckDialog: boolean;
}
function getModalStyle() {
  return {
    backgroundColor: "white",
    width: "90vw",
    margin: "auto",
    marginTop: "10px",
    maxHeight: "70vh",
    overflow: "auto"
  };
}

/**
 * 画像詳細モーダル
 */
export class ImageDetailModal extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      imageUser: null,
      isLiked: false,
      isOpenDeleteCheckDialog: false
    };
  }

  /**
   * モーダル表示時の処理
   */
  onRendered = () => {
    User.getUserByIdRef(this.props.selectedImageDetail.uid).once(
      "value",
      snap => {
        if (snap && snap.val()) {
          this.setState({
            imageUser: snap.val()
          });
        }
      }
    );
    const liked = this.props.selectedImageDetail.liked
      ? Object.keys(this.props.selectedImageDetail.liked)
      : [];
    this.setState({
      isLiked:
        this.props.auth.additionalUserInfo.uid &&
        liked.includes(this.props.auth.additionalUserInfo.uid)
    });
  };

  /**
   * モーダル非表示時の処理
   */
  onCancel = () => {
    this.props.onClose();
  };

  /**
   * いいねボタン押下時の処理
   */
  clickLike = () => {
    if (!this.props.onLikeImage || !this.props.onDislikeImage) {
      return;
    }

    if (!this.state.isLiked) {
      this.props.onLikeImage(this.props.selectedImageDetail);
    } else {
      this.props.onDislikeImage(this.props.selectedImageDetail);
    }
    this.setState({
      isLiked: !this.state.isLiked
    });
  };

  /**
   * 削除確認メッセージの表示
   */
  handleOpenCheckDeleteDialog = () => {
    this.setState({
      isOpenDeleteCheckDialog: true
    });
  };

  /**
   * 削除確認メッセージの非表示
   */
  handleCloseCheckDeleteDialog = () => {
    this.setState({
      isOpenDeleteCheckDialog: false
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <Fragment>
        <Modal
          open={this.props.open}
          onRendered={this.onRendered}
          onBackdropClick={this.props.onClose}
          className={classes.modal}
        >
          <div className={classes.modalContent}>
            <div style={getModalStyle()}>
              <Card>
                <CardContent>
                  {this.state.imageUser && (
                    <UserCard user={this.state.imageUser} />
                  )}
                  <div
                    className={classNames(classes.balloon, classes.leftBalloon)}
                  >
                    {this.props.selectedImageDetail.comment}
                  </div>
                </CardContent>
                <CardMedia
                  component="img"
                  className={classes.media}
                  src={this.props.selectedImageDetail.url}
                  title="Contemplative Reptile"
                />
                <CommentsView
                  selectedImageDetail={this.props.selectedImageDetail}
                />
              </Card>
            </div>
            <div className={classes.commentInputArea}>
              <CommentInput
                selectedImageDetail={this.props.selectedImageDetail}
              />
            </div>
            <div className={classes.modalFooter}>
              {this.props.auth.additionalUserInfo.uid ===
                this.props.selectedImageDetail.uid && (
                <Button
                  onClick={this.handleOpenCheckDeleteDialog}
                  color="secondary"
                  variant="contained"
                  id="deleteButton"
                >
                  <DeleteIcon className={classes.likeIcon} color="action" />
                </Button>
              )}
              <Button
                onClick={this.clickLike}
                color="secondary"
                variant="contained"
                id="likeButton"
              >
                <FavoriteIcon
                  className={classes.likeIcon}
                  color={this.state.isLiked ? "primary" : "action"}
                />
              </Button>
              <Button
                color="secondary"
                variant="contained"
                id="closeButton"
                onClick={this.onCancel}
                className={classes.actionButton}
              >
                <ClearIcon color="action" />
              </Button>
            </div>
          </div>
        </Modal>
        <Dialog
          open={this.state.isOpenDeleteCheckDialog}
          onClose={this.handleCloseCheckDeleteDialog}
        >
          <DialogContent>
            <DialogContentText>本当に削除しますか？</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={this.handleCloseCheckDeleteDialog}
              color="primary"
            >
              キャンセル
            </Button>
            <Button
              onClick={() => {
                if (!this.props.onDeleteImage) {
                  return;
                }
                this.props.onDeleteImage(this.props.selectedImageDetail);
                this.handleCloseCheckDeleteDialog();
                this.props.onClose();
              }}
              color="primary"
            >
              削除
            </Button>
          </DialogActions>
        </Dialog>
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
    onLikeImage: (param: any) => {
      dispatch(uploadActions.likeImage.started(param));
    },
    onDislikeImage: (param: any) => {
      dispatch(uploadActions.dislikeImage.started(param));
    },
    onDeleteImage: (param: any) => {
      dispatch(uploadActions.deleteImage.started(param));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(ImageDetailModal)));
