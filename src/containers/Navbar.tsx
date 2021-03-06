import { connect } from "react-redux";
import { Action, Dispatch } from "redux";

import { RootState } from "../modules";

import React, { Component } from "react";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, {
  WithStyles,
  StyleRules
} from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { AppBar, MenuItem, Drawer } from "@material-ui/core";
import { Toolbar, IconButton } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import logo from "../assets/images/logo.png";

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      textAlign: "center"
    },
    toolbar: {
      padding: 0
    },
    paragraph: {
      fontFamily: "serif",
      padding: theme.spacing.unit * 2
    },
    menuButton: {
      marginLeft: theme.spacing.unit
    },
    logo: {
      height: "60px",
      position: "absolute",
      margin: "auto",
      right: 0,
      left: 0
    }
  });

interface Props extends WithStyles<typeof styles> {
  menuItems?: any[];
  open?: boolean;
  onOpen?: () => void;
  onBackdropClick?: () => void;
}
interface MenuItem {
  menuLabel: string;
  func: () => void;
}

/**
 * ナビゲーションバー
 */
class Navbar extends Component<Props> {
  /**
   * 表示するメニュー項目を表示
   */
  createMenuItem() {
    if (!this.props.menuItems || this.props.menuItems.length === 0) {
      return null;
    }
    return this.props.menuItems.map((item, index) => (
      <MenuItem onClick={item.func} key={index}>
        {item.menuLabel}
      </MenuItem>
    ));
  }
  render() {
    const { classes } = this.props;
    return (
      <div>
        {this.props.menuItems && this.props.menuItems.length > 0 && (
          <Drawer
            open={this.props.open}
            ModalProps={{
              onBackdropClick: () => {
                this.props.onBackdropClick && this.props.onBackdropClick();
              }
            }}
          >
            {this.createMenuItem()}
          </Drawer>
        )}
        <AppBar color="secondary">
          <Toolbar className={classes.toolbar}>
            {this.props.menuItems && this.props.menuItems.length > 0 && (
              <IconButton
                onClick={this.props.onOpen}
                color="inherit"
                aria-label="Menu"
                className={classes.menuButton}
              >
                <MenuIcon />
              </IconButton>
            )}
            <img alt="logo" src={logo} className={classes.logo} />
          </Toolbar>
        </AppBar>
      </div>
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
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Navbar));
