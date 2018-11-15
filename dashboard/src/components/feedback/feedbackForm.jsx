/* Icons and Text for Icons */

import React, { Component } from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FeedbackIcon from '@material-ui/icons/Feedback';


//Dialogue
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


class FeedbackForm extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      open: false,
    };
  }

  handleClick() {
    this.setState({ open: true });
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    return (
      <div>
        <div>
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
          >
          <DialogTitle id="form-dialog-title">Feedback</DialogTitle>
          <DialogContent>
            <DialogContentText>
              What do you think about it? Tell us and we will improve it.
            </DialogContentText>
             <TextField
              autoFocus
              margin="dense"
              id="name"
              //label=""
              type="text"
              fullWidth
            />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                Submit
            </Button>
              <Button onClick={this.handleClose} color="primary">
                Cancel
            </Button>
          </DialogActions>
          </Dialog>
        </div>
        <ListItem button onClick={this.handleClick}>
          <ListItemIcon>
            <FeedbackIcon />
          </ListItemIcon>
          <ListItemText primary="Feedback" />
        </ListItem>

      </div>
    )
  }
}

export default FeedbackForm;
