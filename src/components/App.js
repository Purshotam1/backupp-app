import React, { Component } from 'react';
import styled from 'styled-components';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import {
  setImageProgressBar,
  setImageAlert,
  setImageAlertFile,
  setImageReset
} from '../redux/actions/image';

import {
  setDocumentProgressBar,
  setDocumentAlertFile,
  setDocumentAlert,
  setDocumentReset
} from '../redux/actions/document';

import {
  setSongProgressBar,
  setSongAlertFile,
  setSongAlert,
  setSongReset
} from '../redux/actions/song';
import Images from './Images';
import Documents from './Documents';
import Songs from './Songs'

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;


const MainContainerStyle = styled.div`

  display: flex;
  flex-wrap: wrap;
  background-color: #3a7e9a;
  color: white;

  * {
    box-sizing: border-box
  }
  
  .col-md-2, .col-md-10 {
    padding-left: 0px;
    padding-right: 0px;
  }

  .col-md-2 {
    border-right: 2px solid white;
    position: sticky;
    z-index: 1000;
    align-self: flex-start;
    top: 0;
    left: 0;
  }
`
const SideMenuStyle = styled.div`
  height: 100vh;

  h2 {
    margin-top: 10%;
    text-align: center;
    margin-bottom: 10%;
  }

  .row {
    margin-top: 10px;
  }

  .col {
    padding-left: 0px;
    padding-right: 0px;
  }

  .btn {
    display: block;
    width: 100%;
    height: 100%;
    background-color: #3a7e9a;
    color: white;
    border: none;
    :hover {
      background-color: #dae0e5;
      color: #212529;
    }
  }

`

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      toggle_tab: 0,
      deviceConnected: true,
      imageKey: 0,
      documentKey: 0,
      songKey: 0
    }
  }

  componentDidMount() {
    ipcRenderer.on('image-downloaded-file-id', (event, arg) => {
      this.props.setImageProgressBar(arg);
    })
    ipcRenderer.on('image-file-exist', (event, arg) => {
      this.props.setImageAlert(true);
      this.props.setImageAlertFile(arg.replace(/^.*[\\\/]/, ''));
    })
    ipcRenderer.on('document-downloaded-file-id', (event, arg) => {
      this.props.setDocumentProgressBar(arg);
    })
    ipcRenderer.on('document-file-exist', (event, arg) => {
      this.props.setDocumentAlert(true);
      this.props.setDocumentAlertFile(arg.replace(/^.*[\\\/]/, ''));
    })
    ipcRenderer.on('song-downloaded-file-id', (event, arg) => {
      this.props.setSongProgressBar(arg);
    })
    ipcRenderer.on('song-file-exist', (event, arg) => {
      this.props.setSongAlert(true);
      this.props.setSongAlertFile(arg.replace(/^.*[\\\/]/, ''));
    })
    ipcRenderer.on('device-not-connected', (event) => {
      this.setState({
          deviceConnected: false
      })
    })
    ipcRenderer.on('reset', (event) => {
      this.props.setDocumentReset();
      this.props.setImageReset();
      this.props.setSongReset();
      this.setState({
        imageKey: this.state.imageKey+1,
        documentKey: this.state.documentKey+1,
        songKey: this.state.songKey+1
      })
    })
  }

  toggleImages = () => {
    this.setState({
      toggle_tab: 0
    });
  }

  toggleDocuments = () => {
    this.setState({
      toggle_tab: 1
    });
  }

  toggleSongs = () => {
    this.setState({
      toggle_tab: 2
    });
  }

  toggleTabs = () => {
    const {
      toggle_tab,
      imageKey,
      documentKey,
      songKey
    } = this.state;

    switch (toggle_tab) {
      case 0:
      {
        return (<Images key={imageKey} />);
      }
      case 1:
      {
        return (<Documents key={documentKey} />);
      }
      case 2:
      {
        return (<Songs key={songKey} />);
      }
      default:
        return null;
    }
  }

  tryAgain = () => {
    this.setState({
      deviceConnected: true
    })
  }

  render() {

    const {
      toggle_tab,
      deviceConnected
    } = this.state;

    if (!deviceConnected) {
      return (
          <>
              <h1>
                  Device Not Connected
                  <Button variant="outline-danger" onClick={this.tryAgain}>
                      Try Again
                  </Button>
              </h1>
          </>
      )
    }

    return (
      <MainContainerStyle>
        <Container fluid>
          <Row>
            <Col md={2}>
              <SideMenuStyle>  
                <Container>
                  <Row>
                    <Col rowSpan={2}>
                      <h2>Backup</h2>
                    </Col>
                  </Row>
                  <br/>
                  <br/>
                  <Row>
                    <Col>
                      <Button active={toggle_tab==0} variant="light" onClick={this.toggleImages}>
                        Images
                      </Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Button active={toggle_tab==1} variant="light" onClick={this.toggleDocuments}>
                        Documents
                      </Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Button active={toggle_tab==2} variant="light" onClick={this.toggleSongs}>
                        Songs
                      </Button>
                    </Col>
                  </Row>
                </Container>
              </SideMenuStyle>
            </Col>
            <Col md={10}>
              {
                this.toggleTabs()
              }
            </Col>
          </Row>
        </Container>
      </MainContainerStyle>
    );
  }
}

function mapStateToProps(state) {
  return {
      image: state.image
  }
}

export default connect(mapStateToProps, { 
  setImageProgressBar,
  setImageAlert,
  setImageAlertFile,
  setImageReset,
  setDocumentProgressBar,
  setDocumentAlert,
  setDocumentAlertFile,
  setDocumentReset,
  setSongProgressBar,
  setSongAlertFile,
  setSongAlert,
  setSongReset
})(App);
