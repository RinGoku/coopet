import React, { Component, Fragment } from "react";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, {
  WithStyles,
  StyleRules
} from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import {
  Paper,
  Card,
  TextField,
  MenuItem,
  Modal,
  CardMedia,
  CardContent,
  Typography,
  Button
} from "@material-ui/core";
import { withRouter, RouteComponentProps } from "react-router-dom";
import classNames from "classnames";
import UploadedImage from "../utils/UploadedImage";
import Loading from "./Loading";
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
    cardContent: {
      textAlign: "center",
      height: "30vh",
      overflow: "auto"
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
    },
    media: {
      objectFit: "cover",
      width: "80vw",
      margin: "auto",
      padding: "20px"
    },
    balloonRight: {
      position: "relative",
      display: "inline-block",
      padding: "7px 10px",
      minWidth: "120px",
      maxWidth: "100%",
      color: "#555",
      fontSize: "16px",
      background: "#e0edff",
      "&::before": {
        content: '""',
        position: "absolute",
        top: "50%",
        left: "100%",
        marginTop: "-15px",
        border: "15px solid transparent",
        borderLeft: "15px solid #e0edff"
      }
    },
    balloonLeft: {
      position: "relative",
      display: "inline-block",
      padding: "7px 10px",
      minWidth: "120px",
      maxWidth: "100%",
      color: "#555",
      fontSize: "16px",
      background: "#ff8e9d",
      "&::before": {
        content: '""',
        position: "absolute",
        top: "50%",
        left: "-30px",
        marginTop: "-15px",
        border: "15px solid transparent",
        borderRight: "15px solid #e0edff"
      }
    },
    commentWrapperLeft: {
      textAlign: "left",
      margin: "10px"
    },
    commentWrapperRight: {
      textAlign: "right",
      margin: "10px"
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
  onCommentImage: (param: {
    uid: any;
    petSpecies: string;
    key: string;
    comment: string;
  }) => void;
  onLogout: () => void;
  onStoreUserInfo: (p: any) => void;
}

type UploadedImageInfo = {
  url: string;
  comment: string;
};

interface State {
  selectedSpecies: string;
  viewedImages: any[];
  isOpenImageDetailModal: boolean;
  selectedImageDetail: any;
  postComment: string;
}

function getModalStyle() {
  return {
    backgroundColor: "white",
    width: "90vw",
    margin: "auto",
    marginTop: "10px"
  };
}

let userInfo: any;
let additionalUserInfo: any;
class ImageView extends Component<Props, State> {
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
      viewedImages: [],
      isOpenImageDetailModal: false,
      selectedImageDetail: {},
      postComment: ""
    };
    UploadedImage.getUploadedImageBySpeciesRef(this.state.selectedSpecies).on(
      "value",
      snap => {
        if (!snap || !snap.val()) {
          return;
        }
        const result = snap.val();
        console.log(result);
        this.setState({
          viewedImages: Object.keys(result)
            .filter(key => {
              const inner = Object.keys(result[key])[0];
              return inner !== userInfo.uid;
            })
            .map(key => {
              const inner = result[key];
              const image = inner[Object.keys(inner)[0]];
              image["uid"] = Object.keys(inner)[0];
              image["key"] = key;
              return image;
            })
        });
      }
    );
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
    UploadedImage.getUploadedImageBySpeciesRef(
      this.state.selectedSpecies
    ).off();
    // UploadedImage.getMyUploadedImageRef(userInfo.uid).off();
  }

  handleChange = (name: string) => (event: any) => {
    const obj: any = {};
    obj[name] = event.target.value;
    this.setState(obj);
  };

  handleSpeciesSelectChange = () => (event: any) => {
    const selectedValue = event.target.value;
    UploadedImage.getUploadedImageBySpeciesRef(
      this.state.selectedSpecies
    ).off();
    UploadedImage.getUploadedImageBySpeciesRef(selectedValue).on(
      "value",
      snap => {
        if (!snap || !snap.val()) {
          return;
        }
        console.log(snap);
        const result = snap.val();
        this.setState({
          viewedImages: Object.keys(result)
            .filter(key => {
              const inner = Object.keys(result[key])[0];
              return inner !== userInfo.uid;
            })
            .map(key => {
              const inner = result[key];
              const image = inner[Object.keys(inner)[0]];
              image["uid"] = Object.keys(inner)[0];
              image["key"] = key;
              return image;
            })
        });
      }
    );
    this.setState({
      selectedSpecies: selectedValue
    });
  };

  handleOpenImageDetailModal = (selectedImageDetail: any) => {
    UploadedImage.getUploadedImageCommentedsRef(
      this.state.selectedSpecies,
      selectedImageDetail.key,
      selectedImageDetail.uid
    ).on("value", snap => {
      let commenteds = [];
      if (snap && snap.val()) {
        const result = snap.val();
        console.log("result", result);
        commenteds = Object.keys(result).map(key => {
          const inner = result[key];
          const comment = inner[Object.keys(inner)[0]];
          comment["uid"] = Object.keys(inner)[0];
          comment["key"] = key;
          return comment;
        });
      }
      selectedImageDetail["commenteds"] = commenteds;
      if (!this.state.isOpenImageDetailModal) {
        this.setState({
          selectedImageDetail: selectedImageDetail,
          isOpenImageDetailModal: true
        });
      }
    });
  };

  handleCloseImageDetailModal = () => {
    this.setState({
      isOpenImageDetailModal: false
    });
  };

  commentUploadedImage = () => {
    console.log(this.state.selectedImageDetail);
    this.props.onCommentImage({
      comment: this.state.postComment,
      uid: this.state.selectedImageDetail.uid,
      key: this.state.selectedImageDetail.key,
      petSpecies: this.state.selectedSpecies
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
          {this.state.viewedImages && this.state.viewedImages.length !== 0 && (
            <Card className={classNames(classes.flex, classes.card)}>
              {this.state.viewedImages.map((uploaded, i) => (
                <div className={classes.uploadedImageWrap} key={i}>
                  <img
                    onClick={() => this.handleOpenImageDetailModal(uploaded)}
                    alt={uploaded.comment}
                    className={classes.uploadedImage}
                    src={uploaded.url}
                  />
                </div>
              ))}
            </Card>
          )}
        </Paper>
        <Modal
          aria-labelledby="simple-modal-title2"
          aria-describedby="simple-modal-description2"
          open={this.state.isOpenImageDetailModal}
          onClose={this.handleCloseImageDetailModal}
        >
          <div style={getModalStyle()}>
            <Card>
              <CardMedia
                component="img"
                className={classes.media}
                src={this.state.selectedImageDetail.url}
                title="Contemplative Reptile"
              />
              <CardContent className={classes.cardContent}>
                <Typography>
                  {this.state.selectedImageDetail.comment}
                </Typography>
                {this.state.selectedImageDetail &&
                  this.state.selectedImageDetail.commenteds &&
                  this.state.selectedImageDetail.commenteds.map(
                    (commented: any, i: number) => {
                      if (commented.uid === userInfo.uid) {
                        return (
                          <div className={classes.commentWrapperRight} key={i}>
                            <div className={classes.balloonLeft}>
                              <Typography>{commented.comment}</Typography>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className={classes.commentWrapperLeft} key={i}>
                            <div className={classes.balloonRight}>
                              <Typography>{commented.comment}</Typography>
                            </div>
                          </div>
                        );
                      }
                    }
                  )}
                <div>
                  <TextField
                    id="outlined-multiline-static"
                    label="コメント"
                    multiline
                    rows="2"
                    defaultValue=""
                    onChange={this.handleChange("postComment")}
                    className={classes.textField}
                    margin="normal"
                    variant="outlined"
                  />
                </div>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={this.commentUploadedImage}
                >
                  投稿
                </Button>
              </CardContent>
            </Card>
          </div>
        </Modal>
      </Fragment>
    );
  }
}

export default withStyles(styles)(withRouter(ImageView));
